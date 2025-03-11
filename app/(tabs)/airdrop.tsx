import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { apiService, Task } from '../services/api';

export default function AirdropScreen() {
  const insets = useSafeAreaInsets();
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTask, setProcessingTask] = useState<string | null>(null);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await apiService.getTasks();
        console.log('Fetched tasks:', tasksData);
        setTasks(tasksData);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        setError(error.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    if (completedTasks.has(taskId) || processingTask) {
      return;
    }

    const taskToComplete = tasks.find(t => t._id === taskId);
    if (!taskToComplete) {
      Alert.alert('Error', 'Task not found');
      return;
    }

    setProcessingTask(taskId);
    try {
      const result = await apiService.completeTask(taskToComplete.task);
      if (result.success) {
        setCompletedTasks(prev => new Set([...prev, taskId]));
        Alert.alert('Success', `Task completed! You earned ${taskToComplete.reward} tokens.`);
      } else {
        Alert.alert('Error', result.message || 'Failed to complete task');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete task');
    } finally {
      setProcessingTask(null);
    }
  };

  const totalEarned = tasks
    .filter(task => completedTasks.has(task._id))
    .reduce((sum, task) => sum + task.reward, 0);

  const totalAvailable = tasks.reduce((sum, task) => sum + task.reward, 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Airdrop Tasks</Text>
          <Text style={styles.subtitle}>Complete tasks to earn tokens</Text>
        </View>
        <TouchableOpacity style={styles.referButton}>
          <Ionicons name="share-social" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsCard}>
        <LinearGradient
          colors={['#2A2A2A', '#1A1A1A']}
          style={styles.gradientCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{totalEarned.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Available</Text>
              <Text style={styles.statValue}>{totalAvailable.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.tasksList}>
        {tasks.length === 0 ? (
          <Text style={styles.noDataText}>No tasks available at the moment.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task._id} style={styles.taskCard}>
              <LinearGradient
                colors={['#2A2A2A', '#1A1A1A']}
                style={styles.gradientTask}
              >
                <View style={styles.taskContent}>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskText}>{task.task}</Text>
                    <Text style={styles.rewardText}>{task.reward.toLocaleString()} tokens</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.completeButton,
                      (completedTasks.has(task._id) || processingTask === task._id) && styles.disabledButton
                    ]}
                    onPress={() => handleTaskComplete(task._id)}
                    disabled={completedTasks.has(task._id) || processingTask === task._id}
                  >
                    {processingTask === task._id ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : completedTasks.has(task._id) ? (
                      <Ionicons name="checkmark" size={24} color="#000" />
                    ) : (
                      <Text style={styles.completeButtonText}>Complete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  referButton: {
    padding: 8,
  },
  statsCard: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tasksList: {
    padding: 20,
  },
  taskCard: {
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
  gradientTask: {
    padding: 16,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 4,
  },
  rewardText: {
    color: '#FFD700',
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  referralSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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