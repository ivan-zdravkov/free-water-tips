import { Platform } from 'react-native';
import { HealthResponse } from '../types/api';

// Android emulator needs 10.0.2.2 to access host's localhost. iOS simulator and web can use localhost
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT || '';

  if (Platform.OS === 'android') {
    return envUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }

  return envUrl;
};

const API_BASE_URL = getApiBaseUrl();

export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as HealthResponse;
  } catch (error) {
    console.error('Error fetching health status:', error);
    throw error;
  }
}

// Add more API functions here as needed
export async function getLocations() {
  // TODO: Implement locations API call
  return [];
}
