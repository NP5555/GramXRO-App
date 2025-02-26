import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { api } from '../services/api';

const TASKS = [
  { task: "Join Our Telegram Community", reward: 0.25 },
  { task: "Follow on Instagram", reward: 0.25 },
  { task: "Subscribe on YouTube", reward: 0.25 },
  { task: "Follow on Twitter", reward: 0.25 },
];

export default function AirdropScreen() {
  const insets = useSafeAreaInsets();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const handleTaskComplete = async (task: string) => {
    try {
      // Using ID 1 for demo purposes - in real app, this would come from auth
      const result = await api.completeTask(1, task);
      if (result.success) {
        setCompletedTasks(prev => new Set([...prev, task]));
        Alert.alert('Success', `You earned ${0.25} tokens!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const totalEarned = TASKS.filter(task => completedTasks.has(task.task)).reduce((sum, task) => sum + task.reward, 0);
  const totalAvailable = TASKS.reduce((sum, task) => sum + task.reward, 0);

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Earn More Tokens</Text>
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
              <Text style={styles.balanceValue}>{totalEarned.toFixed(2)} Tokens</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.balanceLabel}>Available to Earn</Text>
              <Text style={styles.balanceValue}>{(totalAvailable - totalEarned).toFixed(2)} Tokens</Text>
            </View>
          </View>
          <Text style={styles.listingPrice}>Listing Price: $1.10 per token</Text>
        </LinearGradient>
      </View>

      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Complete Tasks to Earn</Text>
        {TASKS.map((task) => (
          <TouchableOpacity
            key={task.task}
            style={[
              styles.taskItem,
              completedTasks.has(task.task) && styles.completedTask
            ]}
            onPress={() => handleTaskComplete(task.task)}
            disabled={completedTasks.has(task.task)}
          >
            <View>
              <Text style={styles.taskText}>{task.task}</Text>
              <Text style={styles.rewardText}>Reward: {task.reward} tokens</Text>
            </View>
            {completedTasks.has(task.task) && (
              <Text style={styles.completedText}>✓ Completed</Text>
            )}
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
                Get 0.5 tokens for each friend who joins and completes a task
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
              Get a scratch card with rewards up to 50 tokens!
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
  taskItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedTask: {
    backgroundColor: '#e8f5e9',
  },
  taskText: {
    fontSize: 16,
    fontWeight: '500',
  },
  rewardText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  completedText: {
    color: '#4caf50',
    fontWeight: 'bold',
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
