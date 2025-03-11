import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router, useRouter } from 'expo-router';
import { auth } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const result = await auth.login(email, password);
      console.log(result);
      if (result.success && result.token) {
        // Token is automatically saved by the auth service
        window.dispatchEvent(new Event('userChange')); // Update app state
        // Delay navigation until the component is fully mounted
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      } else {
        Alert.alert('Error', result.message || 'Login failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleLogin = async (
  //   email: string,
  //   password: string,
  //   setIsLoading: (loading: boolean) => void,
  //   router: ReturnType<typeof useRouter>
  // ) => {
  //   if (!email || !password) {
  //     Alert.alert('Error', 'Please fill in all fields');
  //     return;
  //   }
  
  //   setIsLoading(true);
  //   try {
  //     console.log('Attempting login with:', { email, password }); // Debug input
  //     const { token, user } = await auth.login(email, password);
  
  //     // Assuming apiService.login returns { token, user }
  //     console.log('Login successful:', { token, user });
  
  //     // Store token (assuming auth service handles this internally)
  //     // If not, you'd need: auth.setToken(token);
  //     window.dispatchEvent(new Event('userChange')); // Update app state
  //     router.replace('/(tabs)');
  //   } catch (error: any) {
  //     const errorMessage =
  //       error.response?.data?.message || error.message || 'An unexpected error occurred';
  //     console.error('Login failed:', errorMessage);
  //     Alert.alert('Error', errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleGoogleLogin = async () => {
    Alert.alert('Info', 'Google login is not implemented yet');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A']}
        style={styles.gradientCard}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.googleButton, isLoading && styles.disabledButton]} 
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color="#FFF" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signupLink} disabled={isLoading}>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    justifyContent: 'center',
  },
  gradientCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#999',
    fontSize: 14,
  },
  signupTextBold: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  googleIcon: {
    // Optional: Add any additional styling for the icon here
  },
}); 