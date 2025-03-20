import axios from 'axios';
import { auth } from './auth';

// Choose which API URL to use (uncomment one)
const API_BASE_URL = 'http://localhost:3000';
// const API_BASE_URL = 'https://gramx-be.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await auth.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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
  async (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Only handle 401 errors for authenticated endpoints, not for login/signup/validation
    if ((error.response?.status === 401 || error.response?.status === 403) &&
        !error.config.url.includes('/auth/login') &&
        !error.config.url.includes('/auth/signup') &&
        !error.config.url.includes('/validate')) {
      console.log('API interceptor: 401/403 error detected, logging out');
      await auth.logout(); // This will trigger the authError event
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralEarnings?: number;
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

interface BackendLeaderboardEntry {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  coins: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Task {
  _id: string;
  task: string;
  reward: number;
  type?: string;  // Add type to identify OAuth tasks
  platform?: string; // Platform for OAuth (YouTube, Twitter, etc.)
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ReferralUserInfo {
  totalReferrals: number;
  totalEarnings: number;
  referralCode: string;
  referralLink: string;
}

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  referralLink: string;
}

export interface ReferredUser {
  _id: string;
  name: string;
  email: string;
  referredBy: string;
  referralCount: number;
  referralEarnings: number;
  tokens: number;
  shares: number;
  createdAt: string;
  referralCode: string;
}

export interface ReferralValidationResponse {
  valid: boolean;
  referrerName?: string;
  message?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
  profileImage?: string | FormData;
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface ReferralResponse {
  success: boolean;
  data: ReferralStats;
}

export interface OAuthUrlResponse {
  success: boolean;
  url: string;
  message?: string;
}

export interface OAuthVerificationResponse {
  success: boolean;
  verified: boolean;
  newBalance?: number;
  message?: string;
  verificationDetails?: {
    isSubscribed?: boolean;
    isFollowing?: boolean;
    hasJoined?: boolean;
    platform?: string;
    platformUserId?: string;
    platformUsername?: string;
    verificationTimestamp?: number;
  }
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
      const response = await api.get('/admin/leaderboard');
      console.log('Raw leaderboard response:', response.data);

      // Transform the data into the expected format
      const transformedData: LeaderboardEntry[] = response.data
        .sort((a: BackendLeaderboardEntry, b: BackendLeaderboardEntry) => b.coins - a.coins)
        .map((entry: BackendLeaderboardEntry, index: number) => ({
          position: index + 1,
          name: entry.userId.name || 'Anonymous',
          coins: entry.coins,
          shares: entry.shares,
          userId: entry.userId._id
        }));

      console.log('Transformed leaderboard data:', transformedData);
      return transformedData;
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
      if (!task) {
        throw new Error('Task is required');
      }
      
      // Log the request payload for debugging
      console.log('Sending task completion request:', { task });
      
      const response = await api.post('/tasks/complete', { task }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Task completion response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to complete task');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error completing task:', error);
      // Log the full error response for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to complete task. Please try again later.');
    }
  },

  async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await api.get<ReferralResponse>('/referral-stats', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Raw referral response:', response);
      
      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error('Invalid response format');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching referral stats:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.details || 'Invalid request');
      } else if (error.response?.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(error.response?.data?.message || error.response?.data?.details || 'Failed to fetch referral stats');
    }
  },

  async validateReferralCode(code: string): Promise<ReferralValidationResponse> {
    try {
      if (!code) {
        return { valid: false, message: 'Referral code is required' };
      }

      // Convert to uppercase for consistency
      const upperCode = code.toUpperCase();
      
      // Validate format
      // if (!/^[A-Z0-9]{6}$/.test(upperCode)) {
      //   return { 
      //     valid: false, 
      //     message: 'Referral code must be 6 characters long and contain only letters and numbers' 
      //   };
      // }

      const response = await api.get(`/user/referral/validate/${upperCode}`);
      return response.data;
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      
      if (error.response?.status === 404) {
        return { 
          valid: false, 
          message: 'Invalid referral code' 
        };
      }
      
      throw new Error(error.response?.data?.message || 'Error validating referral code');
    }
  },

  async signup(data: SignupData | FormData): Promise<SignupResponse> {
    try {
      const isFormData = data instanceof FormData;
      
      // Set proper headers based on data type
      const headers: any = isFormData ? {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      } : {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Configure request options
      const config = {
        headers,
        transformRequest: isFormData ? [(data: any) => data] : undefined,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 30000
      };

      // Log request configuration (excluding sensitive data)
      console.log('Signup request config:', {
        isFormData,
        contentType: headers['Content-Type'],
        hasTransformRequest: !!config.transformRequest
      });

      const response = await api.post('/auth/signup', data, config);

      // Log response (excluding sensitive data)
      console.log('Signup response:', {
        status: response.status,
        success: response.data?.success,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user
      });

      // Validate response
      if (!response.data) {
        throw new Error('No response data received');
      }

      // Store user data and token if available
      if (response.data.token) {
        await auth.setToken(response.data.token);
        if (response.data.user) {
          await auth.setUser(response.data.user);
        }
      }

      // Return standardized response
      return {
        success: true,
        token: response.data.token,
        message: response.data.message || 'Signup successful',
        user: response.data.user
      };
    } catch (error: any) {
      // Log error details (excluding sensitive data)
      console.error('Signup error:', {
        name: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Handle specific error cases
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection and try again.');
      }

      throw new Error('Failed to sign up. Please try again.');
    }
  },

  async getUserReferrals(): Promise<any> {
    try {
      // Debug the token
      const token = await auth.getToken();
      console.log('Token being used:', token);

      const response = await api.get('/user/referrals', {
        headers: {
          'Accept': 'application/json',
          // Explicitly set the Authorization header for debugging
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Raw referrals response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('Unauthorized. Please login again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.details) {
        throw new Error(error.response.data.details);
      }
      throw new Error('Failed to fetch user referrals');
    }
  },

  // New methods for OAuth verification

  async initiateTaskVerification(taskId: string): Promise<OAuthUrlResponse> {
    try {
      const response = await api.get(`/tasks/verify/${taskId}`);
      console.log('Task verification initiation response:', response.data);
      
      if (!response.data.success || !response.data.url) {
        throw new Error(response.data.message || 'Failed to initiate task verification');
      }
      
      // Store task ID and platform for verification
      await auth.setVerificationState({
        taskId,
        platform: response.data.platform,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error initiating task verification:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to initiate task verification. Please try again later.');
    }
  },

  async completeTaskVerification(code: string, state: string): Promise<OAuthVerificationResponse> {
    try {
      // Get stored verification state
      const verificationState = await auth.getVerificationState();
      if (!verificationState) {
        throw new Error('Invalid verification state');
      }

      // Add verification state to request
      const response = await api.post('/tasks/verify/callback', { 
        code, 
        state,
        taskId: verificationState.taskId,
        platform: verificationState.platform,
        initiatedAt: verificationState.timestamp
      });

      console.log('Task verification completion response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to complete task verification');
      }

      // Check if the actual task requirements are met
      if (!response.data.verificationDetails) {
        throw new Error('Verification details not provided by server');
      }

      const { isSubscribed, isFollowing, hasJoined, platform } = response.data.verificationDetails;
      
      // Verify based on platform-specific requirements
      let verified = false;
      switch (platform) {
        case 'youtube':
          verified = isSubscribed === true;
          if (!verified) throw new Error('YouTube subscription not found. Please subscribe to the channel.');
          break;
        case 'twitter':
          verified = isFollowing === true;
          if (!verified) throw new Error('Twitter follow not detected. Please follow the account.');
          break;
        case 'discord':
          verified = hasJoined === true;
          if (!verified) throw new Error('Discord server join not detected. Please join the server.');
          break;
        case 'telegram':
          verified = hasJoined === true;
          if (!verified) throw new Error('Telegram group join not detected. Please join the group.');
          break;
        default:
          throw new Error('Unsupported platform');
      }
      
      // Clear verification state after successful verification
      await auth.clearVerificationState();
      
      return response.data;
    } catch (error: any) {
      console.error('Error completing task verification:', error);
      // Clear verification state on error
      await auth.clearVerificationState();
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to complete task verification. Please try again later.');
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