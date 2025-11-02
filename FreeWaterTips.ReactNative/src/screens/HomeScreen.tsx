import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { getHealth } from '../services/api';
import { HealthResponse } from '../types/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthStatus();
  }, []);

  const loadHealthStatus = async () => {
    try {
      setLoading(true);
      const healthData = await getHealth();
      setHealth(healthData);
      setError(null);
    } catch (err) {
      setError('Failed to load health status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello, world!</Text>
      <Text style={styles.subtitle}>Welcome to Free Water Tips</Text>
      
      <View style={styles.statusContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1b6ec2" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : health ? (
          <>
            <Text style={styles.statusText}>
              Status: {health.status}
            </Text>
            <Text style={styles.statusText}>
              Environment: {health.environment}
            </Text>
            <Text style={styles.statusText}>
              Cosmos DB: {health.cosmosConnected ? '✓ Connected' : '✗ Disconnected'}
            </Text>
            <Text style={styles.timestampText}>
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </Text>
          </>
        ) : null}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Weather')}
        >
          <Text style={styles.buttonText}>Weather</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 30,
    minHeight: 100,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#e50000',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#1b6ec2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
