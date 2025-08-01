/**
 * E2E tests for Location Search endpoint
 */
const ApiTestHelper = require('../helpers/api-helper');

describe('Location Search API Endpoint', () => {
  let api;
  let testLocationIds = [];

  beforeAll(async () => {
    api = new ApiTestHelper();
    
    // Create some test locations for searching
    const testLocations = [
      api.createTestLocation({
        name: 'Central Park Fountain',
        address: 'Central Park, Sofia, Bulgaria',
        description: 'Beautiful fountain in the park'
      }),
      api.createTestLocation({
        name: 'City Mall Water Dispenser',
        address: 'City Mall, Sofia, Bulgaria',
        description: 'Water dispenser near food court'
      }),
      api.createTestLocation({
        name: 'University Drinking Fountain',
        address: 'Sofia University, Sofia, Bulgaria',
        description: 'Free water fountain for students'
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

  describe('GET /locations-search', () => {
    test('should search locations by name', async () => {
      const response = await api.searchLocations('fountain');
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Search completed successfully');
      expect(response.body.data).toHaveProperty('query', 'fountain');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body.data).toHaveProperty('locations');
      expect(Array.isArray(response.body.data.locations)).toBe(true);
      
      // Should find at least the fountain we created
      expect(response.body.data.count).toBeGreaterThan(0);
      expect(response.body.data.locations.length).toBe(response.body.data.count);
      
      // Verify each result contains the search term
      response.body.data.locations.forEach(location => {
        api.assertLocationStructure(location);
        const searchableText = `${location.name} ${location.address} ${location.description || ''}`.toLowerCase();
        expect(searchableText).toContain('fountain');
      });
    });

    test('should search locations by address', async () => {
      const response = await api.searchLocations('sofia');
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data.count).toBeGreaterThan(0);
      
      response.body.data.locations.forEach(location => {
        const searchableText = `${location.name} ${location.address} ${location.description || ''}`.toLowerCase();
        expect(searchableText).toContain('sofia');
      });
    });

    test('should return empty results for non-existent terms', async () => {
      const response = await api.searchLocations('nonexistentxyz123');
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data.count).toBe(0);
      expect(response.body.data.locations).toEqual([]);
    });

    test('should reject search without query parameter', async () => {
      const response = await api.get('/locations-search');
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Search query parameter "q" is required');
    });

    test('should reject very short search queries', async () => {
      const response = await api.searchLocations('a');
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid search query');
      expect(response.body.error).toContain('at least 2 characters');
    });

    test('should reject very long search queries', async () => {
      const longQuery = 'a'.repeat(101);
      const response = await api.searchLocations(longQuery);
      
      api.assertApiResponseStructure(response, 400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid search query');
      expect(response.body.error).toContain('less than 100 characters');
    });

    test('should handle special characters in search', async () => {
      const response = await api.searchLocations('park & fountain');
      
      api.assertApiResponseStructure(response, 200);
      expect(response.body.data).toHaveProperty('query', 'park & fountain');
    });

    test('should be case insensitive', async () => {
      const response1 = await api.searchLocations('FOUNTAIN');
      const response2 = await api.searchLocations('fountain');
      
      api.assertApiResponseStructure(response1, 200);
      api.assertApiResponseStructure(response2, 200);
      
      // Should return same results regardless of case
      expect(response1.body.data.count).toBe(response2.body.data.count);
    });
  });
});
