const request = require('supertest');

/**
 * Test helper utilities for API E2E tests
 */
class ApiTestHelper {
  constructor(baseUrl = global.API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.request = request(baseUrl.replace('/api', ''));
  }

  /**
   * Create a test location object
   */
  createTestLocation(overrides = {}) {
    return {
      name: 'Test Water Fountain',
      address: '123 Test Street, Sofia, Bulgaria',
      latitude: 42.6977,
      longitude: 23.3219,
      description: 'A test water fountain for E2E testing',
      amenities: ['free', 'accessible'],
      tags: ['fountain', 'public'],
      ...overrides
    };
  }

  /**
   * Create multiple test locations
   */
  createTestLocations(count = 3) {
    const locations = [];
    for (let i = 0; i < count; i++) {
      locations.push(this.createTestLocation({
        name: `Test Water Fountain ${i + 1}`,
        address: `${100 + i} Test Street, Sofia, Bulgaria`,
        latitude: 42.6977 + (i * 0.001),
        longitude: 23.3219 + (i * 0.001)
      }));
    }
    return locations;
  }

  /**
   * Make a GET request to the API
   */
  async get(endpoint) {
    return await this.request
      .get(`/api${endpoint}`)
      .set('Accept', 'application/json')
      .timeout(10000);
  }

  /**
   * Make a POST request to the API
   */
  async post(endpoint, data = {}) {
    return await this.request
      .post(`/api${endpoint}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(data)
      .timeout(10000);
  }

  /**
   * Make a PUT request to the API
   */
  async put(endpoint, data = {}) {
    return await this.request
      .put(`/api${endpoint}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send(data)
      .timeout(10000);
  }

  /**
   * Make a DELETE request to the API
   */
  async delete(endpoint) {
    return await this.request
      .delete(`/api${endpoint}`)
      .set('Accept', 'application/json')
      .timeout(10000);
  }

  /**
   * Assert response structure for locations
   */
  assertLocationStructure(location) {
    expect(location).toHaveProperty('id');
    expect(location).toHaveProperty('name');
    expect(location).toHaveProperty('address');
    expect(location).toHaveProperty('latitude');
    expect(location).toHaveProperty('longitude');
    expect(location.latitude).toBeGreaterThanOrEqual(-90);
    expect(location.latitude).toBeLessThanOrEqual(90);
    expect(location.longitude).toBeGreaterThanOrEqual(-180);
    expect(location.longitude).toBeLessThanOrEqual(180);
    expect(location).toHaveProperty('createdAt');
    expect(location).toHaveProperty('updatedAt');
    
    if (location.amenities) {
      expect(Array.isArray(location.amenities)).toBe(true);
    }
    if (location.tags) {
      expect(Array.isArray(location.tags)).toBe(true);
    }
  }

  /**
   * Assert API response structure
   */
  assertApiResponseStructure(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    
    if (response.body.success) {
      expect(response.body).toHaveProperty('data');
    } else {
      expect(response.body).toHaveProperty('error');
    }
  }

  /**
   * Wait for database operation to complete
   */
  async waitForDatabase(ms = 1000) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up test data by deleting locations
   */
  async cleanupTestLocations(locationIds = []) {
    for (const id of locationIds) {
      try {
        await this.delete(`/locations/${id}`);
      } catch (error) {
        // Ignore cleanup errors
        console.warn(`Failed to cleanup location ${id}:`, error.message);
      }
    }
  }

  // Convenience methods for new API endpoints
  async getHealth() {
    return await this.get('/health');
  }

  async getLocations() {
    return await this.get('/locations');
  }

  async createLocation(locationData) {
    return await this.post('/locations', locationData);
  }

  async searchLocations(query) {
    return await this.get(`/locations-search?q=${encodeURIComponent(query)}`);
  }

  async findNearbyLocations(lat, lon, radius = 10) {
    return await this.get(`/locations-nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
  }

  async getStats() {
    return await this.get('/stats');
  }

  /**
   * Assert nearby location has distance property
   */
  assertNearbyLocationStructure(location) {
    this.assertLocationStructure(location);
    expect(location).toHaveProperty('distance');
    expect(typeof location.distance).toBe('number');
    expect(location.distance).toBeGreaterThanOrEqual(0);
  }
}

module.exports = ApiTestHelper;
