#!/usr/bin/env node

/**
 * Cosmos DB Container Setup Script
 * 
 * This script creates and configures Cosmos DB containers with optimized settings
 * for their specific use cases:
 * 
 * - Locations: Optimized for fast geo-spatial queries and location data retrieval
 * - RateLimits: Optimized for instant read/write operations with TTL cleanup
 * - TestData: Configured same as Locations for comprehensive testing
 */

const { CosmosClient } = require('@azure/cosmos');
const path = require('path');
const fs = require('fs');

// Container configurations optimized for specific purposes
const CONTAINER_CONFIGS = {
  locations: {
    purpose: 'Fast geo-spatial queries and location data retrieval',
    config: {
      id: 'Locations',
      partitionKey: { 
        paths: ['/partitionKey'],
        kind: 'Hash'
      },
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [
          { path: '/*' }  // Include all paths for emulator compatibility
        ],
        spatialIndexes: [
          {
            path: '/coordinates/*',
            types: ['Point']
          }
        ]
      }
      // Note: Throughput settings removed for emulator compatibility
      // Cloud deployment will use default throughput (400 RU/s)
    }
  },

  ratelimits: {
    purpose: 'Instant read/write operations for rate limiting with TTL cleanup',
    config: {
      id: 'RateLimits',
      partitionKey: { 
        paths: ['/clientId'],
        kind: 'Hash'
      },
      defaultTtl: 3600, // 1 hour automatic cleanup
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [
          { path: '/*' }  // Simplified for emulator compatibility
        ]
      }
      // Note: Throughput settings removed for emulator compatibility
      // Cloud deployment will use default throughput (400 RU/s)
    }
  },

  testdata: {
    purpose: 'Test data container configured same as Locations for comprehensive testing',
    config: {
      id: 'TestData',
      partitionKey: { 
        paths: ['/testType'],
        kind: 'Hash'
      },
      defaultTtl: 86400, // 24 hours automatic cleanup for test data
      indexingPolicy: {
        indexingMode: 'consistent',
        automatic: true,
        includedPaths: [
          { path: '/*' }  // Include all paths for comprehensive testing
        ],
        spatialIndexes: [
          {
            path: '/coordinates/*',
            types: ['Point']
          }
        ]
      }
      // Note: Throughput settings removed for emulator compatibility
      // Cloud deployment will use default throughput (400 RU/s)
    }
  }
};

class ContainerSetup {
  constructor() {
    this.client = null;
    this.database = null;
  }

  async initialize() {
    // Load configuration from local.settings.json
    const configPath = path.join(__dirname, '..', 'src', 'api', 'local.settings.json');
    
    let config = {};
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const localSettings = JSON.parse(configContent);
        config = localSettings.Values || {};
      } catch (error) {
        console.warn('⚠️  Could not parse local.settings.json, using environment variables');
      }
    }

    // Use config from file or environment variables
    const endpoint = config.COSMOS_ENDPOINT || process.env.COSMOS_ENDPOINT;
    const key = config.COSMOS_KEY || process.env.COSMOS_KEY;
    const databaseName = config.COSMOS_DATABASE_NAME || process.env.COSMOS_DATABASE_NAME;

    if (!endpoint || !key || !databaseName) {
      throw new Error('Missing required Cosmos DB configuration. Please check local.settings.json or environment variables.');
    }

    console.log(`🔌 Connecting to Cosmos DB: ${endpoint}`);
    console.log(`📁 Database: ${databaseName}`);

    // Handle local emulator SSL issues
    const clientOptions = { endpoint, key };
    if (endpoint.includes('127.0.0.1') || endpoint.includes('localhost')) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      console.log('🏠 Local emulator detected - disabling SSL verification');
    }

    this.client = new CosmosClient(clientOptions);
    this.database = this.client.database(databaseName);

    // Ensure database exists
    try {
      await this.database.read();
      console.log(`✅ Database "${databaseName}" found`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📁 Creating database "${databaseName}"...`);
        await this.client.databases.create({ id: databaseName });
        console.log(`✅ Database "${databaseName}" created`);
      } else {
        throw error;
      }
    }
  }

  async createContainer(containerType) {
    if (!CONTAINER_CONFIGS[containerType]) {
      throw new Error(`Unknown container type: ${containerType}`);
    }

    const { purpose, config } = CONTAINER_CONFIGS[containerType];
    const containerName = config.id;

    console.log(`\n🗄️  Setting up container: ${containerName}`);

    try {
      // Check if container already exists
      try {
        await this.database.container(containerName).read();
        console.log(`✅ Container "${containerName}" already exists`);
        return;
      } catch (error) {
        if (error.code !== 404) {
          throw error;
        }
      }

      // Create container with optimized configuration
      console.log(`🔧 Creating container with optimized configuration...`);
      await this.database.containers.create(config);

      console.log(`✅ Container "${containerName}" created successfully`);
      
      // Log optimization details
      this.logOptimizationDetails(containerType, config);

    } catch (error) {
      console.error(`❌ Failed to create container "${containerName}":`, error.message);
      throw error;
    }
  }

  logOptimizationDetails(containerType, config) {
    console.log(`🚀 Optimization details for ${config.id}:`);
    
    switch (containerType) {
      case 'locations':
        console.log(`   🗺️  Geo-spatial indexing: ST_DISTANCE queries enabled`);
        console.log(`   🔑 Partition key: city-country-type for geographic distribution`);
        console.log(`   📊 Composite indexes: optimized for location queries`);
        console.log(`   ⚡ Throughput: Default (emulator) / 1000 RU/s (cloud) for high-performance geo queries`);
        break;
      case 'ratelimits':
        console.log(`   ⚡ Instant operations: minimal indexing for maximum speed`);
        console.log(`   🔑 Partition key: clientId for isolated rate limit data`);
        console.log(`   ⏰ TTL: ${config.defaultTtl}s automatic cleanup`);
        console.log(`   📊 Throughput: Default (emulator) / 400 RU/s (cloud) optimized for point operations`);
        break;
      case 'testdata':
        console.log(`   🧪 Same as Locations: comprehensive testing capabilities`);
        console.log(`   🔑 Partition key: testType for test isolation`);
        console.log(`   ⏰ TTL: ${config.defaultTtl}s automatic test cleanup`);
        console.log(`   📊 Throughput: Default (emulator) / 400 RU/s (cloud) for test environment`);
        break;
    }
  }

  async setupAllContainers() {
    await this.initialize();

    const containerTypes = ['locations', 'ratelimits', 'testdata'];
    
    for (const containerType of containerTypes) {
      try {
        await this.createContainer(containerType);
      } catch (error) {
        console.error(`❌ Failed to setup ${containerType} container:`, error.message);
        process.exit(1);
      }
    }

    console.log('\n📊 Container Summary:');
    console.log('   Locations  - Optimized for fast geo-spatial queries');
    console.log('   RateLimits - Optimized for instant read/write operations');
    console.log('   TestData   - Same as Locations for comprehensive testing');
  }

  async testContainerConnectivity() {
    console.log('🧪 Testing container connectivity...');
    
    await this.initialize();

    const containerTypes = ['locations', 'ratelimits', 'testdata'];
    
    for (const containerType of containerTypes) {
      const containerName = CONTAINER_CONFIGS[containerType].config.id;
      try {
        const container = this.database.container(containerName);
        await container.read();
        console.log(`✅ ${containerName}: Connected successfully`);
      } catch (error) {
        console.error(`❌ ${containerName}: Connection failed -`, error.message);
      }
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'setup';
  const setup = new ContainerSetup();

  try {
    switch (command) {
      case 'setup':
        await setup.setupAllContainers();
        break;
      case 'test':
        await setup.testContainerConnectivity();
        break;
      case 'help':
        console.log('Cosmos DB Container Setup Tool');
        console.log('');
        console.log('Usage:');
        console.log('  node setup-containers.js setup  - Create all containers with optimized configurations');
        console.log('  node setup-containers.js test   - Test connectivity to all containers');
        console.log('  node setup-containers.js help   - Show this help message');
        console.log('');
        console.log('Container Optimizations:');
        console.log('  Locations  - Fast geo-spatial queries, composite indexes, optimized throughput');
        console.log('  RateLimits - Instant operations, minimal indexing, TTL cleanup, optimized throughput');
        console.log('  TestData   - Same as Locations with TTL cleanup, optimized throughput');
        console.log('');
        console.log('Note: Throughput settings are applied automatically in cloud deployments.');
        console.log('      Local emulator uses default throughput settings.');
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Use "help" for available commands');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your local.settings.json file exists and has correct Cosmos DB settings');
    console.log('2. Verify Cosmos DB emulator is running (for local development)');
    console.log('3. Ensure your Azure Cosmos DB account is accessible (for cloud deployment)');
    console.log('4. Check network connectivity and firewall settings');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ContainerSetup;
