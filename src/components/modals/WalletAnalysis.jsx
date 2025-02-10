import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './WalletAnalysis.css';

// Add shortenAddress utility function
const shortenAddress = (address, startLength = 4, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Add custom scrollbar styles
const scrollbarStyle = {
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)',
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.4)'
    }
  }
};

export const WalletAnalysis = ({ walletAddress, walletData, walletTrades, isLoading, onClose }) => {
  const formatUSD = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSolanaImage = (token) => {
    if (!token) return '';
    if (token.symbol === 'SOL' || token.mint === 'So11111111111111111111111111111111111111112') {
      return 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
    }
    return token.image || '';
  };

  if (isLoading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: 'white',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTop: '4px solid white',
            borderRadius: '50%'
          }}
        />
        <div style={{ opacity: 0.7 }}>Loading wallet data...</div>
      </div>
    );
  }

  if (!walletData || !walletData.tokens) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: 'white',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ opacity: 0.7 }}>No wallet data available</div>
      </div>
    );
  }

  const topTokens = [...(walletData.tokens || [])]
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 20);

  return (
    <div className="wallet-analysis" style={{ color: 'white', padding: '20px' }}>
      {/* Wallet Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '15px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '10px'
        }}>
          <h3 style={{ margin: 0 }}>
            Wallet Overview - {shortenAddress(walletAddress)}
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard.writeText(walletAddress)}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '5px' }}>Total Value</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{formatUSD(walletData.total || 0)}</div>
          </div>
          <div>
            <div style={{ opacity: 0.7, marginBottom: '5px' }}>SOL Balance</div>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>{(walletData.totalSol || 0).toFixed(4)} SOL</div>
          </div>
        </div>
      </motion.div>

      {/* Top Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
          Top Holdings
        </h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {topTokens.map((token, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '30px 40px 1fr auto',
                gap: '10px',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
              }}
            >
              <div style={{ opacity: 0.7 }}>#{index + 1}</div>
              <img
                src={getSolanaImage(token.token)}
                alt={token.token?.symbol || ''}
                style={{ width: '24px', height: '24px', borderRadius: '12px' }}
                onError={(e) => e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'}
              />
              <div>
                <div style={{ fontWeight: 'bold' }}>{token.token?.symbol || 'Unknown'}</div>
                <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{(token.balance || 0).toFixed(4)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>{formatUSD(token.value || 0)}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Trades */}
      {walletTrades && walletTrades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '20px'
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
            Recent Trades
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {walletTrades.map((trade, index) => (
              <motion.div
                key={trade.tx || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  background: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={getSolanaImage(trade.from?.token)}
                      alt={trade.from?.token?.symbol || ''}
                      style={{ width: '20px', height: '20px', borderRadius: '10px' }}
                      onError={(e) => e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'}
                    />
                    <span>
                      {(trade.from?.amount || 0).toFixed(4)} {trade.from?.token?.symbol || ''}
                    </span>
                    <span style={{ opacity: 0.7 }}>→</span>
                    <img
                      src={getSolanaImage(trade.to?.token)}
                      alt={trade.to?.token?.symbol || ''}
                      style={{ width: '20px', height: '20px', borderRadius: '10px' }}
                      onError={(e) => e.target.src = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'}
                    />
                    <span>
                      {(trade.to?.amount || 0).toFixed(4)} {trade.to?.token?.symbol || ''}
                    </span>
                  </div>
                  <div>{formatUSD(trade.volume?.usd || 0)}</div>
                </div>
                <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                  {formatTime(trade.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}; 