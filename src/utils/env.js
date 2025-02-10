// Environment variable validation and access
const requiredEnvVars = [
  'REACT_APP_OPENAI_API_KEY',
  'REACT_APP_SOLANA_TRACKER_API_KEY',
  'REACT_APP_SOLANA_RPC_URL',
  'REACT_APP_SOLNET_TOKEN_ADDRESS',
  'REACT_APP_FIREBASE_CONFIG'
];

// Validate required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`Missing required environment variable: ${envVar}`);
  }
});

// Direct configuration for Solana connection
export const env = {
  // API Keys
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
  SOLANA_TRACKER_API_KEY: process.env.REACT_APP_SOLANA_TRACKER_API_KEY,
  
  // Solana Config
  SOLANA_RPC_URL: 'https://api.mainnet-beta.solana.com',
  SOLANA_NETWORK: 'mainnet-beta',
  SOLNET_TOKEN_ADDRESS: process.env.REACT_APP_SOLNET_TOKEN_ADDRESS,
  
  // Firebase Config
  FIREBASE_CONFIG: JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG || '{}'),
  
  // Feature Flags
  ENABLE_TESTNET: process.env.REACT_APP_ENABLE_TESTNET === 'true',
  ENABLE_DEVTOOLS: process.env.REACT_APP_ENABLE_DEVTOOLS === 'true',

  // Helper function to get the RPC endpoint
  getRpcEndpoint() {
    return this.SOLANA_RPC_URL;
  },

  // Helper function to check if all required variables are set
  isConfigured() {
    return requiredEnvVars.every(envVar => process.env[envVar]);
  },

  // Helper function to get API headers with authentication
  getApiHeaders(type = 'default') {
    const headers = {
      'Content-Type': 'application/json'
    };

    switch (type) {
      case 'openai':
        headers['Authorization'] = `Bearer ${this.OPENAI_API_KEY}`;
        break;
      case 'solana-tracker':
        headers['X-API-Key'] = this.SOLANA_TRACKER_API_KEY;
        break;
      default:
        // Default headers if needed
        break;
    }

    return headers;
  },

  // Helper function to get Solana connection config
  getSolanaConfig() {
    return {
      rpcUrl: this.SOLANA_RPC_URL,
      network: this.SOLANA_NETWORK
    };
  }
}; 