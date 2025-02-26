import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { api, Batch, User } from '../services/api';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const animatedBorder = new Animated.Value(0);
  const animatedCount = new Animated.Value(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  
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
      try {
        // Using ID 1 for demo purposes - in real app, this would come from auth
        const [user, batch] = await Promise.all([
          api.getCurrentUser(1),
          api.getCurrentBatch()
        ]);
        setCurrentUser(user);
        setCurrentBatch(batch);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopyCode = async () => {
    const referralCode = '3UEQQS1';
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Success', 'Referral code copied to clipboard!');
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{currentUser?.name}</Text>
        </View>
        {/* <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={52} color="#FFD700" />
        </TouchableOpacity> */}

<TouchableOpacity style={styles.profileButton}>
  <Image 
    source={require('../../assets/images/man.png')} 
    style={{ width: 52, height: 52, borderRadius: 26 }} 
  />
</TouchableOpacity>
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
                  {((currentBatch?.tokensSold / currentBatch?.totalTokens) * 100).toFixed(1)}%
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
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share & Earn</Text>
          <Ionicons name="share-social" size={20} color="#000" />
        </TouchableOpacity>
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
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    backdropFilter: 'blur(10px)',
    elevation: 10,
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
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backdropFilter: 'blur(10px)',
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
  shareButton: {
    backgroundColor: 'rgb(233, 203, 6)', 
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  shareButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

// export default styles;

