import { Platform } from 'react-native';
import { HealthResponse } from '../types/HealthResponse';

// Android emulator needs 10.0.2.2 to access host's localhost. iOS simulator and web can use localhost
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT || '';

  // Remove trailing slash if present
  let baseUrl = envUrl.replace(/\/$/, '');

  if (Platform.OS === 'android') {
    baseUrl = baseUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }

  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to build API endpoint with proper /api prefix handling
const api = (path: string): string => {
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Check if the base URL already includes /api
  if (API_BASE_URL.includes('/api')) {
    return `${API_BASE_URL}/${cleanPath}`;
  }

  // Add /api prefix if not present
  return `${API_BASE_URL}/api/${cleanPath}`;
};

export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(api('health'));

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
  // Example: const response = await fetch(api('locations'));
  return [];
}
