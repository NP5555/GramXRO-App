import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Easing, ActivityIndicator, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { apiService, Batch } from '../services/api';

export default function PresaleScreen() {
  const insets = useSafeAreaInsets();
  const animatedValue = new Animated.Value(1);
  const [batchData, setBatchData] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch batch data on mount
  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        const data = await apiService.getCurrentBatch();
        console.log('Fetched batch data:', data);
        setBatchData(data);
      } catch (error: any) {
        console.error('Error fetching batch data:', error);
        setError('Failed to load batch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
    startButtonAnimation();
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

  const handlePurchase = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const purchaseAmount = Number(amount);
    if (purchaseAmount < 100) {
      Alert.alert('Error', 'Minimum purchase amount is 100');
      return;
    }

    setProcessing(true);
    try {
      const result = await apiService.purchaseTokens(purchaseAmount);
      if (result.success) {
        Alert.alert('Success', `Successfully purchased tokens! New balance: ${result.data?.newBalance}`);
        // Refresh batch data
        const newBatchData = await apiService.getCurrentBatch();
        setBatchData(newBatchData);
        setAmount('');
      } else {
        Alert.alert('Error', result.message || 'Failed to purchase tokens');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to purchase tokens');
    } finally {
      setProcessing(false);
    }
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

  const estimatedTokens = amount ? Number(amount) / (batchData?.currentPrice || 1) : 0;

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
          { transform: [{ scale: animatedValue }] }
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
                <Text style={styles.priceValue}>${batchData?.currentPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Next Batch Price</Text>
                <Text style={styles.priceValue}>${batchData?.nextPrice.toFixed(2)}</Text>
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
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor="#666"
              editable={!processing}
            />
          </View>
          <Text style={styles.tokenEstimate}>
            ≈ {estimatedTokens.toFixed(2)} tokens
          </Text>
        </View>
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={processing || !amount}
        >
          <Animated.View style={[
            styles.buyButton,
            (processing || !amount) && styles.disabledButton,
            { transform: [{ scale: animatedValue }] }
          ]}>
            {processing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text style={styles.buyButtonText}>Buy Tokens</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
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
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#999',
    fontSize: 16,
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
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
  },
  gradientContent: {
    padding: 20,
  },
  batchTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceInfo: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
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
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  purchaseSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  inputLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    padding: 0,
  },
  tokenEstimate: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'right',
  },
  buyButton: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
});