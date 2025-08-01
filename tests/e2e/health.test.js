const ApiTestHelper = require('../helpers/api-helper');

describe('Health API E2E Tests', () => {
  let apiHelper;

  beforeAll(() => {
    apiHelper = new ApiTestHelper();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await apiHelper.get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'API is healthy');
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('environment');
    });

    test('should return valid timestamp format', async () => {
      const response = await apiHelper.get('/health');
      
      expect(response.status).toBe(200);
      const timestamp = response.body.data.timestamp;
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    test('should be accessible without authentication', async () => {
      const response = await apiHelper.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await apiHelper.get('/health');
      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // Less than 5 seconds
    });

    test('should have proper CORS headers', async () => {
      const response = await apiHelper.get('/health');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });
});
