import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, User } from './services/auth';
import { useRouter, useSegments } from 'expo-router';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    auth.getCurrentUser().then(user => {
      console.log('Current user:', user); // Debug log
      setUser(user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    console.log('User state:', user); // Debug log
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      console.log('Redirecting to login'); // Debug log
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      console.log('Redirecting to tabs'); // Debug log
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  useEffect(() => {
    const handleUserChange = () => {
      auth.getCurrentUser().then(user => {
        setUser(user);
      });
    };

    window.addEventListener('userChange', handleUserChange);
    return () => {
      window.removeEventListener('userChange', handleUserChange);
    };
  }, []);

  const refreshUserState = async () => {
    const user = await auth.getCurrentUser();
    setUser(user);
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ headerShown: false, refreshUserState }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
