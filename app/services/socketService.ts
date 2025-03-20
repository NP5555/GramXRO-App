import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

// Define the server URL based on environment
const SERVER_URL = __DEV__ 
  ? 'http://localhost:3000'
  : 'YOUR_PRODUCTION_SERVER_URL'; // Replace with your production server URL

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initializeSocket(userId: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.userId = userId;
    this.socket = io(SERVER_URL);

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.socket?.emit('join', this.userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  public onNotification(callback: (message: any) => void) {
    this.socket?.on('notification', callback);
  }

  public onLeaderboardChange(callback: (data: any) => void) {
    this.socket?.on('leaderboardChange', callback);
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Method to emit events to the server
  public emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }
}

export default SocketService.getInstance(); 