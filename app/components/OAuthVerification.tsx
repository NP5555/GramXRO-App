import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Task } from '../services/api';

interface OAuthVerificationProps {
  task: Task;
  isProcessing: boolean;
  onVerify: () => void;
  isCompleted: boolean;
}

export default function OAuthVerification({ task, isProcessing, onVerify, isCompleted }: OAuthVerificationProps) {
  const getPlatformIcon = () => {
    switch (task.platform) {
      case 'youtube':
        return 'logo-youtube';
      case 'twitter':
        return 'logo-twitter';
      case 'discord':
        return 'logo-discord';
      case 'telegram':
        return 'paper-plane';
      default:
        return 'checkmark-circle-outline';
    }
  };

  const getPlatformColor = () => {
    switch (task.platform) {
      case 'youtube':
        return '#FF0000';
      case 'twitter':
        return '#1DA1F2';
      case 'discord':
        return '#5865F2';
      case 'telegram':
        return '#0088cc';
      default:
        return '#FFD700';
    }
  };

  const getPlatformName = () => {
    switch (task.platform) {
      case 'youtube':
        return 'YouTube';
      case 'twitter':
        return 'Twitter';
      case 'discord':
        return 'Discord';
      case 'telegram':
        return 'Telegram';
      default:
        return 'Platform';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2A2A2A', '#1A1A1A']}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: getPlatformColor() }]}>
            <Ionicons name={getPlatformIcon() as any} size={28} color="#FFF" />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{getPlatformName()} Verification</Text>
            <Text style={styles.description}>
              {isCompleted 
                ? 'Task successfully verified!' 
                : `You'll be redirected to ${getPlatformName()} to verify this task.`}
            </Text>
          </View>
          
          {!isCompleted && (
            <TouchableOpacity
              style={[styles.button, isProcessing && styles.disabledButton]}
              onPress={onVerify}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.buttonText}>Verify Now</Text>
              )}
            </TouchableOpacity>
          )}
          
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.completedText}>Verified</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#BBB',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  completedText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: 'bold',
  },
}); 