import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Choose which API URL to use (uncomment one)
// const API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'https://gramx-be.onrender.com';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';
const PROFILE_IMAGE_KEY = '@profile_image';

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

export interface UpdateProfileImageResponse {
  success: boolean;
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
    // Only handle 401 errors for authenticated endpoints, not for login/signup
    if (error.response?.status === 401 && 
        !error.config.url.includes('/auth/login') && 
        !error.config.url.includes('/auth/signup')) {
      console.log('Auth interceptor: 401 error detected, logging out');
      await auth.logout();
      // Dispatch an event to notify the app about auth error
      window?.dispatchEvent?.(new Event('authError'));
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
  // Initialize auth state and ensure profile image is properly loaded
  async init(): Promise<void> {
    try {
      // Load the user
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      
      // If the profile image is marked as local, make sure it's in AsyncStorage
      if (user.profileImage === 'local') {
        const storedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
        
        if (!storedImage) {
          // If the local image is missing but we're supposed to have one,
          // update the user object to reflect that
          user.profileImage = '';
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        }
      } 
      // If the user has a base64 image directly, store it in AsyncStorage
      else if (user.profileImage?.startsWith('data:image')) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
        user.profileImage = 'local';
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (user) {
          // Check for existing stored image 
          if (user.profileImage && user.profileImage.startsWith('data:image')) {
            // Store base64 image separately
            await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
            // Mark the user object's image as local
            user.profileImage = 'local';
          }
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
          // If the user has a profile image, handle it
          if (user.profileImage && user.profileImage.startsWith('data:image')) {
            // Store base64 image separately
            await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
            // Mark the user object's image as local
            const userWithLocalImage = { ...user, profileImage: 'local' };
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithLocalImage));
          } else {
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
          }
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
      await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
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
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      
      // If profile image is marked as local, load it from AsyncStorage
      if (user.profileImage === 'local') {
        const base64Image = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
        if (base64Image) {
          user.profileImage = base64Image;
        } else {
          // If we can't find the local image, clear the profile image
          user.profileImage = '';
        }
      }
      
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Force load local image directly
  async getProfileImage(): Promise<string | null> {
    try {
      // Always try local storage first as it's fastest
      const base64Image = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
      if (base64Image) {
        // console.log('Auth: Found profile image in AsyncStorage');
        return base64Image;
      }
      
      // If not in local storage, check the user object
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (!userStr) {
        // console.log('Auth: No user found in storage');
        return null;
      }
      
      const user = JSON.parse(userStr);
      if (!user.profileImage) {
        // console.log('Auth: User has no profile image');
        return null;
      }
      
      if (user.profileImage === 'local') {
        // console.log('Auth: User profile is marked as local but image not found');
        return null;
      }
      
      // If it's already a base64 image in the user object, store it and return
      if (user.profileImage.startsWith('data:image')) {
        // console.log('Auth: Saving base64 image from user to AsyncStorage');
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
        
        // Update user to indicate image is stored locally
        const updatedUser = { ...user, profileImage: 'local' };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        
        return user.profileImage;
      }
      
      // console.log('Auth: Returning remote image URL');
      return user.profileImage;
    } catch (error) {
      // console.error('Error getting profile image:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      if (!user) return;

      // If user has a base64 profile image, store it separately
      if (user.profileImage?.startsWith('data:image')) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, user.profileImage);
        // Store user without the base64 image to save space
        const userWithoutImage = { ...user, profileImage: 'local' };
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithoutImage));
      } else {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  getProfileImageUrl(user: User | null): string {
    if (!user?.profileImage) return '';

    // Return the profile image as is - it's either a base64 string or a URL
    return user.profileImage;
  },

  async updateProfileImage(imageData: string): Promise<UpdateProfileImageResponse> {
    try {
      // Store the image locally first for immediate display
      if (imageData.startsWith('data:image')) {
        await AsyncStorage.setItem(PROFILE_IMAGE_KEY, imageData);
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('profileImage', imageData);

      const response = await authApi.post('/user/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.user) {
        // Mark that we're storing image locally
        response.data.user.profileImage = 'local';
        await this.setUser(response.data.user);
      }

      return response.data;
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile image');
    }
  },

  async clearProfileImage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_IMAGE_KEY);
    } catch (error) {
      console.error('Error clearing profile image:', error);
    }
  },
};

export default auth; 