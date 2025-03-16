import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://gramx-be.onrender.com';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

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

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
authApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
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

// Add response interceptor
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.logout();
      // Dispatch an event to notify the app about auth error
      const event = new Event('authError');
      window?.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export interface SignupData {
  email: string;
  password: string;
  name: string;
  profileImage?: any;
  referralCode?: string;
}

export const auth = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/signup', data);
      const { token, user } = response.data;
      
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (user) {
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  getProfileImageUrl(user: User | null): string {
    if (!user?.profileImage) return '';
    return user.profileImage.startsWith('http') 
      ? user.profileImage 
      : `${API_BASE_URL}/uploads/${user.profileImage}`;
  }
};

export default auth; 