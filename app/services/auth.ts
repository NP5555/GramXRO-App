import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  email: string;
  name: string;
  id: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export const auth = {
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.find((u: User) => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        name,
      };

      users.push({ ...newUser, password });
      await AsyncStorage.setItem('users', JSON.stringify(users));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));

      console.log('User registered:', newUser);

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      const { password: _, ...userWithoutPassword } = user;
      await AsyncStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      console.log('User logged in:', userWithoutPassword);

      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('currentUser');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
}; 