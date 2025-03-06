import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { api } from '../services/api';

// Add interface for Task type
interface Task {
  _id: string;
  task: string;
  reward: number;
  __v?: number;
}

export default function AirdropScreen() {
  const insets = useSafeAreaInsets();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  // Fetch user and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get default user first
        const user = await api.getDefaultUser();
        setUserId(user._id);

        // Then fetch tasks
        const tasksData = await api.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    try {
      if (!userId) {
        throw new Error('No user ID available');
      }

      const taskToComplete = tasks.find(t => t._id === taskId);
      if (!taskToComplete) {
        throw new Error('Task not found');
      }

      const result = await api.completeTask(userId, taskToComplete.task);
      
      if (result.success) {
        setCompletedTasks(prev => new Set([...prev, taskId]));
        Alert.alert('Success', `Task completed successfully!`);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const totalEarned = tasks
    .filter(task => completedTasks.has(task._id))
    .reduce((sum, task) => sum + task.reward, 0);

  const totalAvailable = tasks.reduce((sum, task) => sum + task.reward, 0);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks...</Text>
      </View>
    );
  }

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
        {tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            style={[
              styles.taskItem,
              completedTasks.has(task._id) && styles.completedTask
            ]}
            onPress={() => handleTaskComplete(task._id)}
            disabled={completedTasks.has(task._id)}
          >
            <View>
              <Text style={styles.taskText}>{task.task}</Text>
              <Text style={styles.rewardText}>Reward: {task.reward} tokens</Text>
            </View>
            {completedTasks.has(task._id) && (
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
    borderColor: 'rgba(255, 215, 0, 0.7)',
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
    backgroundColor: '#FFD700',
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
    borderColor: 'rgba(255, 215, 0, 0.7)',
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
    borderColor: 'rgba(255, 215, 0, 0.7)',
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