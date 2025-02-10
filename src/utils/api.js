import axios from 'axios';
import { env } from './env';

class ApiService {
  constructor() {
    this.solanaTracker = axios.create({
      headers: env.getApiHeaders('solana-tracker')
    });

    this.openai = axios.create({
      headers: env.getApiHeaders('openai')
    });
  }

  // Solana Tracker API calls
  async getMarketActivity() {
    try {
      const response = await this.solanaTracker.get('/market/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching market activity:', error);
      throw error;
    }
  }

  async getTopTraders(timeframe = '24h', limit = 5) {
    try {
      const response = await this.solanaTracker.get('/traders/top', {
        params: { timeframe, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top traders:', error);
      throw error;
    }
  }

  async getTraderStats(address) {
    try {
      const response = await this.solanaTracker.get(`/traders/${address}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trader stats:', error);
      throw error;
    }
  }

  // OpenAI API calls
  async analyzeWalletActivity(transactions) {
    try {
      const response = await this.openai.post('/v1/chat/completions', {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a crypto trading analyst. Analyze the provided wallet transactions and provide insights."
          },
          {
            role: "user",
            content: `Analyze these transactions and provide insights: ${JSON.stringify(transactions)}`
          }
        ]
      });
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing wallet activity:', error);
      throw error;
    }
  }

  // Firebase integration (if needed)
  async initializeFirebase() {
    try {
      const firebase = await import('firebase/app');
      await firebase.initializeApp(env.FIREBASE_CONFIG);
      return firebase;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService(); 