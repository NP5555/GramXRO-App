import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { auth } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await auth.login(email, password);
    console.log('Login result:', result); // Debug log
    if (result.success) {
      window.dispatchEvent(new Event('userChange')); // Dispatch the event
      router.replace('/(tabs)'); // Redirect to main app
    } else {
      Alert.alert('Error', result.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async () => {
    // try {
    //   // Implement your Google login logic here
    //   const result = await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    //   if (result.user) {
    //     // Handle successful login
    //     console.log('User logged in:', result.user);
    //   }
    // } catch (error) {
    //   console.error('Google login error:', error);
    //   Alert.alert('Error', 'Failed to login with Google');
    // }

    console.log("Firebase Google login not implemented yet");
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
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#FFF" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={styles.signupLink}>
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
    backgroundColor: '#4285F4', // Google blue color
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row', // Align icon and text horizontally
    justifyContent: 'center',
    marginTop: 20,
  },
  googleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8, // Space between icon and text
  },
  googleIcon: {
    // Optional: Add any additional styling for the icon here
  },
}); 