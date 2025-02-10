import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { WalletAnalysis } from './WalletAnalysis';

export function TokenAnalysis({ tokenAddress, tokenSymbol, onClose }) {
  const [tokenData, setTokenData] = useState(null);
  const [holders, setHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [walletTrades, setWalletTrades] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const API_KEY = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
      const [tokenResponse, holdersResponse] = await Promise.all([
        axios.get(`https://data.solanatracker.io/tokens/${tokenAddress}`, {
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`https://data.solanatracker.io/tokens/${tokenAddress}/holders/top`, {
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      setTokenData(tokenResponse.data);
      setHolders(holdersResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching token data:', err);
      setError('Failed to load token data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tokenAddress]);

  const formatNumber = (num) => {
    if (!num) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: num < 1 ? 4 : 0,
      maximumFractionDigits: num < 1 ? 4 : 0
    }).format(num);
  };

  const formatPercentage = (num) => {
    if (!num) return '0%';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'exceptZero'
    }).format(num / 100);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleWalletClick = async (address) => {
    setSelectedWallet(address);
    setWalletLoading(true);

    try {
      const API_KEY = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
      const [walletResponse, tradesResponse] = await Promise.all([
        axios.get(`https://data.solanatracker.io/wallet/${address}`, {
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`https://data.solanatracker.io/wallet/${address}/trades`, {
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      setWalletData(walletResponse.data);
      setWalletTrades(tradesResponse.data.trades || []);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCloseWalletAnalysis = () => {
    setSelectedWallet(null);
    setWalletData(null);
    setWalletTrades([]);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}
      >
        <div style={{ marginBottom: '1rem' }}>Loading {tokenSymbol} Analysis...</div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto'
          }}
        />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#ff6b6b'
        }}
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        color: 'white',
        padding: '2rem'
      }}
    >
      {/* Token Overview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <img
            src={tokenData?.token?.image}
            alt={tokenData?.token?.symbol}
            style={{ width: '48px', height: '48px', borderRadius: '24px' }}
            onError={(e) => e.target.style.display = 'none'}
          />
          <div>
            <h3 style={{ margin: 0 }}>{tokenData?.token?.symbol}</h3>
            <div style={{ opacity: 0.7 }}>{tokenData?.token?.name}</div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Price</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {formatNumber(tokenData?.pools?.[0]?.price?.usd)}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>24h Volume</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {formatNumber(tokenData?.pools?.[0]?.txns?.volume)}
            </div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Market Cap</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {formatNumber(tokenData?.pools?.[0]?.marketCap?.usd)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Price Changes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <h3 style={{ 
          margin: '0 0 1rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          Price Changes
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '1rem'
        }}>
          {['1h', '4h', '12h', '24h'].map(interval => (
            <div key={interval}>
              <div style={{ opacity: 0.7, marginBottom: '0.5rem' }}>{interval}</div>
              <div style={{
                color: (tokenData?.events?.[interval]?.priceChangePercentage || 0) >= 0 ? '#4caf50' : '#ff5252',
                fontWeight: 'bold'
              }}>
                {formatPercentage(tokenData?.events?.[interval]?.priceChangePercentage)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Holders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '1.5rem'
        }}
      >
        <h3 style={{ 
          margin: '0 0 1rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.5rem'
        }}>
          Top Holders
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {holders.slice(0, 10).map((holder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleWalletClick(holder.address)}
              style={{
                padding: '0.8rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                display: 'grid',
                gridTemplateColumns: '30px 1fr 1fr 1fr',
                gap: '1rem',
                alignItems: 'center',
                background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
              }}
              whileHover={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <div style={{ opacity: 0.7 }}>#{index + 1}</div>
              <div style={{ fontFamily: 'monospace' }}>{formatAddress(holder.address)}</div>
              <div style={{ textAlign: 'right' }}>{formatPercentage(holder.percentage)}</div>
              <div style={{ textAlign: 'right' }}>{formatNumber(holder.value?.usd)}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {selectedWallet && (
        <WalletAnalysis
          walletAddress={selectedWallet}
          walletData={walletData}
          walletTrades={walletTrades}
          isLoading={walletLoading}
          onClose={handleCloseWalletAnalysis}
        />
      )}
    </motion.div>
  );
}

export default TokenAnalysis; 