import { useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

interface UseSocketProps {
  userId: string;
  onNotification?: (message: any) => void;
  onLeaderboardChange?: (data: any) => void;
}

export const useSocket = ({ userId, onNotification, onLeaderboardChange }: UseSocketProps) => {
  useEffect(() => {
    if (userId) {
      socketService.initializeSocket(userId);

      if (onNotification) {
        socketService.onNotification(onNotification);
      }

      if (onLeaderboardChange) {
        socketService.onLeaderboardChange(onLeaderboardChange);
      }

      return () => {
        socketService.disconnect();
      };
    }
  }, [userId, onNotification, onLeaderboardChange]);

  const emitEvent = useCallback((event: string, data: any) => {
    socketService.emit(event, data);
  }, []);

  const isConnected = useCallback(() => {
    return socketService.isConnected();
  }, []);

  return {
    emitEvent,
    isConnected,
  };
}; 