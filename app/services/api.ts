import axios from 'axios';
import { auth } from './auth';

const API_BASE_URL = 'https://gramx-be.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = auth.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      auth.logout(); // This will trigger the authError event
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  referralCode?: string;
  tokens: number;
  shares: number;
  profileImage?: string;
  numericId?: number;
}

export interface Batch {
  _id: string;
  batchNumber: number;
  currentPrice: number;
  nextPrice: number;
  tokensSold: number;
  totalTokens: number;
}

export interface LeaderboardEntry {
  position: number;
  name: string;
  coins: number;
  shares: number;
  userId: string | null;
}

export interface Task {
  _id: string;
  task: string;
  reward: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const apiService = {
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  async getCurrentBatch(): Promise<Batch> {
    try {
      const response = await api.get('/batch/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current batch:', error);
      throw error;
    }
  },

  async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get('/tasks');
      console.log('Tasks response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await api.get('/leaderboard');
      console.log('Leaderboard response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  async purchaseTokens(amount: number): Promise<ApiResponse<{ newBalance: number }>> {
    try {
      if (amount < 100) {
        throw new Error('Minimum purchase amount is 100');
      }
      const response = await api.post('/tokens/purchase', { amount });
      console.log('Purchase response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  },

  async completeTask(task: string): Promise<ApiResponse<{ newBalance: number }>> {
    try {
      const response = await api.post('/tasks/complete', { task });
      console.log('Task completion response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },
};

export async function loadInitialData() {
  try {
    const [user, batch, leaderboard] = await Promise.all([
      apiService.getCurrentUser(),
      apiService.getCurrentBatch(),
      apiService.getLeaderboard(),
    ]);
    return { user, batch, leaderboard };
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
}

export default apiService;