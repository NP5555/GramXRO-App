import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface UserState {
  _id: string;
  username: string;
  email: string;
  totalTokens: number;
  completedTasks: string[];
  referralCount: number;
  referralTokens: number;
  isLoading: boolean;
}

interface UserContextType {
  user: UserState | null;
  updateUser: (updates: Partial<UserState>) => void;
  refreshUserData: () => Promise<void>;
  addCompletedTask: (taskId: string, tokens: number) => void;
  addReferralTokens: (tokens: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);

  const updateUser = (updates: Partial<UserState>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const refreshUserData = async () => {
    try {
      updateUser({ isLoading: true });
      const userData = await apiService.getCurrentUser();
      setUser({
        ...userData,
        isLoading: false,
        completedTasks: userData.completedTasks || [],
        totalTokens: userData.totalTokens || 0,
        referralCount: userData.referralCount || 0,
        referralTokens: userData.referralTokens || 0
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      updateUser({ isLoading: false });
    }
  };

  const addCompletedTask = (taskId: string, tokens: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        completedTasks: [...prev.completedTasks, taskId],
        totalTokens: prev.totalTokens + tokens
      };
    });
  };

  const addReferralTokens = (tokens: number) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        referralTokens: prev.referralTokens + tokens,
        referralCount: prev.referralCount + 1,
        totalTokens: prev.totalTokens + tokens
      };
    });
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        updateUser, 
        refreshUserData, 
        addCompletedTask,
        addReferralTokens
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 