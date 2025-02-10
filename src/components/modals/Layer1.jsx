import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import TokenAnalysis from './TokenAnalysis';

export function Layer1() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const priceRefs = useRef(new Map());
  const wsRef = useRef(null);
  const subscribedTokensRef = useRef(new Set());

  const containerStyle = {
    minWidth: '600px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif"
  };

  const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem'
  };

  const statCard = {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '1.5rem',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const networkStats = [
    {
      label: "Total Value Locked",
      value: "$142.5M",
      change: "+5.2%",
      isPositive: true
    },
    {
      label: "24h Volume",
      value: "$28.3M",
      change: "+12.8%",
      isPositive: true
    },
    {
      label: "Transactions (24h)",
      value: "523,891",
      change: "+3.4%",
      isPositive: true
    },
    {
      label: "Average Gas Fee",
      value: "0.0023 ETH",
      change: "-12.5%",
      isPositive: true
    }
  ];

  const features = [
    {
      title: "Real-Time Market Analysis",
      description: "Powered by Deep Seek AI, providing instant analysis of token movements, price actions, and market sentiment across the Solana ecosystem."
    },
    {
      title: "Wallet Integration",
      description: "Seamless Phantom wallet connection with detailed portfolio tracking, transaction history, and real-time balance updates."
    },
    {
      title: "Advanced Token Analytics",
      description: "Deep dive into any token's metrics including price movements, holder distribution, trading volume, and market impact analysis."
    },
    {
      title: "Top Traders Leaderboard",
      description: "Track and analyze the most successful traders with detailed wallet analysis and trading patterns."
    },
    {
      title: "Live Market Activity",
      description: "Real-time monitoring of market movers, volume spikes, breakout signals, and whale movements with instant alerts."
    },
    {
      title: "Smart Money Tracking",
      description: "AI-powered tracking of institutional movements and smart money flows, helping identify profitable trading opportunities."
    }
  ];

  const subscribeToToken = (token) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const poolId = token.pools?.[0]?.poolId;
    if (poolId && !subscribedTokensRef.current.has(poolId)) {
      wsRef.current.send(JSON.stringify({
        type: 'join',
        room: `pool:${poolId}`
      }));
      subscribedTokensRef.current.add(poolId);
    }
  };

  const fetchTokens = async () => {
    try {
      const API_KEY = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
      const response = await axios.get('https://data.solanatracker.io/tokens/volume', {
        headers: { 'x-api-key': API_KEY }
      });
      
      setTokens(response.data);
      setError(null);
      
      response.data.forEach(token => {
        priceRefs.current.set(token.token.mint, token.pools?.[0]?.price?.usd || 0);
        subscribeToToken(token);
      });
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load token data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ws = new WebSocket('wss://datastream.solanatracker.io/69826d9e-88f4-4d38-ba1e-88a16bfaa362');

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      tokens.forEach(subscribeToToken);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'message' && message.data) {
          setTokens(prevTokens => {
            return prevTokens.map(token => {
              if (token.pools?.[0]?.poolId === message.data.poolId) {
                const oldPrice = priceRefs.current.get(token.token.mint);
                const newPrice = message.data.price?.usd;
                
                if (newPrice) {
                  priceRefs.current.set(token.token.mint, newPrice);
                }

                return {
                  ...token,
                  marketCap: message.data.marketCap,
                  price: message.data.price,
                  priceChange: newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null
                };
              }
              return token;
            });
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    wsRef.current = ws;

    return () => {
      subscribedTokensRef.current.clear();
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    fetchTokens();
    const refreshInterval = setInterval(fetchTokens, 60000);
    return () => clearInterval(refreshInterval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: num < 1 ? 4 : 0,
      maximumFractionDigits: num < 1 ? 4 : 0
    }).format(num);
  };

  const handleTokenClick = (token) => {
    setSelectedToken(token);
  };

  const handleCloseAnalysis = () => {
    setSelectedToken(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      {loading ? (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ textAlign: 'center', padding: '2rem' }}
        >
          Loading token data...
        </motion.div>
      ) : error ? (
        <motion.div style={{ color: '#ff6b6b', padding: '2rem', textAlign: 'center' }}>
          {error}
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tokens.slice(0, 20).map((token, index) => (
            <motion.div
              key={token.token.mint}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleTokenClick(token)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '1rem',
                alignItems: 'center'
              }}
              whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div style={{ opacity: 0.7 }}>{index + 1}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img
                  src={token.token.image}
                  alt={token.token.symbol}
                  style={{ width: '24px', height: '24px', borderRadius: '12px' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <span style={{ fontWeight: 'bold' }}>{token.token.symbol}</span>
              </div>
              <div style={{
                color: token.priceChange === 'up' ? '#4caf50' :
                       token.priceChange === 'down' ? '#ff5252' : 'white'
              }}>
                {formatNumber(token.pools?.[0]?.price?.usd)}
              </div>
              <div>
                {formatNumber(token.pools?.[0]?.txns?.volume || 0)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedToken && (
        <TokenAnalysis
          tokenAddress={selectedToken.token.mint}
          tokenSymbol={selectedToken.token.symbol}
          onClose={handleCloseAnalysis}
        />
      )}

      <h2 style={{ 
        marginTop: '3rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '0.5rem'
      }}>
        Key Features
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            style={{
              padding: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              scale: 1.02
            }}
          >
            <h3 style={{ 
              margin: 0,
              marginBottom: '0.5rem',
              color: '#4caf50'
            }}>
              {feature.title}
            </h3>
            <p style={{ 
              margin: 0,
              opacity: 0.8,
              lineHeight: '1.5',
              fontFamily: "'Cormorant Garamond', serif"
            }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 