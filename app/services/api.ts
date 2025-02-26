const API_BASE_URL = 'http://localhost:3001';

export interface User {
  id: number;
  name: string;
  referralCode?: string;
  tokens: number;
  shares: number;
  profileImage?: string;
}

export interface Batch {
  batchNumber: number;
  currentPrice: number;
  nextPrice: number;
  tokensSold: number;
  totalTokens: number;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  coins: number;
  shares: number;
}

export const api = {
  async getCurrentUser(userId: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getCurrentBatch(): Promise<Batch> {
    const response = await fetch(`${API_BASE_URL}/batch/current`);
    if (!response.ok) throw new Error('Failed to fetch batch');
    return response.json();
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  async purchaseTokens(userId: number, amount: number): Promise<{ success: boolean; newBalance: number }> {
    const response = await fetch(`${API_BASE_URL}/tokens/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    if (!response.ok) throw new Error('Failed to purchase tokens');
    return response.json();
  },

  async completeTask(userId: number, task: string): Promise<{ success: boolean; newBalance: number }> {
    const response = await fetch(`${API_BASE_URL}/tasks/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, task }),
    });
    if (!response.ok) throw new Error('Failed to complete task');
    return response.json();
  },
}; 