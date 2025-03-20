import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Task } from '../services/api';
import OAuthVerification from './OAuthVerification';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  isProcessing: boolean;
  isCompleted: boolean;
}

export default function TaskDetailModal({
  visible,
  task,
  onClose,
  onCompleteTask,
  isProcessing,
  isCompleted,
}: TaskDetailModalProps) {
  if (!task) return null;

  const handleCompleteTask = () => {
    if (task) {
      onCompleteTask(task._id);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={30} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A']}
            style={styles.contentContainer}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{task.task}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              <View style={styles.rewardSection}>
                <Text style={styles.rewardLabel}>Reward</Text>
                <View style={styles.rewardValue}>
                  <Text style={styles.rewardAmount}>{task.reward.toLocaleString()}</Text>
                  <Text style={styles.rewardToken}>tokens</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Task Description</Text>
              <Text style={styles.description}>
                {task.type === 'oauth' 
                  ? `Complete this task by connecting to ${task.platform || 'the platform'} 
                     and verifying your account. The verification process is automatic 
                     and only takes a few seconds.`
                  : `Complete this simple task to earn tokens. Once completed, 
                     the tokens will be automatically added to your account.`
                }
              </Text>

              {task.type === 'oauth' && (
                <OAuthVerification
                  task={task}
                  isProcessing={isProcessing}
                  onVerify={handleCompleteTask}
                  isCompleted={isCompleted}
                />
              )}

              <View style={styles.infoSection}>
                <Ionicons name="information-circle-outline" size={20} color="#999" />
                <Text style={styles.infoText}>
                  All tasks can only be completed once per account.
                </Text>
              </View>
            </ScrollView>

            {task.type !== 'oauth' && (
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.completeButton, (isCompleted || isProcessing) && styles.disabledButton]}
                  onPress={handleCompleteTask}
                  disabled={isCompleted || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : isCompleted ? (
                    <>
                      <Ionicons name="checkmark" size={20} color="#000" />
                      <Text style={styles.buttonText}>Completed</Text>
                    </>
                  ) : (
                    <Text style={styles.buttonText}>Complete Task</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  contentContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 400,
  },
  rewardSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardLabel: {
    color: '#999',
    fontSize: 16,
  },
  rewardValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rewardAmount: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  rewardToken: {
    color: '#FFD700',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#999',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  completeButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
}); 