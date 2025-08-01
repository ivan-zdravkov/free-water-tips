/**
 * Test setup configuration for E2E tests
 */

// Set test timeout to 30 seconds for Azure Functions startup
jest.setTimeout(30000);

// Global test configuration
global.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7071/api';

// Mock console to reduce noise during tests unless explicitly needed
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error
};

// Setup function to run before all tests
beforeAll(async () => {
  console.log('🚀 Starting E2E test suite...');
  console.log(`API Base URL: ${global.API_BASE_URL}`);
  
  // Wait a bit for Azure Functions to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
});

// Cleanup function to run after all tests
afterAll(async () => {
  console.log('✅ E2E test suite completed');
  
  // Restore console
  global.console = originalConsole;
});
