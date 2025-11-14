import { HealthResponse } from '../types/HealthResponse';
import { apiUrl } from '../utils/api';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(apiUrl('health'));

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  return data as HealthResponse;
}
