import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../services/auth';
import type { User } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default base64 image (a simple colored circle)
const DEFAULT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMDEtMTVUMTU6MDM6NDMtMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTAxLTE1VDE1OjA0OjU2LTA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTAxLTE1VDE1OjA0OjU2LTA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjcyMTI5ZmU5LTk2ZGQtNDQyZS1iYmY0LTU1ZmYzNmRiYWY0YSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpjMzMwNDBiMS0zN2E0LTQ1ZDYtOTViMy1iYWU5MmMwN2I0YjkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjMzMwNDBiMS0zN2E0LTQ1ZDYtOTViMy1iYWU5MmMwN2I0YjkiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmMzMzA0MGIxLTM3YTQtNDVkNi05NWIzLWJhZTkyYzA3YjRiOSIgc3RFdnQ6d2hlbj0iMjAxOS0wMS0xNVQxNTowMzo0My0wODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjcyMTI5ZmU5LTk2ZGQtNDQyZS1iYmY0LTU1ZmYzNmRiYWY0YSIgc3RFdnQ6d2hlbj0iMjAxOS0wMS0xNVQxNTowNDo1Ni0wODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+pAMhRwAAB39JREFUeJztnc1vHEUWh5+qqu7xJI49HzoTJ05CsolWWg5ICEUrlhMSFw5I/H//BC4IVkKIy0orFiUH5LDKJtFuEuJkbI/tsT3uruLQ3W7PZOzYnq+e7vr5HGV6qjWeJ+/Vq3pV1TsiZcKYgUo2lGRCJTxVMq0SGdNHIvtfjCjgq4JbERRUFFzqS46KcqwsL/dv/jm+cPpF3fYZf8f89gCEzIiYp5xiRqVyzkzn5RYrGOX7f4j3e3A7KsqisjxSkcc6yPMu8fdRjK3fcghjbpBn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';

// Access to AsyncStorage profile image key
const PROFILE_IMAGE_KEY = '@profile_image';

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
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<string | null>(DEFAULT_IMAGE);

  // Immediately try to load the cached image when component mounts
  useEffect(() => {
    const preloadCachedImage = async () => {
      try {
        const cachedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
        if (cachedImage) {
          console.log('ProfileImage: Preloaded from AsyncStorage');
          setImage(cachedImage);
        }
      } catch (error) {
        console.error('Error preloading cached image:', error);
      }
    };
    
    preloadCachedImage();
    
    // Then load the full image data
    loadImage();
  }, []);

  // Then load or reload image when user changes
  useEffect(() => {
    loadImage();
  }, [user?._id]);

  const loadImage = async () => {
    try {
      setLoading(true);
      
      // First try to get the image directly from auth service
      const profileImage = await auth.getProfileImage();
      if (profileImage) {
        console.log('ProfileImage: Loaded image from auth.getProfileImage()');
        setImage(profileImage);
        setLoading(false);
        return;
      }
      
      // If that fails, check user object
      if (user?.profileImage) {
        console.log('ProfileImage: Using image from user object');
        setImage(user.profileImage);
      } else {
        console.log('ProfileImage: No image available, using default');
        // Keep the default image
      }
    } catch (error) {
      console.error('ProfileImage: Error loading image:', error);
      // Keep using the default image
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (!editable) return;
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      
      if (!result.canceled && result.assets[0].base64) {
        setLoading(true);
        
        // Create base64 image data
        const base64 = result.assets[0].base64;
        const type = result.assets[0].type || 'image/jpeg';
        const imageData = `data:${type};base64,${base64}`;
        
        console.log('ProfileImage: New image selected');
        
        // Save to AsyncStorage first for immediate display
        await AsyncStorage.setItem('@profile_image', imageData);
        setImage(imageData);
        
        // Then update through API
        try {
          const response = await auth.updateProfileImage(imageData);
          if (response.success && response.user && onImageUpdate) {
            console.log('ProfileImage: Image updated on server');
            onImageUpdate(response.user);
          }
        } catch (updateError) {
          console.error('ProfileImage: Error updating image on server:', updateError);
          // We already saved locally, so no need to set image to null
        }
      }
    } catch (error) {
      console.error('ProfileImage: Error picking image:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={pickImage}
      disabled={!editable || loading}
      style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {loading ? (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <ActivityIndicator color="#FFD700" size="small" />
        </View>
      ) : image ? (
        <Image
          source={{ uri: image }}
          resizeMode="cover"
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          onError={() => {
            console.log('ProfileImage: Error loading image, using placeholder');
            setImage(null);
          }}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Ionicons name="person" size={size * 0.6} color="#666" />
        </View>
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
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
}); 