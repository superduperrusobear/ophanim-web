import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { WalletAnalysis } from './WalletAnalysis';

// Add shortenAddress utility function
const shortenAddress = (address, startLength = 4, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

const CACHE_KEY = 'topDegensCache';
const WALLET_CACHE_KEY = 'walletDataCache';
const CACHE_DURATION = 30 * 1000; // 30 seconds
const WALLET_CACHE_DURATION = 60 * 1000; // 1 minute

// Modal component for wallet analysis
const WalletAnalysisModal = ({ address, onClose, walletData, walletTrades, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1000,
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={{
          background: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '15px',
          padding: '2rem',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
        >
          ×
        </button>
        <WalletAnalysis 
          walletAddress={address}
          walletData={walletData}
          walletTrades={walletTrades}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
};

export function Leaderboard() {
  const [traders, setTraders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletTrades, setWalletTrades] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [timeframe, setTimeframe] = useState('24h');
  const [stats, setStats] = useState({
    totalVolume: '0',
    activeTraders: '0',
    avgWinRate: '0%'
  });

  const containerStyle = {
    minWidth: '600px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif"
  };

  // Cache management functions
  const getCachedData = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  };

  const setCachedData = (data) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  const getWalletCache = (wallet) => {
    const cached = localStorage.getItem(`${WALLET_CACHE_KEY}_${wallet}`);
    if (!cached) return null;

    const { data, trades, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > WALLET_CACHE_DURATION) {
      localStorage.removeItem(`${WALLET_CACHE_KEY}_${wallet}`);
      return null;
    }
    return { data, trades };
  };

  const setWalletCache = (wallet, data, trades) => {
    localStorage.setItem(`${WALLET_CACHE_KEY}_${wallet}`, JSON.stringify({
      data,
      trades,
      timestamp: Date.now()
    }));
  };

  const fetchTraders = async () => {
    try {
      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setTraders(cachedData);
        setIsLoading(false);
        // Fetch fresh data in background
        fetchFreshData();
        return;
      }

      await fetchFreshData();
    } catch (err) {
      console.error('Error fetching traders:', err);
      setError('Failed to load top traders data');
      setIsLoading(false);
    }
  };

  const fetchFreshData = async () => {
    const API_KEY = process.env.REACT_APP_SOLANA_TRACKER_API_KEY || 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
    
    try {
      const response = await axios.get('https://data.solanatracker.io/top-traders/all', {
        params: {
          expandPnl: true,
          sortBy: 'total'
        },
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (!response.data?.wallets) {
        throw new Error('Invalid API response');
      }

      const formattedTraders = response.data.wallets.map(item => ({
        address: item.wallet,
        volume: formatUSD(item.summary.total),
        profit: formatPnL(item.summary.total),
        trades: (item.summary.totalWins || 0) + (item.summary.totalLosses || 0),
        winRate: formatPercentage(item.summary.winPercentage)
      }));

      setTraders(formattedTraders);
      setCachedData(formattedTraders);
      
      // Calculate statistics
      const totalVol = formattedTraders.reduce((sum, trader) => 
        sum + parseFloat(trader.volume.replace(/[^0-9.-]/g, '')), 0);
      const avgWin = formattedTraders.reduce((sum, trader) => 
        sum + parseFloat(trader.winRate.replace('%', '')), 0) / formattedTraders.length;
      
      setStats({
        totalVolume: formatUSD(totalVol),
        activeTraders: formattedTraders.length,
        avgWinRate: `${avgWin.toFixed(1)}%`
      });

      setError(null);
    } catch (err) {
      console.error('Error in fetchFreshData:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraders();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTraders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const formatUSD = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatPnL = (value) => {
    const formatted = formatUSD(value);
    return value >= 0 ? `+${formatted}` : formatted;
  };

  const formatPercentage = (value) => {
    return (value || 0).toFixed(1) + '%';
  };

  const handleWalletClick = async (address) => {
    // Debounce clicks
    const now = Date.now();
    if (now - lastClickTime < 500) return;
    setLastClickTime(now);

    setSelectedWallet(address);
    setWalletLoading(true);

    try {
      // Check cache first
      const cached = getWalletCache(address);
      if (cached) {
        setWalletData(cached.data);
        setWalletTrades(cached.trades);
        setWalletLoading(false);
        
        // Fetch fresh data in background
        fetchWalletData(address, true);
        return;
      }

      await fetchWalletData(address);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setWalletLoading(false);
    }
  };

  const fetchWalletData = async (address, isBackground = false) => {
    try {
      const API_KEY = process.env.REACT_APP_SOLANA_TRACKER_API_KEY || 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
      
      const [walletResponse, tradesResponse] = await Promise.all([
        axios.get(`https://data.solanatracker.io/wallet/${address}`, {
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`https://data.solanatracker.io/wallet/${address}/trades`, {
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      const walletData = walletResponse.data;
      const trades = tradesResponse.data.trades.slice(0, 5);

      if (!isBackground || selectedWallet === address) {
        setWalletData(walletData);
        setWalletTrades(trades);
        setWalletLoading(false);
      }

      setWalletCache(address, walletData, trades);
    } catch (err) {
      console.error('Error in fetchWalletData:', err);
      if (!isBackground) {
        throw err;
      }
    }
  };

  const TimeframeSelector = () => (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '0.5rem',
      borderRadius: '20px'
    }}>
      {['24h', '7d', '30d'].map((tf) => (
        <motion.button
          key={tf}
          onClick={() => setTimeframe(tf)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: timeframe === tf ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '15px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          {tf === '24h' ? '24H' : tf === '7d' ? '7D' : '30D'}
        </motion.button>
      ))}
    </div>
  );

  const handleCloseWalletAnalysis = () => {
    setSelectedWallet(null);
  };

  if (isLoading) {
    return (
      <div style={{
        ...containerStyle,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid white',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...containerStyle,
        textAlign: 'center',
        padding: '2rem'
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: '#ff6b6b',
            background: 'rgba(255, 107, 107, 0.1)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1rem'
          }}
        >
          {error}
        </motion.div>
        <motion.button
          onClick={fetchTraders}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '20px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Try Again
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          margin: 0,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          Top Traders
        </h2>
        <TimeframeSelector />
      </div>

      {/* Headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 1fr',
        gap: '1rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px 10px 0 0',
        fontWeight: 'bold',
        fontSize: '0.9rem'
      }}>
        <div>Rank</div>
        <div>Wallet</div>
        <div>Volume</div>
        <div>Profit</div>
        <div>Trades</div>
        <div>Win Rate</div>
      </div>

      {/* Trader rows */}
      {traders.map((trader, index) => (
        <motion.div
          key={trader.address}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{
            background: 'rgba(255, 255, 255, 0.08)'
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '0.5fr 2fr 1fr 1fr 1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            cursor: 'pointer'
          }}
          onClick={() => handleWalletClick(trader.address)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: 'bold',
            color: index < 3 ? '#ffd700' : 'inherit'
          }}>
            #{index + 1}
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>{shortenAddress(trader.address)}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(trader.address);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}
              title="Copy full address"
            >
              📋
            </motion.button>
          </div>
          <div>{trader.volume}</div>
          <div style={{ color: trader.profit.startsWith('+') ? '#4caf50' : '#ff5252' }}>
            {trader.profit}
          </div>
          <div>{trader.trades}</div>
          <div>{trader.winRate}</div>
        </motion.div>
      ))}

      {/* Stats Summary */}
      <div style={{
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem'
      }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Total Volume</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.totalVolume}</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Active Traders</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.activeTraders}</div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}
        >
          <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Avg. Win Rate</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.avgWinRate}</div>
        </motion.div>
      </div>

      {/* Wallet Analysis Modal */}
      <AnimatePresence>
        {selectedWallet && (
          <WalletAnalysisModal
            address={selectedWallet}
            onClose={handleCloseWalletAnalysis}
            walletData={walletData}
            walletTrades={walletTrades}
            isLoading={walletLoading}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
} 