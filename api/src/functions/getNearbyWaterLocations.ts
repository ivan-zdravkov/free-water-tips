import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import {
  WaterLocation,
  GetNearbyLocationsRequest,
  GetNearbyLocationsResponse,
  WaterLocationType,
} from '../types/WaterLocation';
import { storage } from '../db/InMemoryStorage';

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getNearbyWaterLocations(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse query parameters
    const latitude = parseFloat(request.query.get('latitude') || '');
    const longitude = parseFloat(request.query.get('longitude') || '');
    const radiusKm = parseFloat(request.query.get('radiusKm') || '5');
    const limit = parseInt(request.query.get('limit') || '50');

    // Validate input
    if (isNaN(latitude) || isNaN(longitude)) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid or missing latitude/longitude parameters',
        },
      };
    }

    if (isNaN(radiusKm) || radiusKm <= 0) {
      return {
        status: 400,
        jsonBody: {
          error: 'Invalid radiusKm parameter',
        },
      };
    }

    // Filter locations by distance
    const nearbyLocations: WaterLocation[] = [];
    const allLocations = storage.getAllLocations();

    for (const location of allLocations) {
      const distance = calculateDistance(
        latitude,
        longitude,
        location.latitude,
        location.longitude
      );

      if (distance <= radiusKm) {
        nearbyLocations.push(location);
      }
    }

    // Sort by distance and limit results
    nearbyLocations.sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    const limitedLocations = nearbyLocations.slice(0, limit);

    const response: GetNearbyLocationsResponse = {
      locations: limitedLocations,
      total: nearbyLocations.length,
    };

    context.log(
      `Found ${response.total} locations within ${radiusKm}km, returning ${limitedLocations.length}`
    );

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error) {
    context.error('Error fetching nearby water locations:', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Failed to fetch locations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

app.http('getNearbyWaterLocations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getNearbyWaterLocations,
  route: 'water/nearby',
});
