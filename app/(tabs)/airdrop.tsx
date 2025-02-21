import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

const tasks = [
  {
    id: 1,
    platform: 'telegram',
    title: 'Join Our Telegram Community',
    icon: 'paper-plane',
    reward: 0.25,
    url: 'https://t.me/yourgroup',
    completed: false,
  },
  {
    id: 2,
    platform: 'instagram',
    title: 'Follow on Instagram',
    icon: 'logo-instagram',
    reward: 0.25,
    url: 'https://instagram.com/youraccount',
    completed: false,
  },
  {
    id: 3,
    platform: 'youtube',
    title: 'Subscribe on YouTube',
    icon: 'logo-youtube',
    reward: 0.25,
    url: 'https://youtube.com/@yourchannel',
    completed: false,
  },
  {
    id: 4,
    platform: 'twitter',
    title: 'Follow on Twitter',
    icon: 'logo-twitter',
    reward: 0.25,
    url: 'https://twitter.com/youraccount',
    completed: false,
  },
  {
    id: 5,
    platform: 'discord',
    title: 'Join Our Discord Server',
    icon: 'logo-discord',
    reward: 0.25,
    url: 'https://discord.gg/yourserver',
    completed: false,
  },
];

export default function AirdropScreen() {
  const insets = useSafeAreaInsets();

  const handleTaskClick = (url: string) => {
    // On web, open in new tab
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      // On mobile, use Linking
      open(url);
    }
  };

  const totalEarned = tasks.filter(task => task.completed).reduce((sum, task) => sum + task.reward, 0);
  const totalAvailable = tasks.reduce((sum, task) => sum + task.reward, 0);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Earn More Coins</Text>
          <Text style={styles.subtitle}>Complete tasks to earn rewards</Text>
        </View>
        <TouchableOpacity style={styles.referButton}>
          <Ionicons name="share-social" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.balanceCard}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.gradientCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceValue}>{totalEarned.toFixed(2)} Coins</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.balanceLabel}>Available to Earn</Text>
              <Text style={styles.balanceValue}>{(totalAvailable - totalEarned).toFixed(2)} Coins</Text>
            </View>
          </View>
          <Text style={styles.listingPrice}>Listing Price: $1.10 per coin</Text>
        </LinearGradient>
      </View>

      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Complete Tasks to Earn</Text>
        {tasks.map((task) => (
          <TouchableOpacity 
            key={task.id} 
            style={[
              styles.taskCard,
              task.completed && styles.taskCardCompleted
            ]}
            onPress={() => handleTaskClick(task.url)}
          >
            <View style={[styles.taskIcon, task.completed && styles.taskIconCompleted]}>
              <Ionicons name={task.icon} size={24} color={task.completed ? '#4CAF50' : '#FFD700'} />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskReward}>Get {task.reward} Coins</Text>
            </View>
            <View style={styles.taskStatus}>
              {task.completed ? (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color="#FFD700" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.referralSection}>
        <Text style={styles.sectionTitle}>Referral Program</Text>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.referralCard}>
          <View style={styles.referralContent}>
            <View>
              <Text style={styles.referralTitle}>Invite Friends & Earn</Text>
              <Text style={styles.referralDescription}>
                Get 0.5 coins for each friend who joins and completes a task
              </Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Share Now</Text>
              <Ionicons name="share-social" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.scratchCardSection}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.scratchCard}>
          <View style={styles.scratchCardContent}>
            <Ionicons name="gift" size={32} color="#000" />
            <Text style={styles.scratchCardTitle}>Complete 10 Referrals</Text>
            <Text style={styles.scratchCardDescription}>
              Get a scratch card with rewards up to 50 coins!
            </Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding:10,
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  referButton: {
    padding: 8,
  },
  balanceCard: {
    padding: 20,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.7)', // Gold border
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#FFD700', // Gold thin line
    marginHorizontal: 20,
  },
  balanceLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listingPrice: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  tasksSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.7)', // Gold thin border
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    backdropFilter: 'blur(8px)',
  },
  taskCardCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.8,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskIconCompleted: {
    backgroundColor: '#1A1A1A',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  taskReward: {
    color: '#FFD700',
    fontSize: 14,
  },
  taskStatus: {
    padding: 8,
  },
  referralSection: {
    padding: 20,
  },
  referralCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.7)', // Shiny gold border
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    backdropFilter: 'blur(8px)',
  },
  referralContent: {
    padding: 20,
  },
  referralTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  referralDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scratchCardSection: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  scratchCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.7)', // Gold border
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  scratchCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  scratchCardTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  scratchCardDescription: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});
