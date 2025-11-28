import { HealthResponse } from '../types/HealthResponse';
import { WaterLocation, WaterFeedback, GetNearbyLocationsResponse } from '../types/WaterLocation';
import { apiUrl } from '../utils/api';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(apiUrl('health'));

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();

  return data as HealthResponse;
}

export async function getNearbyWaterLocations(
  latitude: number,
  longitude: number,
  radiusKm: number,
  limit?: number
): Promise<GetNearbyLocationsResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radiusKm: radiusKm.toString(),
  });

  if (limit !== undefined) {
    params.append('limit', limit.toString());
  }

  const response = await fetch(apiUrl(`water/nearby?${params.toString()}`));

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data as GetNearbyLocationsResponse;
}

export async function saveWaterFeedback(
  locationId: string,
  latitude: number,
  longitude: number,
  isAvailable: boolean,
  userId: string,
  osmId?: string,
  name?: string,
  type?: string
): Promise<{ success: boolean; feedback: WaterFeedback; location: WaterLocation | null }> {
  const response = await fetch(apiUrl('water/feedback'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId,
      latitude,
      longitude,
      osmId,
      isAvailable,
      userId,
      name,
      type,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
