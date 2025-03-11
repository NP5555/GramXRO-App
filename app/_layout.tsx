import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { auth, User } from './services/auth';
import { useSegments } from 'expo-router';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import UserMenu from "./components/UserMenu";

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
    const checkAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        console.log('Current user:', currentUser); // Debug log
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
    const handleUserChange = async () => {
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
    };

    const handleAuthError = () => {
      setUser(null);
      router.replace('/(auth)/login');
    };

    window?.addEventListener('userChange', handleUserChange);
    window?.addEventListener('authError', handleAuthError);
    
    return () => {
      window?.removeEventListener('userChange', handleUserChange);
      window?.removeEventListener('authError', handleAuthError);
    };
  }, []);

  // Prevent window.addEventListener error on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      // @ts-ignore
      if (typeof window !== 'undefined') {
        // @ts-ignore
        window.addEventListener = () => {};
        // @ts-ignore
        window.removeEventListener = () => {};
      }
    }
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFD700',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <UserMenu user={user} onImageUpdate={setUser} />
            </View>
          ),
        }}
      >
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
