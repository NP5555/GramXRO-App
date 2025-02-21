import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const leaderboardData = [
  { id: 1, name: 'Julio', shares: 2874, coins: 6459.25 },
  { id: 2, name: 'Sarah K.', shares: 2456, coins: 5526.00 },
  { id: 3, name: 'Alex M.', shares: 2198, coins: 4945.50 },
  { id: 4, name: 'John D.', shares: 1987, coins: 4470.75 },
  { id: 5, name: 'Maria R.', shares: 1854, coins: 4171.50 },
];

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();

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
        {leaderboardData.map((user, index) => (
          <View key={user.id} style={styles.rankingCard}>
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
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userStats}>
                {user.shares} Shares • {user.coins} Coins
              </Text>
            </View>
          </View>
        ))}
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
  rewardsCard: {
    padding: 20,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD700', // Thin yellow border
    shadowColor: '#FFD700', // Soft glow effect
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  rewardsTitle: {
    color: '#FFF',
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rewardLabel: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  rankingsSection: {
    padding: 20,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700', // Yellow border
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  rankPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userStats: {
    color: '#999',
    fontSize: 14,
    marginTop: 4,
  },
});

// export default styles;
