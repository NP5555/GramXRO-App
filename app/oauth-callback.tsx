import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { verifyTaskCompletion } from './utils/oauthUtils';
import { LinearGradient } from 'expo-linear-gradient';

export default function OAuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying task completion...');
  const params = useLocalSearchParams<{ code: string; state: string; error?: string }>();

  useEffect(() => {
    const verifyTask = async () => {
      try {
        // Check for error parameter
        if (params.error) {
          setStatus('error');
          setMessage(`Authorization failed: ${params.error}`);
          setTimeout(() => router.replace('/(tabs)/airdrop'), 2000);
          return;
        }

        // Check for required parameters
        if (!params.code || !params.state) {
          setStatus('error');
          setMessage('Missing required parameters');
          setTimeout(() => router.replace('/(tabs)/airdrop'), 2000);
          return;
        }

        // Verify task completion with backend
        try {
          const verified = await verifyTaskCompletion(params.code, params.state);
          
          if (verified) {
            setStatus('success');
            setMessage('Task successfully verified!');
          } else {
            setStatus('error');
            setMessage('Task requirements not met. Please complete the required action.');
          }
        } catch (verifyError: any) {
          setStatus('error');
          setMessage(verifyError.message || 'Could not verify task completion');
        }

        // Redirect back to airdrop screen after a delay
        setTimeout(() => router.replace('/(tabs)/airdrop'), 3000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
        setTimeout(() => router.replace('/(tabs)/airdrop'), 3000);
      }
    };

    verifyTask();
  }, [params]);

  return (
    <LinearGradient
      colors={['#121212', '#1A1A1A']}
      style={styles.container}
    >
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {status === 'loading' && (
          <ActivityIndicator size="large" color="#FFD700" />
        )}
        
        {status === 'success' && (
          <View style={styles.icon}>
            <Text style={styles.iconText}>✓</Text>
          </View>
        )}
        
        {status === 'error' && (
          <View style={[styles.icon, styles.errorIcon]}>
            <Text style={styles.iconText}>✕</Text>
          </View>
        )}
        
        <Text style={styles.message}>{message}</Text>
        
        <Text style={styles.redirecting}>
          Redirecting back to task list...
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    backgroundColor: '#FF6B6B',
  },
  iconText: {
    fontSize: 32,
    color: '#000',
  },
  message: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  redirecting: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
}); 