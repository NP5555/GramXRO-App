import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const animatedBorder = new Animated.Value(0);
  const animatedCount = new Animated.Value(0);
  
  // Add animation effect
  React.useEffect(() => {
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

  const handleCopyCode = async () => {
    const referralCode = '3UEQQS1';
    await Clipboard.setStringAsync(referralCode);
    Alert.alert('Success', 'Referral code copied to clipboard!');
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>John Doe</Text>
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
                <Text style={styles.statValue}>2.5M</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Users</Text>
                <Text style={styles.statValue}>125K</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Total Airdrops</Text>
                <Text style={styles.statValue}>500K</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Token Price</Text>
                <Text style={styles.statValue}>$1.38</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.batchInfo}>
        <Text style={styles.batchTitle}>Current Batch: #9</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[
              styles.progress,
              {
                width: animatedBorder.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['75%', '80%'],
                })
              }
            ]}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={{ height: '100%' }}
              />
            </Animated.View>
          </View>
          <Text style={styles.progressText}>75,779 / 100,000 users</Text>
        </View>
      </View>

      <View style={styles.referralSection}>
        <Text style={styles.referralTitle}>Your Referral Code</Text>
        <View style={styles.referralCode}>
          <Text style={styles.codeText}>3UEQQS1</Text>
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
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  progressText: {
    color: '#BBB',
    fontSize: 12,
    marginTop: 4,
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

