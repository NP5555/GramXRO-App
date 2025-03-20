import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { apiService, Task } from '../services/api';
import { handleOAuthFlow } from '../utils/oauthUtils';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskCompletionAlert from '../components/TaskCompletionAlert';
import { useUser } from '../context/UserContext';

// Add completedBy to Task interface
interface ExtendedTask extends Task {
  completedBy: string[];
  description: string;
  platform?: string;
  platformId?: string;
  verificationMethod?: string;
  isActive: boolean;
}

export default function AirdropScreen() {
  const insets = useSafeAreaInsets();
  const { user, addCompletedTask, refreshUserData } = useUser();
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingTask, setProcessingTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success' as 'success' | 'warning' | 'error',
    title: '',
    message: ''
  });

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await apiService.getTasks();
        setTasks(tasksData as ExtendedTask[]);
      } catch (error: any) {
        console.error('Error fetching tasks:', error);
        setError(error.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Helper function to check if a task is completed
  const isTaskCompleted = (task: ExtendedTask): boolean => {
    return task.completedBy?.includes(user?._id || '') || false;
  };

  // Helper function to show alert
  const showAlert = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message
    });
  };

  // Helper function to hide alert
  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleTaskComplete = async (taskId: string) => {
    const taskToComplete = tasks.find(t => t._id === taskId);
    if (!taskToComplete) {
      showAlert('error', 'Error', 'Task not found');
      return;
    }

    if (isTaskCompleted(taskToComplete)) {
      showAlert(
        'warning',
        'Already Completed',
        'You have already completed this task and received your rewards.'
      );
      return;
    }

    if (processingTask) {
      return;
    }

    setProcessingTask(taskId);
    
    try {
      if (taskToComplete.type === 'oauth') {
        await handleOAuthTaskCompletion(taskToComplete);
      } else {
        console.log('Completing task:', taskToComplete);
        const result = await apiService.completeTask(taskToComplete.task);
        
        if (result.success) {
          // Update both local and global state
          setTasks(prevTasks => prevTasks.map(task => 
            task._id === taskId 
              ? { ...task, completedBy: [...(task.completedBy || []), user?._id || ''] }
              : task
          ));
          
          // Update global user state
          addCompletedTask(taskId, taskToComplete.reward);
          
          showAlert(
            'success',
            'Task Completed!',
            `Congratulations! You've earned ${taskToComplete.reward} tokens.`
          );
        } else {
          if (result.message?.toLowerCase().includes('already completed')) {
            showAlert(
              'warning',
              'Already Completed',
              'You have already completed this task and received your rewards.'
            );
            await refreshUserData(); // Refresh user data to get updated state
          } else {
            showAlert('error', 'Error', result.message || 'Failed to complete task');
          }
        }
      }
    } catch (error: any) {
      console.error('Task completion error:', error);
      const errorMessage = error.message?.toLowerCase();
      
      if (errorMessage?.includes('already completed')) {
        showAlert(
          'warning',
          'Already Completed',
          'You have already completed this task and received your rewards.'
        );
        await refreshUserData(); // Refresh user data to get updated state
      } else {
        showAlert('error', 'Error', error.message || 'Failed to complete task');
      }
    } finally {
      setProcessingTask(null);
    }
  };

  const handleOAuthTaskCompletion = async (task: ExtendedTask) => {
    try {
      // Start OAuth flow
      const oauthResult = await handleOAuthFlow(task._id);
      
      if (!oauthResult.success) {
        // OAuth flow was cancelled or failed
        Alert.alert('Authentication Cancelled', oauthResult.error || 'The authentication process was cancelled');
        return;
      }

      // OAuth flow succeeded, but verification happens in the callback handler
      // We don't mark the task as completed here as that will happen when the 
      // OAuth callback is processed successfully
      Alert.alert('Verification in Progress', 
        'Your task is being verified. You will be notified when it completes.');
      
    } catch (error: any) {
      console.error('OAuth task completion error:', error);
      Alert.alert('Error', error.message || 'Failed to complete OAuth task');
    }
  };

  // Calculate total earned and available tokens
  const totalEarned = tasks
    .filter(task => isTaskCompleted(task))
    .reduce((sum, task) => sum + task.reward, 0);

  const totalAvailable = tasks.reduce((sum, task) => sum + task.reward, 0);

  // Helper function to get task icon
  const getTaskIcon = (task: ExtendedTask) => {
    if (task.platform === 'youtube') return 'logo-youtube';
    if (task.platform === 'twitter') return 'logo-twitter';
    if (task.platform === 'discord') return 'logo-discord';
    if (task.platform === 'telegram') return 'paper-plane';
    return 'checkmark-circle-outline';
  };

  const openTaskDetail = (task: ExtendedTask) => {
    setSelectedTask(task);
    setIsModalVisible(true);
  };

  const closeTaskDetail = () => {
    setIsModalVisible(false);
  };

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
    <>
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
                <Text style={styles.statValue}>{user?.totalTokens.toLocaleString() || '0'}</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>{tasks.reduce((sum, task) => sum + task.reward, 0).toLocaleString()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.tasksList}>
          {tasks.length === 0 ? (
            <Text style={styles.noDataText}>No tasks available at the moment.</Text>
          ) : (
            tasks.map((task) => (
              <TouchableOpacity 
                key={task._id} 
                style={styles.taskCard}
                onPress={() => openTaskDetail(task)}
              >
                <LinearGradient
                  colors={['#2A2A2A', '#1A1A1A']}
                  style={styles.gradientTask}
                >
                  <View style={styles.taskContent}>
                    <View style={styles.taskIconContainer}>
                      <Ionicons 
                        name={getTaskIcon(task)} 
                        size={24} 
                        color={isTaskCompleted(task) ? '#4CAF50' : '#FFD700'} 
                      />
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskText}>{task.task}</Text>
                      <Text style={styles.rewardText}>
                        {isTaskCompleted(task) ? (
                          `Earned ${task.reward} tokens ✓`
                        ) : (
                          `${task.reward.toLocaleString()} tokens`
                        )}
                      </Text>
                      {task.type === 'oauth' && (
                        <Text style={styles.taskType}>Requires verification</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        isTaskCompleted(task) && styles.completedButton,
                        processingTask === task._id && styles.processingButton
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleTaskComplete(task._id);
                      }}
                      disabled={isTaskCompleted(task) || processingTask === task._id}
                    >
                      {processingTask === task._id ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : isTaskCompleted(task) ? (

                        <View style={styles.completedButtonContent}>
                          <Ionicons name="checkmark" size={20} color="#FFF" />
                          <Text style={styles.completedButtonText}>Done</Text>
                        </View>
                      ) : (
                        <Text style={styles.completeButtonText}>
                          {task.type === 'oauth' ? 'Verify' : 'Complete'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
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

        {/* Task Detail Modal */}
        <TaskDetailModal
          visible={isModalVisible}
          task={selectedTask}
          onClose={closeTaskDetail}
          onCompleteTask={handleTaskComplete}
          isProcessing={selectedTask ? processingTask === selectedTask._id : false}
          isCompleted={selectedTask ? isTaskCompleted(selectedTask) : false}
        />
      </ScrollView>

      <TaskCompletionAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    marginBottom: 10,
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
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
  taskType: {
    color: '#BBB',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
  completedButton: {
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  processingButton: {
    backgroundColor: '#FFA000',
    opacity: 0.8,
  },
  completedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});