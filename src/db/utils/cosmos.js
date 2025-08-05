const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const missingConfig = [];

if (!process.env.COSMOS_ENDPOINT) missingConfig.push('COSMOS_ENDPOINT');
if (!process.env.COSMOS_KEY) missingConfig.push('COSMOS_KEY');
if (!process.env.COSMOS_DATABASE_ID) missingConfig.push('COSMOS_DATABASE_ID');
if (!process.env.COSMOS_LOCATIONS_CONTAINER_ID) missingConfig.push('COSMOS_LOCATIONS_CONTAINER_ID');
if (!process.env.COSMOS_RATE_LIMITS_CONTAINER_ID) missingConfig.push('COSMOS_RATE_LIMITS_CONTAINER_ID');
if (!process.env.COSMOS_TEST_DATA_CONTAINER_ID) missingConfig.push('COSMOS_TEST_DATA_CONTAINER_ID');

if (missingConfig.length > 0) {
    console.error(`❌ Missing required Cosmos DB configuration: ${missingConfig.join(', ')}`);
    console.error('Please check your /src/db/.env file.');
    process.exit(1);
}

// Disable SSL verification for Azure Cosmos DB Emulator (development only)
// The emulator uses a self-signed certificate that Node.js rejects by default
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const containers = {
    "locations": process.env.COSMOS_LOCATIONS_CONTAINER_ID,
    "ratelimits": process.env.COSMOS_RATE_LIMITS_CONTAINER_ID,
    "testdata": process.env.COSMOS_TEST_DATA_CONTAINER_ID,
}

/**
 * Creates a Cosmos DB client with standard configuration
 * @returns {CosmosClient} Configured Cosmos DB client
 */
function createClient() {
    return new CosmosClient({
        endpoint, 
        key,
        connectionPolicy: {
            requestTimeout: 30000
        }
    });
}

/**
 * Gets a container instance for the specified container type
 * @param {CosmosClient} client - Cosmos DB client
 * @param {string} key - Key of container ('locations', 'ratelimits', 'testdata')
 * @returns {Promise<container: Container>} Container instance
 */
async function getContainer(client, key) {
    const containerId = containers[key];

    if (!containerId) {
        throw new Error(`Unknown container key: ${key}. Available: ${containerKeys().join(', ')}`);
    }
    
    const database = client.database(databaseId);
    const container = database.container(containerId);
    
    try {
        await container.read();

        console.log(`✅ Container "${containerId}" found and ready`);
    } catch (error) {
        if (error.code === 404) {
            console.error(`❌ Container "${containerId}" not found. Please run "npm run containers:setup" first.`);
        }

        throw error;
    }
    
    return container;
}

/**
 * Gets container key from command line arguments with validation
 * @returns {string} Validated container key
 */
function getContainerKeyFromArgs() {
    const key = process.argv[2];

    if (!containerKeys().includes(key)) {
        console.error(`❌ Invalid container key: ${key}`);
        console.error(`   Valid options: ${containerKeys().join(', ')}`);
        process.exit(1);
    }

    return containerType;
}

/**
 * Handles common database operation errors with helpful messages
 * @param {Error} error - The error to handle
 */
function handleDatabaseError(error) {
    console.error(`❌ Error during database operation:`, error.message);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('certificate')) {
        console.error('💡 Make sure the Azure Cosmos DB Emulator is running on https://localhost:8081/_explorer/index.html');
        console.error('💡 You can download it from: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator');
    }

    process.exit(1);
}

/**
 * Gets all container keys
 * @returns {string[]} Array of configured container keys
 */
function containerKeys() { 
    return Object.keys(containers); 
}

module.exports = {
    endpoint,
    key,
    databaseId,
    containers,
    createClient,
    getContainer,
    getContainerKeyFromArgs,
    handleDatabaseError
};
