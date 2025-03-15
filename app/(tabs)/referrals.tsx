import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import apiService, { ReferralStats } from '../services/api';

export default function ReferralsScreen() {
  const insets = useSafeAreaInsets();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get user referrals
      try {
        const referralsData = await apiService.getUserReferrals();
        console.log('Referrals data:', referralsData);
      } catch (referralsError) {
        console.error('Error fetching user referrals:', referralsError);
      }

      // Fallback to referral stats if needed
      const stats = await apiService.getReferralStats();
      console.log('Referral stats:', stats);
      setReferralStats(stats);
    } catch (error: any) {
      console.error('Error loading referral stats:', error);
      setError(error.message || 'Failed to load referral statistics');
      Alert.alert('Error', error.message || 'Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralStats?.referralCode) return;
    
    await Clipboard.setStringAsync(referralStats.referralCode);
    Alert.alert('Success', 'Referral code copied to clipboard!');
  };

  const handleCopyLink = async () => {
    const referralLink = `${process.env.FRONTEND_URL || 'https://gramx.netlify.app'}/register?ref=${referralStats?.referralCode}`;
    await Clipboard.setStringAsync(referralLink);
    Alert.alert('Success', 'Referral link copied to clipboard!');
  };

  const handleShare = async () => {
    if (!referralStats) return;
    
    try {
      const referralLink = `${process.env.FRONTEND_URL || 'https://gramx.netlify.app'}/register?ref=${referralStats.referralCode}`;
      const message = `Join GramXR using my referral code: ${referralStats.referralCode}. Sign up here: ${referralLink}`;
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
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading referral data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadReferralStats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Referral Program</Text>
        <Text style={styles.subtitle}>Invite friends and earn rewards</Text>
      </View>

      <View style={styles.statsContainer}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Referrals</Text>
              <Text style={styles.statValue}>{referralStats?.totalReferrals || 0}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Earnings</Text>
              <Text style={styles.statValue}>{referralStats?.referralEarnings || 0} tokens</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.referralCodeSection}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>
        <View style={styles.referralCodeContainer}>
          <Text style={styles.referralCode}>{referralStats?.referralCode || 'N/A'}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
            <Ionicons name="copy-outline" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.referralLinkSection}>
        <Text style={styles.sectionTitle}>Your Referral Link</Text>
        <View style={styles.referralLinkContainer}>
          <Text style={styles.referralLink} numberOfLines={1} ellipsizeMode="middle">
            {referralStats?.referralLink || `${process.env.FRONTEND_URL || 'https://gramx.netlify.app'}/register?ref=${referralStats?.referralCode}`}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Ionicons name="copy-outline" size={20} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={20} color="#000" />
        <Text style={styles.shareButtonText}>Share with Friends</Text>
      </TouchableOpacity>

      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Code</Text>
            <Text style={styles.stepDescription}>Share your unique referral code with friends</Text>
          </View>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Friends Sign Up</Text>
            <Text style={styles.stepDescription}>They register using your referral code</Text>
          </View>
        </View>
        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Earn Rewards</Text>
            <Text style={styles.stepDescription}>Both you and your friend receive 50 tokens</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    color: '#BBB',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  referralCodeSection: {
    marginBottom: 24,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  referralCode: {
    flex: 1,
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  copyButton: {
    padding: 8,
  },
  referralLinkSection: {
    marginBottom: 24,
  },
  referralLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  referralLink: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  howItWorksSection: {
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#999',
    fontSize: 14,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
}); 