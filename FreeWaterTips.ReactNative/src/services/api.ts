import { HealthResponse } from '../types/api';

// TODO: Update this with your actual Azure Functions endpoint
const API_BASE_URL = process.env.EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT;

export async function getHealth(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
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
