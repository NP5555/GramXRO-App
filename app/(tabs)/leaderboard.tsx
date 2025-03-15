import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiService, { LeaderboardEntry } from '../services/api';

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getLeaderboard();
      setLeaderboard(data);
    } catch (error: any) {
      console.error('Error loading leaderboard:', error);
      setError(error.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#666666'; // Default color
    }
  };

  const renderLeaderboardItem = (entry: LeaderboardEntry, index: number) => (
    <View key={`${entry.position}-${entry.userId || index}`} style={styles.rankingCard}>
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A']}
        style={styles.gradientCard}
      >
        <View style={styles.rankingContent}>
          <View style={[styles.positionBadge, { backgroundColor: getPositionColor(entry.position) }]}>
            <Text style={styles.positionText}>#{entry.position}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {entry.name}
              {entry.userId === null && ' 👻'}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="cash-outline" size={16} color="#FFD700" />
                <Text style={styles.statText}>{entry.coins.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="share-social-outline" size={16} color="#4CAF50" />
                <Text style={styles.statText}>{entry.shares.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {entry.position <= 3 && (
            <View style={styles.trophyContainer}>
              <Ionicons
                name="trophy"
                size={24}
                color={getPositionColor(entry.position)}
              />
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top performers this week</Text>
      </View>

      <View style={styles.podiumContainer}>
        {leaderboard.slice(0, 3).map((entry, index) => (
          <View 
            key={entry.userId || index} 
            style={[
              styles.podiumItem,
              { 
                height: [120, 150, 100][index],
                backgroundColor: getPositionColor(index + 1)
              }
            ]}
          >
            <Text style={styles.podiumPosition}>#{index + 1}</Text>
            <Text style={styles.podiumName} numberOfLines={1}>{entry.name}</Text>
            <Text style={styles.podiumScore}>{entry.coins.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.rankingsContainer}>
        {leaderboard.map((entry, index) => renderLeaderboardItem(entry, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    marginBottom: 10,
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
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 30,
    height: 180,
  },
  podiumItem: {
    width: '30%',
    margin: 5,
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 10,
    alignItems: 'center',
  },
  podiumPosition: {
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  podiumName: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  podiumScore: {
    color: '#000',
    fontSize: 12,
    marginTop: 2,
  },
  rankingsContainer: {
    paddingHorizontal: 20,
  },
  rankingCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  gradientCard: {
    padding: 16,
  },
  rankingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 4,
  },
  trophyContainer: {
    marginLeft: 12,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});