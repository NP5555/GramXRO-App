const API_BASE_URL = 'http://localhost:3001';

export interface User {
  _id: string;
  name: string;
  referralCode?: string;
  tokens: number;
  shares: number;
  profileImage?: string;
  numericId?: number; // Optional: if you want to keep numeric IDs
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
  _id: string;
  position: number;
  userId: {
    _id: string;
    name: string;
  };
  coins: number;
  shares: number;
  __v?: number;
}

export interface Task {
  task: string;
  reward: number;
  _id: string;
}

export const api = {
  // Use a real MongoDB ID from your database
  async getDefaultUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) throw new Error('Failed to fetch default user');
    const users = await response.json();
    if (!users || users.length === 0) throw new Error('No users found');
    return users[0];
  },

  async getCurrentUser(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/default`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getCurrentBatch(): Promise<Batch> {
    const response = await fetch(`${API_BASE_URL}/batch/current`);
    if (!response.ok) throw new Error('Failed to fetch batch');
    return response.json();
  },

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },
  
  // async getLeaderboard(): Promise<LeaderboardEntry[]> {
  //   const response = await fetch(`${API_BASE_URL}/leaderboard`);
  //   if (!response.ok) throw new Error('Failed to fetch leaderboard');
  //   return response.json();
  // },
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    const data = await response.json();
    console.log('Received leaderboard data:', data); // Add log to verify data
    return data;
  },


  async purchaseTokens(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
    const response = await fetch(`${API_BASE_URL}/tokens/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    if (!response.ok) throw new Error('Failed to purchase tokens');
    return response.json();
  },

  async completeTask(userId: string, task: string): Promise<{ success: boolean; newBalance: number }> {
    if (!userId || userId === 'default-user') {
      throw new Error('Valid user ID is required');
    }
    
    const response = await fetch(`${API_BASE_URL}/tasks/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task }),
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },
};

// Example usage in your frontend:
export async function loadInitialData() {
  try {
    const defaultUser = await api.getDefaultUser();
    const batch = await api.getCurrentBatch();
    const leaderboard = await api.getLeaderboard();
    return { defaultUser, batch, leaderboard };
  } catch (error) {
    console.error('Error loading initial data:', error);
    throw error;
  }
}