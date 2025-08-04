const { CosmosClient } = require('@azure/cosmos');
const { sofiaLocations } = require('../data/seed-data');
require('dotenv').config();

// Disable SSL verification for Azure Cosmos DB Emulator (development only)
// The emulator uses a self-signed certificate that Node.js rejects by default
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const endpoint = process.env.COSMOS_ENDPOINT || 'https://127.0.0.1:8081';
const key = process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';
const databaseId = process.env.COSMOS_DATABASE_NAME || 'FreeWaterTipsDB';

const CONTAINER_CONFIGS = {
    'locations': {
        name: process.env.COSMOS_LOCATIONS_CONTAINER_NAME || 'Locations',
    },
    'ratelimits': {
        name: process.env.COSMOS_RATELIMIT_CONTAINER_NAME || 'RateLimits',
    },
    'testdata': {
        name: process.env.COSMOS_TEST_CONTAINER_NAME || 'TestData',
    }
};

async function getContainer(client, containerType = 'locations') {
    console.log(`🏗️  Using existing database and container for: ${containerType}`);
    
    const config = CONTAINER_CONFIGS[containerType];

    if (!config) {
        throw new Error(`Unknown container type: ${containerType}. Available: ${Object.keys(CONTAINER_CONFIGS).join(', ')}`);
    }
    
    const database = client.database(databaseId);
    const container = database.container(config.name);
    
    try {
        await container.read();
        console.log(`✅ Container "${config.name}" found and ready`);
    } catch (error) {
        if (error.code === 404) {
            console.error(`❌ Container "${config.name}" not found. Please run "npm run containers:setup" first.`);

            throw new Error(`Container not found. Run container setup first.`);
        }

        throw error;
    }
    
    return container;
}

async function seedDatabase(containerType = 'locations') {
    console.log(`🌱 Seeding database with ${containerType} data...`);
    
    try {
        const client = new CosmosClient({ 
            endpoint, 
            key,
            connectionPolicy: {
                requestTimeout: 30000
            }
        });
        
        const container = await getContainer(client, containerType);
        
        let dataToSeed = [];
        let dataTypeName = '';
        
        switch (containerType) {
            case 'locations':
                dataToSeed = sofiaLocations;
                dataTypeName = 'locations';
                break;
            case 'ratelimits':
                dataToSeed = [];
                dataTypeName = 'rate limit entries';
                break;
            case 'testdata':
                dataToSeed = sofiaLocations;
                dataTypeName = 'test data entries';
                break;
            default:
                throw new Error(`No seed data available for container type: ${containerType}`);
        }
        
        let seeded = 0;
        let skipped = 0;
        
        for (const item of dataToSeed) {
            let itemData = {
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'development-seed'
            };
            
            if (containerType === 'locations' || containerType === 'testdata') {
                itemData = {
                    ...itemData,
                    partitionKey: `${item.city.toLowerCase()}-${item.country.toLowerCase()}-${item.type}`,
                    coordinates: {
                        type: "Point",
                        coordinates: [item.longitude, item.latitude],
                        latitude: item.latitude,
                        longitude: item.longitude
                    },
                    location: {
                        type: "Point",
                        coordinates: [item.longitude, item.latitude]
                    }
                };
            } else if (containerType === 'ratelimits') {
                itemData.partitionKey = item.clientId;
                itemData.ttl = item.ttl || 3600; // Default 1 hour TTL
            }

            try {
                await container.items.create(itemData);
                seeded++;
                console.log(`✅ Added: ${item.name || item.id}`);
            } catch (error) {
                if (error.code === 409) {
                    skipped++;
                    console.log(`⚠️  Already exists: ${item.name || item.id}`);
                } else {
                    throw error;
                }
            }
        }

        console.log(`🎉 Database seeding completed!`);
        console.log(`   📊 Added: ${seeded} ${dataTypeName}`);
        console.log(`   ⏭️  Skipped: ${skipped} existing ${dataTypeName}`);
        console.log(`   📍 Total ${dataTypeName}: ${dataToSeed.length}`);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        if (error.message.includes('ECONNREFUSED') || error.message.includes('certificate')) {
            console.error('💡 Make sure the Azure Cosmos DB Emulator is running on https://127.0.0.1:8081');
            console.error('💡 You can download it from: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator');
        }
        process.exit(1);
    }
}

if (require.main === module) {
    const containerType = process.argv[2] || 'locations';
    
    const validTypes = ['locations', 'ratelimits', 'testdata'];
    if (!validTypes.includes(containerType)) {
        console.error(`❌ Invalid container type: ${containerType}`);
        console.error(`   Valid options: ${validTypes.join(', ')}`);
        console.error(`   Usage: node seed.js [container-type]`);
        console.error(`   Example: node seed.js locations`);
        process.exit(1);
    }
    
    seedDatabase(containerType);
}

module.exports = { 
    seedDatabase,
    sofiaLocations
};
