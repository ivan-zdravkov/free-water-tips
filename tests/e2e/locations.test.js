const ApiTestHelper = require('../helpers/api-helper');

describe('Locations API E2E Tests', () => {
  let apiHelper;
  let createdLocationIds = [];

  beforeAll(() => {
    apiHelper = new ApiTestHelper();
  });

  afterAll(async () => {
    // Cleanup any created test locations
    await apiHelper.cleanupTestLocations(createdLocationIds);
  });

  beforeEach(() => {
    createdLocationIds = [];
  });

  describe('GET /api/locations', () => {
    test('should return list of locations', async () => {
      const response = await apiHelper.get('/locations');

      expect(response.status).toBe(200);
      apiHelper.assertApiResponseStructure(response);
      expect(response.body.message).toBe('Locations retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        apiHelper.assertLocationStructure(response.body.data[0]);
      }
    });

    test('should support pagination with limit parameter', async () => {
      const response = await apiHelper.get('/locations?limit=5');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    test('should filter by type parameter', async () => {
      const response = await apiHelper.get('/locations?type=fountain');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        response.body.data.forEach(location => {
          expect(location.type).toBe('fountain');
        });
      }
    });

    test('should filter by verified parameter', async () => {
      const response = await apiHelper.get('/locations?verified=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        response.body.data.forEach(location => {
          expect(location.verified).toBe(true);
        });
      }
    });

    test('should filter by accessible parameter', async () => {
      const response = await apiHelper.get('/locations?accessible=true');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        response.body.data.forEach(location => {
          expect(location.accessible).toBe(true);
        });
      }
    });

    test('should handle multiple filters', async () => {
      const response = await apiHelper.get('/locations?type=fountain&verified=true&limit=3');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
      
      response.body.data.forEach(location => {
        expect(location.type).toBe('fountain');
        expect(location.verified).toBe(true);
      });
    });
  });

  describe('POST /api/locations', () => {
    test('should create a new location with valid data', async () => {
      const newLocation = apiHelper.createTestLocation();
      const response = await apiHelper.post('/locations', newLocation);

      expect(response.status).toBe(201);
      apiHelper.assertApiResponseStructure(response, 201);
      expect(response.body.message).toContain('created');
      
      const createdLocation = response.body.data;
      apiHelper.assertLocationStructure(createdLocation);
      
      // Store ID for cleanup
      createdLocationIds.push(createdLocation.id);
      
      // Verify data matches input
      expect(createdLocation.name).toBe(newLocation.name);
      expect(createdLocation.address).toBe(newLocation.address);
      expect(createdLocation.type).toBe(newLocation.type);
      expect(createdLocation.coordinates.latitude).toBe(newLocation.coordinates.latitude);
      expect(createdLocation.coordinates.longitude).toBe(newLocation.coordinates.longitude);
      expect(createdLocation.accessible).toBe(newLocation.accessible);
      expect(createdLocation.alwaysAvailable).toBe(newLocation.alwaysAvailable);
    });

    test('should reject location with missing required fields', async () => {
      const invalidLocation = {
        name: 'Test Location'
        // Missing required fields: address, type, coordinates, city
      };

      const response = await apiHelper.post('/locations', invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject location with invalid coordinates', async () => {
      const invalidLocation = apiHelper.createTestLocation({
        coordinates: {
          latitude: 'invalid',
          longitude: 23.3219
        }
      });

      const response = await apiHelper.post('/locations', invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject location with coordinates out of range', async () => {
      const invalidLocation = apiHelper.createTestLocation({
        coordinates: {
          latitude: 91, // Invalid: > 90
          longitude: 23.3219
        }
      });

      const response = await apiHelper.post('/locations', invalidLocation);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should handle missing optional fields gracefully', async () => {
      const minimalLocation = {
        name: 'Minimal Test Location',
        address: '123 Test Street, Sofia, Bulgaria',
        type: 'fountain',
        coordinates: {
          latitude: 42.6977,
          longitude: 23.3219
        },
        city: 'Sofia'
      };

      const response = await apiHelper.post('/locations', minimalLocation);

      expect(response.status).toBe(201);
      const createdLocation = response.body.data;
      createdLocationIds.push(createdLocation.id);
      
      // Should have default values for optional fields
      expect(createdLocation.accessible).toBeDefined();
      expect(createdLocation.alwaysAvailable).toBeDefined();
      expect(createdLocation.status).toBe('active');
      expect(createdLocation.verified).toBe(false);
      expect(createdLocation.reports).toBe(0);
    });

    test('should reject invalid JSON', async () => {
      const response = await apiHelper.request
        .post('/api/locations')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid JSON');
    });
  });

  describe('Location Data Validation', () => {
    test('should create location and verify it appears in listings', async () => {
      const newLocation = apiHelper.createTestLocation({
        name: 'Integration Test Location'
      });
      
      // Create location
      const createResponse = await apiHelper.post('/locations', newLocation);
      expect(createResponse.status).toBe(201);
      
      const createdLocation = createResponse.body.data;
      createdLocationIds.push(createdLocation.id);
      
      // Wait for database consistency
      await apiHelper.waitForDatabase(2000);
      
      // Verify it appears in listings
      const listResponse = await apiHelper.get('/locations');
      expect(listResponse.status).toBe(200);
      
      const foundLocation = listResponse.body.data.find(
        loc => loc.id === createdLocation.id
      );
      expect(foundLocation).toBeDefined();
      expect(foundLocation.name).toBe(newLocation.name);
    });
  });
});
