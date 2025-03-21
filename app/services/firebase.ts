import React from 'react';
import { Platform } from 'react-native';
import firebaseApp from '@react-native-firebase/app';
import firebaseAuth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Initialize Firebase if it's not already initialized
export const initializeFirebase = () => {
  if (!firebaseApp().apps.length) {
    // Firebase is already initialized by the google-services.json for Android
    // and GoogleService-Info.plist for iOS
    console.log('Firebase initialization completed');
  } else {
    console.log('Firebase already initialized');
  }
  
  // Configure Google Sign-In
  GoogleSignin.configure({
    // Use web client ID for iOS and Android client ID based on platform
    webClientId: '214397392620-8g8j6r9gv3pf0kema68esk5p2cvadge0.apps.googleusercontent.com',
    offlineAccess: true,
  });
};

// Google Sign In method
export const signInWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = firebaseAuth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await firebaseAuth().signInWithCredential(googleCredential);
    
    const user = userCredential.user;
    console.log('Google sign in successful!', user);
    
    // Return user data for the app's authentication context
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Sign out method
export const signOut = async () => {
  try {
    await firebaseAuth().signOut();
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export default {
  initializeFirebase,
  signInWithGoogle,
  signOut,
}; 