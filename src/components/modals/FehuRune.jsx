import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { walletService } from '../../utils/wallet';
import { WalletAnalysis } from './WalletAnalysis';
import axios from 'axios';

export function FehuRune() {
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [walletTrades, setWalletTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerStyle = {
    minWidth: '400px',
    maxWidth: '800px',
    color: 'white',
    fontFamily: "'Cinzel', serif",
    textAlign: 'center'
  };

  useEffect(() => {
    const checkPhantom = () => {
      const isPhantom = window.phantom?.solana && window.phantom.solana.isPhantom;
      setPhantomInstalled(isPhantom);
      
      // Also check if already connected
      if (isPhantom && window.phantom.solana.isConnected) {
        setWalletConnected(true);
        setWalletAddress(window.phantom.solana.publicKey.toString());
      }
    };

    checkPhantom();
    // Add listener for Phantom injection
    window.addEventListener('load', checkPhantom);
    return () => window.removeEventListener('load', checkPhantom);
  }, []);

  const fetchWalletData = async (address) => {
    setIsLoading(true);
    try {
      const API_KEY = 'cbbff4e0-dc44-4106-9e43-2b54667ea532';
      
      // First try to get wallet and trades data
      const [walletResponse, tradesResponse] = await Promise.all([
        axios.get(`https://data.solanatracker.io/wallet/${address}`, {
          headers: { 'x-api-key': API_KEY }
        }),
        axios.get(`https://data.solanatracker.io/wallet/${address}/trades`, {
          headers: { 'x-api-key': API_KEY }
        })
      ]);

      // Try to get SOL balance, but don't let it block the whole operation
      let solBalance = 0;
      try {
        solBalance = await walletService.getBalance(address);
      } catch (balanceError) {
        console.warn('Error fetching SOL balance:', balanceError);
        // Set a more user-friendly error message
        setError('Note: Unable to fetch SOL balance at the moment. Other wallet data is still available.');
      }

      // Combine the data
      const combinedWalletData = {
        ...walletResponse.data,
        totalSol: solBalance,
        tokens: walletResponse.data.tokens || [],
        balanceError: solBalance === 0 ? 'Balance temporarily unavailable' : null
      };

      setWalletData(combinedWalletData);
      setWalletTrades(tradesResponse.data.trades || []);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load complete wallet data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Initialize wallet service
      walletService.initialize();
      
      // Attempt connection
      const publicKey = await walletService.connect();
      setWalletAddress(publicKey);
      setWalletConnected(true);
      
      // Fetch wallet data after successful connection
      await fetchWalletData(publicKey);
      
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      if (error.code === 4001) {
        setError('Connection request was rejected. Please try again.');
      } else if (!phantomInstalled) {
        setError('Phantom wallet is not installed.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await walletService.disconnect();
      setWalletConnected(false);
      setWalletAddress('');
      setWalletData(null);
      setWalletTrades([]);
      setError(null);
    } catch (error) {
      console.error('Error disconnecting from Phantom wallet:', error);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  // Add effect to fetch data when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress && !walletData) {
      fetchWalletData(walletAddress);
    }
  }, [walletConnected, walletAddress]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={containerStyle}
    >
      <motion.img
        src="/imgs/Fehu-Elder-Futhark-Rune-1.png"
        alt="Fehu Rune"
        style={{
          width: '80px',
          height: '80px',
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
            'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
            'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: '#ff6b6b',
            margin: '1rem 0',
            padding: '0.5rem',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '5px'
          }}
        >
          {error}
        </motion.div>
      )}

      {!phantomInstalled ? (
        <div>
          <p style={{
            marginBottom: '1.5rem',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem'
          }}>
            Phantom wallet is required to interact with OPHN.
          </p>
          <motion.a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, #9945FF, #6978FF)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              textDecoration: 'none',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Install Phantom Wallet
          </motion.a>
        </div>
      ) : walletConnected ? (
        <div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              margin: '0 0 0.5rem 0',
              opacity: 0.7,
              fontSize: '0.9rem'
            }}>
              Connected Wallet
            </p>
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              wordBreak: 'break-all'
            }}>
              {walletAddress}
            </p>
          </div>
          <motion.button
            onClick={handleDisconnectWallet}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '0.8rem 1.5rem',
              borderRadius: '25px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              fontFamily: "'Cinzel', serif",
              marginBottom: '2rem'
            }}
            whileHover={{ 
              scale: 1.05,
              background: 'rgba(255, 255, 255, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Disconnect Wallet
          </motion.button>

          <WalletAnalysis 
            walletAddress={walletAddress}
            walletData={walletData}
            walletTrades={walletTrades}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div>
          <p style={{
            marginBottom: '1.5rem',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.1rem'
          }}>
            Connect your Phantom wallet to interact with OPHN.
          </p>
          <motion.button
            onClick={handleConnectWallet}
            style={{
              background: 'linear-gradient(45deg, #9945FF, #6978FF)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '30px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: "'Cinzel', serif"
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Phantom Wallet
          </motion.button>
        </div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontFamily: "'Cormorant Garamond', serif"
      }}>
        <p style={{ margin: 0 }}>
          The Fehu rune represents wealth, prosperity, and new beginnings. 
          Connect your wallet to begin your journey with OPHN.
        </p>
      </div>
    </motion.div>
  );
} 