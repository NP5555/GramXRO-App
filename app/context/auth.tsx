import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/auth';
import { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      
      // Initialize auth service first
      await auth.init();
      
      const token = await auth.getToken();
      if (token) {
        const userData = await auth.getUser();
        
        // Pre-load profile image to ensure it's in AsyncStorage
        if (userData && userData.profileImage) {
          if (userData.profileImage === 'local') {
            // Image should be in AsyncStorage already from init()
            console.log('Auth Context: Profile image is stored locally');
          } else if (userData.profileImage.startsWith('data:image')) {
            // Store the image in AsyncStorage
            console.log('Auth Context: Storing base64 image in AsyncStorage');
            await auth.setUser({
              ...userData,
              profileImage: 'local' // This will trigger storage in AsyncStorage
            });
          }
        }
        
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string) => {
    try {
      await auth.setToken(token);
      const userData = await auth.getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.clearToken();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider };
export default AuthProvider; 