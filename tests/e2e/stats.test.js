/**
 * E2E tests for Statistics endpoint
 */
const ApiTestHelper = require('../helpers/api-helper');

describe('Statistics API Endpoint', () => {
  let api;

  beforeAll(() => {
    api = new ApiTestHelper();
  });

  describe('GET /stats', () => {
    test('should return API statistics', async () => {
      const response = await api.getStats();
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Statistics retrieved successfully');
      
      const stats = response.body.data;
      expect(stats).toHaveProperty('totalLocations');
      expect(stats).toHaveProperty('totalCities');
      expect(stats).toHaveProperty('locationsByCity');
      expect(stats).toHaveProperty('lastUpdated');
      
      // Validate data types
      expect(typeof stats.totalLocations).toBe('number');
      expect(typeof stats.totalCities).toBe('number');
      expect(Array.isArray(stats.locationsByCity)).toBe(true);
      expect(typeof stats.lastUpdated).toBe('string');
      
      // Validate ranges
      expect(stats.totalLocations).toBeGreaterThanOrEqual(0);
      expect(stats.totalCities).toBeGreaterThanOrEqual(0);
      
      // Validate timestamp format
      const lastUpdated = new Date(stats.lastUpdated);
      expect(lastUpdated).toBeInstanceOf(Date);
      expect(lastUpdated.getTime()).not.toBeNaN();
    });

    test('should have consistent location counts', async () => {
      const statsResponse = await api.getStats();
      const locationsResponse = await api.getLocations();
      
      api.assertApiResponseStructure(statsResponse, 200);
      api.assertApiResponseStructure(locationsResponse, 200);
      
      const stats = statsResponse.body.data;
      const locations = locationsResponse.body.data;
      
      // Total locations in stats should match actual location count
      expect(stats.totalLocations).toBe(locations.length);
    });

    test('should validate locationsByCity structure', async () => {
      const response = await api.getStats();
      
      const stats = response.body.data;
      
      stats.locationsByCity.forEach(cityInfo => {
        expect(cityInfo).toHaveProperty('city');
        expect(cityInfo).toHaveProperty('count');
        expect(typeof cityInfo.city).toBe('string');
        expect(typeof cityInfo.count).toBe('number');
        expect(cityInfo.count).toBeGreaterThan(0);
      });
      
      // Sum of city counts should equal total locations
      const sumByCities = stats.locationsByCity.reduce((sum, city) => sum + city.count, 0);
      expect(sumByCities).toBe(stats.totalLocations);
    });

    test('should be accessible without authentication', async () => {
      const response = await api.getStats();
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should have proper CORS headers', async () => {
      const response = await api.getStats();
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['content-type']).toContain('application/json');
    });

    test('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await api.getStats();
      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('should return updated timestamp on each request', async () => {
      const response1 = await api.getStats();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const response2 = await api.getStats();
      
      api.assertApiResponseStructure(response1, 200);
      api.assertApiResponseStructure(response2, 200);
      
      const timestamp1 = new Date(response1.body.data.lastUpdated);
      const timestamp2 = new Date(response2.body.data.lastUpdated);
      
      expect(timestamp2.getTime()).toBeGreaterThan(timestamp1.getTime());
    });
  });
});
