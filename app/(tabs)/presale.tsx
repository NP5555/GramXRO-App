import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { api, Batch } from '../services/api'; // Import Batch interface and api

export default function PresaleScreen() {
  const insets = useSafeAreaInsets();
  const animatedValue = new Animated.Value(1);
  const [batchData, setBatchData] = useState<Batch | null>(null); // State for batch data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch batch data on mount
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const data = await api.getCurrentBatch();
        console.log('Fetched batch data:', data); // Debug log
        setBatchData(data);
      } catch (error) {
        console.error('Error fetching batch data:', error);
        setError('Failed to load batch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
    startButtonAnimation(); // Start animation
  }, []);

  const startButtonAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, padding: 20 }]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Token Pre-Sale</Text>
          <Text style={styles.subtitle}>Secure your tokens early</Text>
        </View>
        <TouchableOpacity style={styles.historyButton}>
          <Ionicons name="time" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.batchCard}>
        <Animated.View style={[
          styles.gradientCard,
          { transform: [{ translateY: animatedValue }] }
        ]}>
          <LinearGradient
            colors={['#2A2A2A', '#1A1A1A']}
            style={styles.gradientContent}>
            <Text style={styles.batchTitle}>
              Batch #{batchData?.batchNumber}
            </Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Current Price</Text>
                <Text style={styles.priceValue}>${batchData?.currentPrice || 0}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Next Batch Price</Text>
                <Text style={styles.priceValue}>${batchData?.nextPrice || 0}</Text>
              </View>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={[
                    styles.progress,
                    {
                      width: `${((batchData?.tokensSold || 0) / (batchData?.totalTokens || 1)) * 100}%`,
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {(batchData?.tokensSold || 0).toLocaleString()} / {(batchData?.totalTokens || 0).toLocaleString()} tokens sold
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.purchaseSection}>
        <Text style={styles.sectionTitle}>Purchase Tokens</Text>
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Amount (USD)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <Text style={styles.input}>1000</Text>
          </View>
          <Text style={styles.tokenEstimate}>
            ≈ {(1000 / (batchData?.currentPrice || 1)).toFixed(2)} tokens
          </Text>
        </View>
        <TouchableOpacity>
          <Animated.View style={[
            styles.buyButton,
            { transform: [{ scale: animatedValue }] }
          ]}>
            <Text style={styles.buyButtonText}>Buy Tokens</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Important Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={24} color="#FFD700" />
            <Text style={styles.infoText}>
              Tokens will be distributed after the pre-sale ends
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={24} color="#FFD700" />
            <Text style={styles.infoText}>
              Minimum purchase: $100
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="trending-up" size={24} color="#FFD700" />
            <Text style={styles.infoText}>
              Price increases with each batch
            </Text>
          </View>
        </View>
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
  historyButton: {
    padding: 8,
  },
  batchCard: {
    padding: 20,
  },
  gradientCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  gradientContent: {
    borderRadius: 16,
    padding: 20,
  },
  batchTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInfo: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  priceLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  purchaseSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 4,
  },
  input: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  tokenEstimate: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  buyButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoSection: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
  },
});