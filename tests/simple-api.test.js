/**
 * Simple API test without global setup - run this with API already started
 */
const request = require('supertest');

const API_BASE_URL = 'http://localhost:7071';

describe('Simple API Tests (Manual)', () => {
  test('should respond to health check', async () => {
    const response = await request(API_BASE_URL)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API is healthy');
    expect(response.body.data.status).toBe('healthy');
  });

  test('should return locations list', async () => {
    const response = await request(API_BASE_URL)
      .get('/api/locations')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Locations retrieved successfully');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('should handle search with valid query', async () => {
    const response = await request(API_BASE_URL)
      .get('/api/locations-search?q=water')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Search completed successfully');
    expect(response.body.data).toHaveProperty('query', 'water');
    expect(response.body.data).toHaveProperty('count');
    expect(Array.isArray(response.body.data.locations)).toBe(true);
  });

  test('should reject search without query', async () => {
    const response = await request(API_BASE_URL)
      .get('/api/locations-search')
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Search query parameter "q" is required');
  });
});
