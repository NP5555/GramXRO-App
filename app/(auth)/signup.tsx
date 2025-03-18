import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/auth';
import apiService from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

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

      // Create FormData object
      const formData = new FormData();
      
      // Append user data
      formData.append('name', String(name).trim());
      formData.append('email', String(email).trim().toLowerCase());
      formData.append('password', String(password));
      
      if (referralCode) {
        formData.append('referralCode', String(referralCode).toUpperCase().trim());
      }

      // Append image if selected
      if (selectedImage) {
        try {
          console.log('Processing selected image:', selectedImage);
          
          // Get base64 data from the image
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          
          // Convert blob to base64
          const reader = new FileReader();
          
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to convert image to base64'));
              }
            };
            reader.onerror = (error) => reject(error);
          });
          
          reader.readAsDataURL(blob);
          const base64Image = await base64Promise;
          
          console.log('Base64 image generated successfully');
          
          // Store the base64 image in AsyncStorage
          await AsyncStorage.setItem('@profile_image', base64Image);
          
          // Add the base64 image to the form data
          formData.append('profileImage', base64Image);
          
          // Set the profile image type to local in the form data
          formData.append('profileImageType', 'local');
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }

      // Log signup data (excluding password)
      console.log('Sending signup data:', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        referralCode: referralCode ? referralCode.toUpperCase().trim() : undefined,
        hasImage: !!selectedImage
      });

      // Attempt signup
      const response = await apiService.signup(formData);
      console.log('Signup response:', response);

      if (response.success && response.token) {
        // Store the profile image if it exists in the response
        if (response.user?.profileImage) {
          console.log('Profile image from response:', response.user.profileImage.substring(0, 50));
          if (response.user.profileImage.startsWith('data:image')) {
            console.log('Storing base64 image from response');
            await AsyncStorage.setItem('@profile_image', response.user.profileImage);
            // Update user object to indicate local storage
            response.user.profileImage = 'local';
          }
        }
        
        // Sign in and navigate
        await signIn(response.token);
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message || 'Failed to sign up');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.');
      } else {
        setError(error.message || 'Failed to sign up. Please try again.');
      }
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
        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color="#FFD700" />
            </View>
          )}
          <Text style={styles.addPhotoText}>
            {selectedImage ? 'Change Photo' : 'Add Profile Photo'}
          </Text>
        </TouchableOpacity>

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
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 8,
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  addPhotoText: {
    color: '#FFD700',
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