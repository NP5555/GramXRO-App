import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/auth';
import apiService from '../services/api';
import ProfileImage from '../components/ProfileImage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';

export default function SignupScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValidReferral, setIsValidReferral] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Check for referral code in URL params
  useEffect(() => {
    const checkReferralCode = async () => {
      const refCode = params.ref as string;
      if (refCode) {
        setReferralCode(refCode);
        validateReferralCode(refCode);
      }
    };
    
    checkReferralCode();
  }, [params]);

  const validateReferralCode = async (code: string) => {
    if (!code) return;
    
    setIsValidating(true);
    try {
      const result = await apiService.validateReferralCode(code);
      if (result.valid) {
        setReferrerName(result.referrerName || null);
        setIsValidReferral(true);
        setReferralError(null);
      } else {
        setReferrerName(null);
        setIsValidReferral(false);
        setReferralError(result.message || null);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setReferrerName(null);
      setIsValidReferral(false);
      setReferralError('An error occurred');
    } finally {
      setIsValidating(false);
    }
  };

  const handleReferralCodeChange = async (code: string) => {
    try {
      setReferralCode(code);
      setIsValidating(true);
      setReferralError(null);

      if (!code) {
        setIsValidReferral(false);
        setReferrerName(null);
        return;
      }

      const result = await apiService.validateReferralCode(code);
      setIsValidReferral(result.valid);
      
      if (result.valid && result.referrerName) {
        setReferrerName(result.referrerName);
        setReferralError(null);
      } else {
        setReferralError(result.message || 'Invalid referral code');
        setReferrerName(null);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setReferralError(error.message || 'An error occurred');
      setIsValidReferral(false);
      setReferrerName(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!name || !email || !password) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate referral code if provided
      if (referralCode && !isValidReferral) {
        setError('Please enter a valid referral code or leave it empty');
        return;
      }

      const response = await apiService.signup({
        name,
        email,
        password,
        referralCode: referralCode ? referralCode.toUpperCase() : undefined,
        profileImage: imageUrl || undefined
      });

      if (response.success && response.token) {
        await signIn(response.token);
        router.replace('/(tabs)');
      } else {
        setError(response.message || 'Failed to sign up');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the community today</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Image URL (optional)"
          placeholderTextColor="#666"
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <View style={styles.referralContainer}>
          <TextInput
            style={[
              styles.input,
              styles.referralInput,
              isValidReferral && styles.validReferral,
              referralError && styles.invalidReferral
            ]}
            placeholder="Referral Code (Optional)"
            placeholderTextColor="#666"
            value={referralCode}
            onChangeText={handleReferralCodeChange}
            autoCapitalize="characters"
          />
          {isValidating ? (
            <ActivityIndicator size="small" color="#FFD700" style={styles.referralIcon} />
          ) : isValidReferral ? (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.referralIcon} />
          ) : referralError ? (
            <Ionicons name="close-circle" size={24} color="#FF6B6B" style={styles.referralIcon} />
          ) : null}
        </View>

        {referrerName && (
          <Text style={styles.referrerText}>
            Referred by: {referrerName}
          </Text>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.gradient}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  addPhotoText: {
    color: '#FFD700',
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    color: '#FFF',
    fontSize: 16,
  },
  referralContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralInput: {
    flex: 1,
    marginBottom: 8,
  },
  referralIcon: {
    position: 'absolute',
    right: 15,
  },
  validReferral: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  invalidReferral: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  referrerText: {
    color: '#FFD700',
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#999',
  },
  footerLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
}); 