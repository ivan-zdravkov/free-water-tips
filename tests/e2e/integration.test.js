/**
 * Integration tests for the complete API workflow
 */
const ApiTestHelper = require('../helpers/api-helper');

describe('API Integration Tests', () => {
  let api;
  let testLocationIds = [];

  beforeAll(() => {
    api = new ApiTestHelper();
  });

  afterAll(async () => {
    await api.cleanupTestLocations(testLocationIds);
  });

  describe('Complete API Workflow', () => {
    test('should support full CRUD workflow', async () => {
      // 1. Check API health
      const healthResponse = await api.getHealth();
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.data.status).toBe('healthy');

      // 2. Get initial stats
      const initialStatsResponse = await api.getStats();
      expect(initialStatsResponse.status).toBe(200);
      const initialStats = initialStatsResponse.body.data;

      // 3. Get initial locations count
      const initialLocationsResponse = await api.getLocations();
      expect(initialLocationsResponse.status).toBe(200);
      const initialLocationCount = initialLocationsResponse.body.data.length;

      // 4. Create a new location
      const newLocation = api.createTestLocation({
        name: 'Integration Test Location',
        address: 'Integration Test Street, Sofia, Bulgaria',
        latitude: 42.6500,
        longitude: 23.3000,
        description: 'Location created during integration test'
      });

      const createResponse = await api.createLocation(newLocation);
      expect(createResponse.status).toBe(201);
      const createdLocation = createResponse.body.data;
      testLocationIds.push(createdLocation.id);

      // 5. Verify the location appears in the list
      const updatedLocationsResponse = await api.getLocations();
      expect(updatedLocationsResponse.status).toBe(200);
      expect(updatedLocationsResponse.body.data.length).toBe(initialLocationCount + 1);
      
      const foundLocation = updatedLocationsResponse.body.data.find(loc => loc.id === createdLocation.id);
      expect(foundLocation).toBeDefined();
      expect(foundLocation.name).toBe(newLocation.name);

      // 6. Search for the location
      const searchResponse = await api.searchLocations('Integration Test');
      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data.count).toBeGreaterThan(0);
      
      const searchedLocation = searchResponse.body.data.locations.find(loc => loc.id === createdLocation.id);
      expect(searchedLocation).toBeDefined();

      // 7. Find the location using nearby search
      const nearbyResponse = await api.findNearbyLocations(42.6500, 23.3000, 1);
      expect(nearbyResponse.status).toBe(200);
      expect(nearbyResponse.body.data.count).toBeGreaterThan(0);
      
      const nearbyLocation = nearbyResponse.body.data.locations.find(loc => loc.id === createdLocation.id);
      expect(nearbyLocation).toBeDefined();
      expect(nearbyLocation.distance).toBeLessThan(0.1); // Very close

      // 8. Check updated stats
      const finalStatsResponse = await api.getStats();
      expect(finalStatsResponse.status).toBe(200);
      const finalStats = finalStatsResponse.body.data;
      expect(finalStats.totalLocations).toBe(initialStats.totalLocations + 1);
    });

    test('should handle multiple locations workflow', async () => {
      // Create multiple test locations
      const testLocations = api.createTestLocations(3).map((loc, index) => ({
        ...loc,
        name: `Bulk Test Location ${index + 1}`,
        latitude: 42.6800 + (index * 0.001),
        longitude: 23.3100 + (index * 0.001)
      }));

      const createdLocations = [];
      for (const location of testLocations) {
        const response = await api.createLocation(location);
        expect(response.status).toBe(201);
        createdLocations.push(response.body.data);
        testLocationIds.push(response.body.data.id);
      }

      // Wait for database to process
      await api.waitForDatabase(1000);

      // Search should find all of them
      const searchResponse = await api.searchLocations('Bulk Test');
      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.data.count).toBeGreaterThanOrEqual(3);

      // Nearby search should find them clustered together
      const nearbyResponse = await api.findNearbyLocations(42.6800, 23.3100, 1);
      expect(nearbyResponse.status).toBe(200);
      
      const foundNearbyIds = nearbyResponse.body.data.locations.map(loc => loc.id);
      createdLocations.forEach(created => {
        expect(foundNearbyIds).toContain(created.id);
      });
    });

    test('should handle concurrent requests gracefully', async () => {
      // Make multiple concurrent requests to different endpoints
      const promises = [
        api.getHealth(),
        api.getLocations(),
        api.getStats(),
        api.searchLocations('test'),
        api.findNearbyLocations(42.6977, 23.3219, 10)
      ];

      const results = await Promise.all(promises);
      
      // All requests should succeed
      results.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(300);
        expect(response.body.success).toBe(true);
      });
    });

    test('should validate data consistency across endpoints', async () => {
      // Get data from multiple endpoints and verify consistency
      const [locationsResponse, statsResponse] = await Promise.all([
        api.getLocations(),
        api.getStats()
      ]);

      expect(locationsResponse.status).toBe(200);
      expect(statsResponse.status).toBe(200);

      const locations = locationsResponse.body.data;
      const stats = statsResponse.body.data;

      // Total counts should match
      expect(stats.totalLocations).toBe(locations.length);

      // City distribution should match
      const citiesFromLocations = [...new Set(locations.map(loc => 
        loc.address.split(',').slice(-2, -1)[0]?.trim() || 'Unknown'
      ))];
      expect(stats.totalCities).toBeGreaterThanOrEqual(citiesFromLocations.length - 1); // Account for 'Unknown'
    });

    test('should handle error scenarios gracefully', async () => {
      // Test various error scenarios
      const errorTests = [
        {
          name: 'invalid search query',
          request: () => api.searchLocations(''),
          expectedStatus: 400
        },
        {
          name: 'invalid coordinates',
          request: () => api.findNearbyLocations(999, 999, 10),
          expectedStatus: 400
        },
        {
          name: 'invalid location data',
          request: () => api.createLocation({ name: '' }),
          expectedStatus: 400
        }
      ];

      for (const test of errorTests) {
        const response = await test.request();
        expect(response.status).toBe(test.expectedStatus);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBeDefined();
      }
    });
  });
});
