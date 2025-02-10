import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_KEY = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
const BASE_URL = 'https://data.solanatracker.io';
const API_HEADERS = {
  'x-api-key': API_KEY,
  'Accept': 'application/json'
};

const ALERT_TYPES = {
  HOT_MOMENTUM: {
    title: '🔥 Hot Token Alert',
    getMsg: (symbol, price, change, volume, buys, sells) => 
      `${symbol} is heating up | $${price.toFixed(6)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%) | ${buys}/${sells} B/S | Vol: $${volume.toLocaleString()}`,
    type: 'momentum'
  },
  VOLUME_SPIKE: {
    title: '💰 Volume Surge',
    getMsg: (symbol, volume, buys, sells, multiplier) => 
      `${symbol} volume ${multiplier}x above average | ${buys} buys vs ${sells} sells | Vol: $${volume.toLocaleString()}`,
    type: 'volume'  
  },
  BREAKOUT: {
    title: '🚀 Breakout Signal',
    getMsg: (symbol, price, m5change, h1change, volume) =>
      `${symbol} breaking resistance | ${m5change >= 0 ? '+' : ''}${m5change.toFixed(2)}% 5m | ${h1change >= 0 ? '+' : ''}${h1change.toFixed(2)}% 1h | Vol: $${volume.toLocaleString()}`,
    type: 'breakout'
  },
  WHALE_MOVE: {
    title: '🐋 Whale Alert',
    getMsg: (symbol, price, volume, type, impact) =>
      `Whale ${type} on ${symbol} | $${price.toFixed(6)} | Impact: $${volume.toLocaleString()} (${impact}% of 1h vol)`,
    type: 'whale'
  },
  SMART_MONEY: {
    title: '🧠 Smart Money Flow',
    getMsg: (symbol, price, change, wallets) =>
      `Smart money accumulating ${symbol} | $${price.toFixed(6)} | ${change >= 0 ? '+' : ''}${change.toFixed(2)}% | ${wallets} active wallets`,
    type: 'smart'
  },
  REVERSAL: {
    title: '↩️ Potential Reversal',
    getMsg: (symbol, price, shortTrend, longTrend, volume) =>
      `${symbol} showing reversal signs | ${shortTrend} short-term vs ${longTrend} trend | Vol: $${volume.toLocaleString()}`,
    type: 'reversal'
  }
};

export function MarketActivity() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastStats, setLastStats] = useState(new Map());
  const [solPrice, setSolPrice] = useState(null);

  const containerStyle = {
    minWidth: '600px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif"
  };

  useEffect(() => {
    let mounted = true;

    const fetchSolPrice = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
        if (mounted && response.data.solana) {
          setSolPrice({
            price: response.data.solana.usd,
            change24h: response.data.solana.usd_24h_change
          });
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error);
      }
    };

    const analyzeMarket = async () => {
      try {
        // Get trending tokens from multiple timeframes
        const [trending5m, trending1h, trending24h] = await Promise.all([
          axios.get(`${BASE_URL}/tokens/trending/5m`, { headers: API_HEADERS }).then(res => res.data),
          axios.get(`${BASE_URL}/tokens/trending/1h`, { headers: API_HEADERS }).then(res => res.data),
          axios.get(`${BASE_URL}/tokens/trending/24h`, { headers: API_HEADERS }).then(res => res.data)
        ]);

        if (!mounted) return;

        const newAlerts = [];
        const processedTokens = new Set();
        const currentStats = new Map();

        // Analyze each trending token
        for (const token of trending5m.slice(0, 20)) {
          if (!mounted) break;
          if (processedTokens.has(token.token.mint)) continue;
          processedTokens.add(token.token.mint);

          const [stats, holders] = await Promise.all([
            axios.get(`${BASE_URL}/stats/${token.token.mint}`, { headers: API_HEADERS }).then(r => r.data),
            axios.get(`${BASE_URL}/tokens/${token.token.mint}/holders/top`, { headers: API_HEADERS })
              .then(r => r.data)
              .catch(() => null)
          ]);

          if (!stats || !stats['5m']) continue;

          const stats5m = stats['5m'];
          const stats1h = stats['1h'] || {};
          const stats24h = stats['24h'] || {};
          const symbol = token.token.symbol;
          
          currentStats.set(token.token.mint, stats);
          const previousStats = lastStats.get(token.token.mint);

          // Hot momentum with buy/sell ratio context
          if (stats5m.volume?.total > 10000 && Math.abs(stats5m.priceChangePercentage) > 3) {
            newAlerts.push({
              ...ALERT_TYPES.HOT_MOMENTUM,
              message: ALERT_TYPES.HOT_MOMENTUM.getMsg(
                symbol,
                stats5m.price,
                stats5m.priceChangePercentage,
                stats5m.volume.total,
                stats5m.buys,
                stats5m.sells
              ),
              timestamp: Date.now(),
              priority: Math.abs(stats5m.priceChangePercentage) * (stats5m.volume.total / 10000)
            });
          }

          // Volume spike with hourly comparison
          if (stats1h?.volume?.total) {
            const volumeMultiplier = (stats5m.volume.total * 12) / stats1h.volume.total;
            if (volumeMultiplier > 2) {
              newAlerts.push({
                ...ALERT_TYPES.VOLUME_SPIKE,
                message: ALERT_TYPES.VOLUME_SPIKE.getMsg(
                  symbol,
                  stats5m.volume.total,
                  stats5m.buys,
                  stats5m.sells,
                  volumeMultiplier.toFixed(1)
                ),
                timestamp: Date.now(),
                priority: volumeMultiplier * (stats5m.volume.total / 5000)
              });
            }
          }

          // Breakout with volume confirmation
          if (stats5m.priceChangePercentage > 0 && 
              stats1h?.priceChangePercentage > 0 && 
              stats5m.priceChangePercentage > stats1h.priceChangePercentage &&
              stats5m.volume.total > (stats1h.volume?.total || 0) / 8) {
            newAlerts.push({
              ...ALERT_TYPES.BREAKOUT,
              message: ALERT_TYPES.BREAKOUT.getMsg(
                symbol,
                stats5m.price,
                stats5m.priceChangePercentage,
                stats1h.priceChangePercentage,
                stats5m.volume.total
              ),
              timestamp: Date.now(),
              priority: stats5m.priceChangePercentage * (stats5m.volume.total / (stats1h.volume?.total || 1))
            });
          }

          // Whale moves with market impact
          const whaleThreshold = Math.max(5000, (stats1h.volume?.total || 0) * 0.1);
          if (stats5m.volume.buys > whaleThreshold || stats5m.volume.sells > whaleThreshold) {
            const whaleVolume = Math.max(stats5m.volume.buys, stats5m.volume.sells);
            const impact = ((whaleVolume / (stats1h.volume?.total || whaleVolume)) * 100).toFixed(1);
            newAlerts.push({
              ...ALERT_TYPES.WHALE_MOVE,
              message: ALERT_TYPES.WHALE_MOVE.getMsg(
                symbol,
                stats5m.price,
                whaleVolume,
                stats5m.volume.buys > stats5m.volume.sells ? 'buy' : 'sell',
                impact
              ),
              timestamp: Date.now(),
              priority: (whaleVolume / (stats1h.volume?.total || whaleVolume)) * 100
            });
          }

          // Smart money tracking
          if (holders && stats5m.volume.total > 5000 && stats5m.buys > stats5m.sells * 1.5) {
            const activeWallets = holders.filter(h => h.value?.usd > 1000).length;
            if (activeWallets > 5) {
              newAlerts.push({
                ...ALERT_TYPES.SMART_MONEY,
                message: ALERT_TYPES.SMART_MONEY.getMsg(
                  symbol,
                  stats5m.price,
                  stats5m.priceChangePercentage,
                  activeWallets
                ),
                timestamp: Date.now(),
                priority: activeWallets * (stats5m.volume.total / 10000)
              });
            }
          }

          // Trend reversal detection
          if (previousStats && previousStats['1h']) {
            const prevTrend = previousStats['1h'].priceChangePercentage < 0;
            const currentTrend = stats5m.priceChangePercentage > 2;
            if (prevTrend && currentTrend && stats5m.volume.total > (stats1h.volume?.total || 0) / 10) {
              newAlerts.push({
                ...ALERT_TYPES.REVERSAL,
                message: ALERT_TYPES.REVERSAL.getMsg(
                  symbol,
                  stats5m.price,
                  currentTrend ? 'bullish' : 'bearish',
                  prevTrend ? 'bearish' : 'bullish',
                  stats5m.volume.total
                ),
                timestamp: Date.now(),
                priority: Math.abs(stats5m.priceChangePercentage) * (stats5m.volume.total / (stats1h.volume?.total || 1))
              });
            }
          }
        }

        if (mounted) {
          setLastStats(currentStats);
          // Sort by priority and timestamp
          newAlerts.sort((a, b) => b.priority - a.priority || b.timestamp - a.timestamp);
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
          setLoading(false);
        }

      } catch (err) {
        console.error('Error analyzing market:', err);
        if (mounted) setLoading(false);
      }
    };

    fetchSolPrice();
    analyzeMarket();

    const priceInterval = setInterval(fetchSolPrice, 30000);
    const marketInterval = setInterval(analyzeMarket, 30000);

    return () => {
      mounted = false;
      clearInterval(priceInterval);
      clearInterval(marketInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      {/* SOL Price Section */}
      {solPrice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          <div>
            <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>SOL Price</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              ${solPrice.price.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>24h Change</div>
            <div style={{ 
              fontSize: '1.2rem', 
              color: solPrice.change24h >= 0 ? '#4caf50' : '#ff5252',
              fontWeight: 'bold'
            }}>
              {solPrice.change24h >= 0 ? '+' : ''}{solPrice.change24h.toFixed(2)}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Market Alerts Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        padding: '1.5rem'
      }}>
        <h2 style={{ 
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          Live Market Activity
        </h2>

        {loading ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ textAlign: 'center', padding: '2rem' }}
          >
            Analyzing market activity...
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  color: alert.type === 'momentum' ? '#ffa726' :
                         alert.type === 'volume' ? '#29b6f6' :
                         alert.type === 'breakout' ? '#66bb6a' :
                         alert.type === 'whale' ? '#ba68c8' :
                         alert.type === 'smart' ? '#5c6bc0' :
                         alert.type === 'reversal' ? '#f06292' : 'white'
                }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  {alert.message}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.7,
                  marginTop: '0.5rem'
                }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
} 