import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, LeaderboardEntry } from '../services/api';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        console.log('Fetched leaderboard data:', data); // Debug log
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers this week</Text>
      </View>

      <View style={styles.rewardsCard}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.gradientCard}>
          <Text style={styles.rewardsTitle}>Leaderboard Rewards</Text>
          <View style={styles.rewardsGrid}>
            <View style={styles.rewardItem}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.rewardValue}>25,000</Text>
              <Text style={styles.rewardLabel}>1st Prize</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="trophy" size={24} color="#C0C0C0" />
              <Text style={styles.rewardValue}>15,000</Text>
              <Text style={styles.rewardLabel}>2nd Prize</Text>
            </View>
            <View style={styles.rewardItem}>
              <Ionicons name="trophy" size={24} color="#CD7F32" />
              <Text style={styles.rewardValue}>10,000</Text>
              <Text style={styles.rewardLabel}>3rd Prize</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.rankingsSection}>
        {leaderboard.length === 0 ? (
          <Text style={styles.noDataText}>No leaderboard data available.</Text>
        ) : (
          leaderboard.map((user, index) => (
            <View key={user._id} style={styles.rankingCard}>
              <LinearGradient
                colors={['#2A2A2A', '#1A1A1A']}
                style={styles.gradientRankCard}>
                <View style={styles.rankPosition}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                  {index < 3 && (
                    <Ionicons
                      name="trophy"
                      size={20}
                      color={
                        index === 0
                          ? '#FFD700'
                          : index === 1
                          ? '#C0C0C0'
                          : '#CD7F32'
                      }
                    />
                  )}
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.userId.name || 'Unknown'}</Text>
                  <Text style={styles.userStats}>
                    {(user.shares || 0)} Shares • {(user.coins || 0).toFixed(2)} Coins
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
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
    padding: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
    marginTop: 4,
  },
  rewardsCard: {
    padding: 20,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  gradientRankCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardsTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  rewardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rewardLabel: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  rankingsSection: {
    padding: 20,
  },
  rankingCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  rankPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userStats: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});