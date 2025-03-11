import React, { useState } from 'react';
import { Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/auth';
import type { User } from '../services/auth';

interface ProfileImageProps {
  user: User | null;
  size?: number;
  onImageUpdate?: (user: User) => void;
  editable?: boolean;
}

export default function ProfileImage({ 
  user, 
  size = 40, 
  onImageUpdate,
  editable = false 
}: ProfileImageProps) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (!editable) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        
        // Create form data
        const localUri = result.assets[0].uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        
        const imageFile = {
          uri: localUri,
          name: filename,
          type,
        };

        // Update profile image
        const response = await auth.updateProfileImage(imageFile);
        if (response.success && response.user && onImageUpdate) {
          onImageUpdate(response.user);
        }
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    } finally {
      setLoading(false);
    }
  };

  const imageUrl = auth.getProfileImageUrl(user);

  return (
    <TouchableOpacity 
      onPress={pickImage}
      disabled={!editable || loading}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFD700" />
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  image: {
    resizeMode: 'cover',
  },
}); 