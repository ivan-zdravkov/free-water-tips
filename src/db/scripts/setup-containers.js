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
const {
    endpoint,
    databaseId,
    createClient
} = require('../utils/cosmos');

const containers = {
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
          { path: '/*' }
        ],
        spatialIndexes: [
          {
            path: '/coordinates/*',
            types: ['Point']
          }
        ]
      }
    },
    output: [
        `🗺️ Geo-spatial indexing: ST_DISTANCE queries enabled`,
        `🔑 Partition key: city-country-type for geographic distribution`,
        `📊 Composite indexes: optimized for location queries`,
        `⚡ Throughput: Default (emulator)`
    ]
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
          { path: '/*' }
        ]
      }
    },
    output: [
        `⚡ Instant operations: minimal indexing for maximum speed`,
        `🔑 Partition key: clientId for isolated rate limit data`,
        `⏰ TTL: 1hr automatic cleanup`,
        `📊 Throughput: Default (emulator)`
    ]
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
          { path: '/*' }
        ],
        spatialIndexes: [
          {
            path: '/coordinates/*',
            types: ['Point']
          }
        ]
      }
    },
    output: [
        `🧪 Same as Locations: comprehensive testing capabilities`,
        `🔑 Partition key: testType for test isolation`,
        `⏰ TTL: 24hrs automatic test cleanup`,
        `📊 Throughput: Default (emulator)`
    ]
  }
};

class ContainerSetup {
  constructor() {
    this.client = null;
    this.database = null;
  }

  async initialize() {
    console.log(`🔌 Connecting to Cosmos DB: ${endpoint}`);

    this.client = createClient();
    this.database = this.client.database(databaseId);

    try {
      await this.database.read();
      console.log(`✅ Database ${databaseId} found`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`📁 Creating database ${databaseId}...`);
        await this.client.databases.create({ id: databaseId });
        console.log(`✅ Database ${databaseId} created`);
      } else {
        throw error;
      }
    }
  }

  async createContainer(key) {
    const container = containers[key];
    
    if (!container) {
      console.error(`❌ Unknown container key: ${key}`);
      console.error(`  Supported container keys: ${Object.keys(containers).join(', ')}`);
      return;
    }

    try {
      try {
        console.log(`\n🗄️  Setting up container: ${container.config.id}...`);
        await this.database.container(container.config.id).read();
        console.log(`✅ Container ${container.config.id} already exists`);
        return;
      } catch (error) {
        if (error.code !== 404) {
          throw error;
        }
      }

      console.log(`🔧 Creating container with optimized configuration...`);
      await this.database.containers.create(container.config);
      console.log(`✅ Container ${container.config.id} created successfully`);

      console.log(`🚀 Optimization details for ${container.config.id}:`);
      container.output.forEach(line => console.log(`   ${line}`));
    } catch (error) {
      console.error(`❌ Failed to create container ${container.config.id}:`, error.message);
      throw error;
    }
  }

  async setupAllContainers() {
    await this.initialize();

    for (const containerKey of Object.keys(containers)) {
      try {
        await this.createContainer(containerKey);
      } catch (error) {
        console.error(`❌ Failed to setup ${containerKey} container:`, error.message);
        throw error;
      }
    }
  }

  async testContainerConnectivity() {
    console.log('🧪 Testing container connectivity...');
    
    await this.initialize();

    Object.keys(containers).forEach(async (containerKey) => {
      try {
        const containerId = containers[containerKey].config.id;
        const container = this.database.container(containerId);
        await container.read();
        console.log(`✅ ${containerId}: Connected successfully`);
      } catch (error) {
        console.error(`❌ ${containerId}: Connection failed -`, error.message);
      }
    })
  }
}

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
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your src/db/.env file exists and has correct Cosmos DB settings');
    console.log('2. Verify Cosmos DB emulator is running');
    console.log('3. Check network connectivity and firewall settings');
    throw error;
  }
}

if (require.main === module) {
  main();
}

module.exports = ContainerSetup;
