/**
 * E2E tests for Nearby Locations endpoint
 */
const ApiTestHelper = require('../helpers/api-helper');

describe('Nearby Locations API Endpoint', () => {
  let api;
  let testLocationIds = [];

  beforeAll(async () => {
    api = new ApiTestHelper();
    
    // Create test locations at known coordinates
    const testLocations = [
      api.createTestLocation({
        name: 'Close Location',
        address: 'Very close to center',
        latitude: 42.6977,
        longitude: 23.3219
      }),
      api.createTestLocation({
        name: 'Medium Distance Location',
        address: 'Medium distance from center',
        latitude: 42.7000, // ~0.3km north
        longitude: 23.3250  // ~0.2km east
      }),
      api.createTestLocation({
        name: 'Far Location',
        address: 'Far from center',
        latitude: 42.7500, // ~5.8km north
        longitude: 23.4000  // ~5.5km east
      })
    ];
    
    for (const location of testLocations) {
      const response = await api.createLocation(location);
      if (response.status === 201) {
        testLocationIds.push(response.body.data.id);
      }
    }
    
    // Wait for database to process
    await api.waitForDatabase(2000);
  });

  afterAll(async () => {
    await api.cleanupTestLocations(testLocationIds);
  });

  describe('GET /locations-nearby', () => {
    test('should find nearby locations within default radius', async () => {
      const centerLat = 42.6977;
      const centerLon = 23.3219;
      
      const response = await api.findNearbyLocations(centerLat, centerLon);
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Nearby locations found');
      
      const data = response.body.data;
      expect(data).toHaveProperty('center');
      expect(data.center.latitude).toBe(centerLat);
      expect(data.center.longitude).toBe(centerLon);
      expect(data).toHaveProperty('radius', 10); // Default radius
      expect(data).toHaveProperty('unit', 'km');
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('locations');
      expect(Array.isArray(data.locations)).toBe(true);
      expect(data.locations.length).toBe(data.count);
      
      // Verify location structure and distance
      data.locations.forEach(location => {
        api.assertNearbyLocationStructure(location);
        expect(location.distance).toBeLessThanOrEqual(10); // Within default radius
      });
      
      // Locations should be sorted by distance
      for (let i = 1; i < data.locations.length; i++) {
        expect(data.locations[i].distance).toBeGreaterThanOrEqual(data.locations[i-1].distance);
      }
    });

    test('should find nearby locations within custom radius', async () => {
      const centerLat = 42.6977;
      const centerLon = 23.3219;
      const radius = 1; // 1km radius
      
      const response = await api.findNearbyLocations(centerLat, centerLon, radius);
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data.radius).toBe(radius);
      
      // All locations should be within 1km
      response.body.data.locations.forEach(location => {
        expect(location.distance).toBeLessThanOrEqual(radius);
      });
    });

    test('should return empty results when no locations nearby', async () => {
      // Use coordinates in Antarctica where there are no locations
      const response = await api.findNearbyLocations(-80, 0, 10);
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data.count).toBe(0);
      expect(response.body.data.locations).toEqual([]);
    });

    test('should reject invalid latitude', async () => {
      const response = await api.findNearbyLocations(999, 23.3219, 10);
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid nearby query parameters');
      expect(response.body.error).toContain('latitude');
    });

    test('should reject invalid longitude', async () => {
      const response = await api.findNearbyLocations(42.6977, 999, 10);
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid nearby query parameters');
      expect(response.body.error).toContain('longitude');
    });

    test('should reject invalid radius', async () => {
      const response = await api.findNearbyLocations(42.6977, 23.3219, 150); // > 100km
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid nearby query parameters');
      expect(response.body.error).toContain('Radius');
    });

    test('should handle negative radius gracefully', async () => {
      const response = await api.findNearbyLocations(42.6977, 23.3219, -5);
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
    });

    test('should handle missing coordinates', async () => {
      const response = await api.get('/locations-nearby?radius=10');
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
    });

    test('should work with edge case coordinates', async () => {
      // Test with coordinates at the edge of valid ranges
      const response = await api.findNearbyLocations(90, 180, 10);
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data.center.latitude).toBe(90);
      expect(response.body.data.center.longitude).toBe(180);
    });

    test('should calculate distances correctly', async () => {
      const centerLat = 42.6977;
      const centerLon = 23.3219;
      
      const response = await api.findNearbyLocations(centerLat, centerLon, 50);
      
      if (response.body.data.locations.length > 0) {
        const location = response.body.data.locations[0];
        
        // Verify distance calculation using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (location.latitude - centerLat) * Math.PI / 180;
        const dLon = (location.longitude - centerLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(centerLat * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const expectedDistance = R * c;
        
        // Allow for small rounding differences
        expect(Math.abs(location.distance - expectedDistance)).toBeLessThan(0.01);
      }
    });
  });
});
