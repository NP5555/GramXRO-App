import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ProfileImage from './ProfileImage';
import type { User } from '../services/auth';
import { useAuth } from '../context/auth';

interface UserMenuProps {
  user: User | null;
  onImageUpdate?: (user: User) => void;
}

export default function UserMenu({ user, onImageUpdate }: UserMenuProps) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setIsMenuVisible(false);
    router.replace('/(auth)/login');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    if (onImageUpdate) {
      onImageUpdate(updatedUser);
    }
    setIsMenuVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
        <ProfileImage
          user={user}
          size={40}
          editable={false}
        />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.userInfo}>
              <ProfileImage
                user={user}
                size={60}
                editable={true}
                onImageUpdate={handleProfileUpdate}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || ''}</Text>
              </View>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuVisible(false);
                  // Add navigation to profile screen if needed
                }}
              >
                <Ionicons name="person-outline" size={24} color="#FFF" />
                <Text style={styles.menuItemText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    marginTop: 60,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#999',
    fontSize: 14,
    marginTop: 2,
  },
  menuItems: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 12,
  },
  logoutText: {
    color: '#FF6B6B',
  },
}); 