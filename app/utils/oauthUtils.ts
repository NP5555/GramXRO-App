import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { apiService } from '../services/api';

export interface OAuthResult {
  success: boolean;
  code?: string;
  state?: string;
  error?: string;
}

/**
 * Handles the OAuth flow by opening a browser for authorization
 * and capturing the callback with authorization code
 */
export const handleOAuthFlow = async (taskId: string): Promise<OAuthResult> => {
  try {
    // Get OAuth URL from backend
    const response = await apiService.initiateTaskVerification(taskId);
    
    if (!response.success || !response.url) {
      return { 
        success: false, 
        error: response.message || 'Failed to get authorization URL' 
      };
    }

    // Set up URL listener for the callback
    const redirectUrl = Linking.createURL('oauth-callback');
    console.log('Redirect URL:', redirectUrl);
    
    // Subscribe to URL events to capture the OAuth callback
    const subscription = Linking.addEventListener('url', handleRedirect);
    
    // Store for resolving the promise when callback is received
    let resolvePromise: (value: OAuthResult) => void;
    const resultPromise = new Promise<OAuthResult>((resolve) => {
      resolvePromise = resolve;
    });
    
    // Function to handle the redirect with auth code
    function handleRedirect(event: { url: string }) {
      const { url } = event;
      console.log('Got redirect URL:', url);
      
      if (!url.includes('oauth-callback')) {
        return;
      }
      
      // Clean up the subscription
      subscription.remove();
      
      // Parse URL for code and state
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');
      
      if (error) {
        resolvePromise({ 
          success: false, 
          error: error 
        });
        return;
      }
      
      if (!code || !state) {
        resolvePromise({ 
          success: false, 
          error: 'Authorization failed: Missing code or state' 
        });
        return;
      }
      
      resolvePromise({ 
        success: true, 
        code, 
        state 
      });
    }
    
    // Open the browser with the authorization URL
    const result = await WebBrowser.openAuthSessionAsync(
      response.url,
      redirectUrl,
      {
        showInRecents: true,
        createTask: Platform.OS === 'android'
      }
    );
    
    // Handle cancellation
    if (result.type === 'cancel') {
      subscription.remove();
      return { 
        success: false, 
        error: 'Authorization was cancelled' 
      };
    }
    
    // Wait for the callback to resolve the promise
    return await resultPromise;
    
  } catch (error: any) {
    console.error('OAuth flow error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to complete authorization' 
    };
  }
};

/**
 * Verifies the task completion using the authorization code from OAuth
 */
export const verifyTaskCompletion = async (code: string, state: string): Promise<boolean> => {
  try {
    const response = await apiService.completeTaskVerification(code, state);
    return response.success && response.verified;
  } catch (error: any) {
    console.error('Verification error:', error);
    Alert.alert('Verification Error', error.message || 'Failed to verify task completion');
    return false;
  }
}; 