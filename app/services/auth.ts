import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

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
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch event for app to handle
      window.dispatchEvent(new Event('authError'));
    }
    return Promise.reject(error);
  }
);

export interface SignupData {
  email: string;
  password: string;
  name: string;
  profileImage?: any; // File object from image picker
}

export const auth = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Basic validation
      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required'
        };
      }

      // Trim whitespace from email
      email = email.trim();

      console.log('Attempting login with email:', email);
      
      const response = await authApi.post('/auth/login', { 
        email, 
        password 
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { 
          success: true, 
          token: response.data.token, 
          user: response.data.user 
        };
      }
      
      return { 
        success: false, 
        message: response.data.message || 'No token received' 
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password',
      };
    }
  },

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      // If we're getting a URL instead of a file, send as JSON
      if (data.profileImage?.uri) {
        const response = await authApi.post('/auth/register', {
          email: data.email,
          password: data.password,
          name: data.name,
          profileImage: data.profileImage.uri
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          return { success: true, token: response.data.token, user: response.data.user };
        }
        return { success: false, message: 'No token received' };
      }

      // If we have an actual file, use FormData
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('name', data.name);
      
      if (data.profileImage) {
        formData.append('profileImage', data.profileImage);
      }

      const response = await authApi.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, token: response.data.token, user: response.data.user };
      }
      return { success: false, message: 'No token received' };
    } catch (error: any) {
      console.error('Signup error details:', error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  },

  async updateProfileImage(imageFile: any): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      const response = await authApi.put('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, message: 'Failed to update profile image' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile image',
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from localStorage
      const cachedUser = this.getUser();
      if (cachedUser) {
        return cachedUser;
      }
      
      // If not in cache, fetch from API
      const response = await authApi.get('/auth/profile');
      const user = response.data;
      
      // Update cache
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChange'));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getProfileImageUrl(user: User | null): string {
    if (!user || !user.profileImage) {
      return '/default-avatar.png'; // Make sure to have this default image in your assets
    }
    return `${API_BASE_URL}${user.profileImage}`;
  }
};

export default auth; 