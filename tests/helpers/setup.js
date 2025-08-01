// Test setup and global configuration
const { spawn } = require('child_process');
const path = require('path');

// API base URL - should point to your local Azure Functions instance
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';

// Global test configuration
global.API_BASE_URL = API_BASE_URL;
global.TEST_TIMEOUT = 30000;

// Helper function to check if API is ready (single attempt)
global.checkApiReady = async () => {
  const request = require('supertest');
  
  try {
    const response = await request(API_BASE_URL.replace('/api', ''))
      .get('/api/health')
      .timeout(2000);
    
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Helper function to wait for API to be ready (with reasonable timeout)
global.waitForApi = async (maxAttempts = 5, interval = 1000) => {
  console.log('🔍 Checking if API is ready...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isReady = await global.checkApiReady();
    
    if (isReady) {
      console.log(`✅ API is ready!`);
      return true;
    }
    
    if (attempt === maxAttempts) {
      console.error(`❌ API not ready after ${maxAttempts} attempts`);
      console.log('💡 Make sure to start the API with: npm run api:start');
      throw new Error(`Please start the API server first: npm run api:start`);
    }
    
    console.log(`⏳ Waiting for API... attempt ${attempt}/${maxAttempts}`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
};

// Global setup - runs before all tests
beforeAll(async () => {
  console.log('🚀 Starting E2E test setup...');
  
  // Wait for API to be available
  await global.waitForApi();
  
  console.log('✅ E2E test setup complete');
}, 10000);

// Global teardown - runs after all tests
afterAll(async () => {
  console.log('🧹 E2E test cleanup complete');
});
