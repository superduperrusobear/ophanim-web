import { Connection, PublicKey } from '@solana/web3.js';
import { env } from './env';

// List of public RPC endpoints with configurations
const RPC_ENDPOINTS = [
  {
    url: 'https://rpc.ankr.com/solana',
    headers: {
      'Content-Type': 'application/json',
    }
  },
  {
    url: 'https://solana-mainnet.g.alchemy.com/v2/demo',
    headers: {
      'Content-Type': 'application/json',
    }
  },
  {
    url: 'https://api.quicknode.com/graphql',
    headers: {
      'Content-Type': 'application/json',
    }
  }
];

class WalletService {
  constructor() {
    this.connection = null;
    this.provider = null;
    this.currentEndpointIndex = 0;
  }

  initialize() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('WalletService must be used in a browser environment');
      }

      // Initialize Solana connection with the first endpoint
      this.createConnection();

      // Check and set Phantom provider
      if (window.phantom?.solana && window.phantom.solana.isPhantom) {
        this.provider = window.phantom.solana;
        console.log('Phantom wallet provider initialized');
      } else {
        throw new Error('Phantom wallet is not installed');
      }

      return true;
    } catch (error) {
      console.error('Error initializing wallet service:', error);
      throw error;
    }
  }

  createConnection() {
    const endpoint = RPC_ENDPOINTS[this.currentEndpointIndex];
    this.connection = new Connection(endpoint.url, {
      commitment: 'confirmed',
      httpHeaders: endpoint.headers,
      wsEndpoint: endpoint.url.replace('https', 'wss'),
      confirmTransactionInitialTimeout: 60000,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            ...endpoint.headers
          }
        });
      }
    });
  }

  async tryNextEndpoint() {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
    this.createConnection();
    console.log(`Switched to endpoint: ${RPC_ENDPOINTS[this.currentEndpointIndex].url}`);
  }

  async connect() {
    try {
      // Try to initialize if not already done
      if (!this.connection || !this.provider) {
        this.initialize();
      }

      // Check if already connected
      if (this.provider.isConnected) {
        console.log('Wallet already connected');
        return this.provider.publicKey.toString();
      }

      // Attempt connection with explicit request
      console.log('Requesting wallet connection...');
      const resp = await this.provider.connect();
      console.log('Wallet connected successfully');
      return resp.publicKey.toString();
    } catch (error) {
      if (error.code === 4001) {
        console.log('User rejected the connection request');
        throw error;
      }
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.provider && this.provider.isConnected) {
        await this.provider.disconnect();
        console.log('Wallet disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  async getBalance(publicKey) {
    try {
      if (!this.connection) {
        this.initialize();
      }
      
      if (!publicKey) {
        throw new Error('Public key is required');
      }

      let attempts = 0;
      const maxAttempts = RPC_ENDPOINTS.length;

      while (attempts < maxAttempts) {
        try {
          console.log(`Attempting to get balance using endpoint: ${RPC_ENDPOINTS[this.currentEndpointIndex].url}`);
          const balance = await this.connection.getBalance(new PublicKey(publicKey));
          console.log('Balance fetched successfully:', balance);
          return balance / 10 ** 9; // Convert lamports to SOL
        } catch (error) {
          console.warn(`Error with endpoint ${RPC_ENDPOINTS[this.currentEndpointIndex].url}:`, error);
          attempts++;
          if (attempts < maxAttempts) {
            await this.tryNextEndpoint();
            // Add a small delay before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async getTokenAccounts(publicKey) {
    try {
      if (!this.connection) {
        this.initialize();
      }

      if (!publicKey) {
        throw new Error('Public key is required');
      }
      
      const response = await this.connection.getParsedTokenAccountsByOwner(
        new PublicKey(publicKey),
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return response.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals
      }));
    } catch (error) {
      console.error('Error getting token accounts:', error);
      throw error;
    }
  }

  async getTransactionHistory(publicKey, limit = 10) {
    try {
      if (!this.connection) {
        this.initialize();
      }

      if (!publicKey) {
        throw new Error('Public key is required');
      }
      
      const signatures = await this.connection.getSignaturesForAddress(
        new PublicKey(publicKey),
        { limit }
      );
      
      const transactions = await Promise.all(
        signatures.map(async sig => {
          const tx = await this.connection.getParsedTransaction(sig.signature);
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            status: tx?.meta?.err ? 'failed' : 'success',
            amount: tx?.meta?.fee / 10 ** 9, // Convert lamports to SOL
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  isPhantomInstalled() {
    return typeof window !== 'undefined' && 
           window.phantom?.solana && 
           window.phantom.solana.isPhantom;
  }

  isConnected() {
    return this.provider?.isConnected || false;
  }

  getPublicKey() {
    return this.provider?.publicKey?.toString() || null;
  }
}

// Create a singleton instance
const walletService = new WalletService();

// Export the singleton instance
export { walletService }; 