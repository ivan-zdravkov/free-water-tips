// Test setup and global configuration
const { spawn } = require('child_process');
const path = require('path');

// API base URL - should point to your local Azure Functions instance
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';

// Global test configuration
global.API_BASE_URL = API_BASE_URL;
global.TEST_TIMEOUT = 30000;

// Helper function to wait for API to be ready
global.waitForApi = async (maxAttempts = 30, interval = 1000) => {
  const request = require('supertest');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await request(API_BASE_URL.replace('/api', ''))
        .get('/api/health')
        .timeout(5000);
      
      if (response.status === 200) {
        console.log(`✅ API is ready after ${attempt} attempts`);
        return true;
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`❌ API not ready after ${maxAttempts} attempts`);
        throw new Error(`API not available at ${API_BASE_URL} after ${maxAttempts} attempts`);
      }
      console.log(`⏳ Waiting for API... attempt ${attempt}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return false;
};

// Global setup - runs before all tests
beforeAll(async () => {
  console.log('🚀 Starting E2E test setup...');
  
  // Wait for API to be available
  await global.waitForApi();
  
  console.log('✅ E2E test setup complete');
}, 60000);

// Global teardown - runs after all tests
afterAll(async () => {
  console.log('🧹 E2E test cleanup complete');
});
