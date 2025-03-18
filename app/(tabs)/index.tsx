import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import api, { Batch, User } from '../services/api';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as auth from '../services/auth';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../context/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const animatedBorder = new Animated.Value(0);
  const animatedCount = new Animated.Value(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { signOut } = useAuth();
  
  // Add animation effect
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedBorder, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedBorder, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Debug: Check stored data
        const storedUser = await AsyncStorage.getItem('@user_data');
        const storedImage = await AsyncStorage.getItem('@profile_image');
        console.log('Debug - Stored user:', storedUser ? JSON.parse(storedUser) : null);
        console.log('Debug - Stored image exists:', !!storedImage);
        
        const [user, batch] = await Promise.all([
          api.getCurrentUser(),
          api.getCurrentBatch()
        ]);
        
        if (!user) {
          // If no user data, redirect to login
          await signOut();
          router.replace('/(auth)/login');
          return;
        }
        
        setCurrentUser(user);
        console.log(user)
        setCurrentBatch(batch);
      } catch (error) {
        console.error('Error fetching data:', error);
        // If error is auth-related, redirect to login
        if ((error as any)?.response?.status === 401) {
          await signOut();
          router.replace('/(auth)/login');
          return;
        }
        Alert.alert(
          'Error',
          'Failed to load data. Please check your internet connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, signOut]);

  const handleCopyCode = async () => {
    const referralCode = currentUser?.referralCode || '';
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Success', 'Referral code copied to clipboard!');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!currentUser || !currentBatch) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{currentUser?.name}</Text>
        </View>
        <UserMenu user={currentUser} onImageUpdate={setCurrentUser} />
      </View>

      <View style={styles.statsContainer}>
        <Animated.View style={[
          styles.statsCard,
          {
            transform: [{
              scale: animatedBorder.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              })
            }]
          }
        ]}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A']}
            style={{ padding: 20, borderRadius: 16 }}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Tokens Sold</Text>
                <Text style={styles.statValue}>{currentBatch?.tokensSold.toLocaleString()}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Users</Text>
                <Text style={styles.statValue}>{currentUser?.shares.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Airdrops</Text>
                <Text style={styles.statValue}>{currentUser?.tokens.toLocaleString()}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Token Price</Text>
                <Text style={styles.statValue}>${currentBatch?.currentPrice.toFixed(2)}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.batchInfo}>
        <Animated.View style={[
          styles.statsCard,
          {
            transform: [{
              scale: animatedBorder.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05],
              })
            }]
          }
        ]}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A']}
            style={{ padding: 20, borderRadius: 16 }}>
            <Text style={styles.batchTitle}>Current Batch: #{currentBatch?.batchNumber}</Text>
            <View style={styles.batchDetailsContainer}>
              <View style={styles.batchDetailRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Price</Text>
                  <Text style={styles.statValue}>${currentBatch?.currentPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Next Price</Text>
                  <Text style={styles.statValue}>${currentBatch?.nextPrice.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.statLabel}>Progress</Text>
                <Text style={styles.statValue}>
                  {currentBatch && currentBatch.totalTokens 
                    ? ((currentBatch.tokensSold / currentBatch.totalTokens) * 100).toFixed(1) 
                    : '0.0'}%
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.referralSection}>
        <Text style={styles.referralTitle}>Your Referral Code</Text>
        <View style={styles.referralCode}>
          <Text style={styles.codeText}>{currentUser?.referralCode}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={handleCopyCode}
          >
            <Ionicons name="copy" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
        <View style={styles.referralButtonsRow}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                const message = `Join GramXRO using my referral code: ${currentUser?.referralCode}. Sign up here: https://gramx.netlify.app/register?ref=${currentUser?.referralCode}`;
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  await Sharing.shareAsync(message);
                } else {
                  Alert.alert('Sharing is not available on this device');
                }
              } catch (error) {
                console.error('Error sharing:', error);
                Alert.alert('Error', 'Failed to share referral link');
              }
            }}
          >
            <Text style={styles.shareButtonText}>Share & Earn</Text>
            <Ionicons name="share-social" size={20} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.referralsButton}
            onPress={() => router.push('/(tabs)/referrals')}
          >
            <Text style={styles.referralsButtonText}>My Referrals</Text>
            <Ionicons name="people" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
        {currentUser?.referralCount ? (
          <Text style={styles.referralStats}>
            You've referred {currentUser.referralCount} {currentUser.referralCount === 1 ? 'person' : 'people'} and earned {currentUser.referralEarnings} tokens!
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    color: '#BBB',
    fontSize: 14,
  },
  username: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
  },
  statsCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#FFD700',
    boxShadow: '0 4px 10px rgba(255, 215, 0, 0.6)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    color: '#BBB',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  batchInfo: {
    padding: 20,
  },
  batchTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  batchDetailsContainer: {
    gap: 20,
  },
  batchDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
  },
  referralSection: {
    padding: 20,
  },
  referralTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  referralCode: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    boxShadow: '0 4px 8px rgba(255, 215, 0, 0.4)',
  },
  codeText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  referralButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: 'rgb(233, 203, 6)', 
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    boxShadow: '0 4px 8px rgba(255, 215, 0, 0.5)',
    backdropFilter: 'blur(10px)',
    flex: 1,
    marginRight: 8,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  referralsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    boxShadow: '0 4px 8px rgba(255, 215, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    flex: 1,
  },
  referralsButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  referralStats: {
    color: '#BBB',
    fontSize: 14,
    textAlign: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});