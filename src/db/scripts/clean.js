const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const endpoint = process.env.COSMOS_ENDPOINT || 'https://localhost:8081';
const key = process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';
const databaseId = process.env.COSMOS_DATABASE_NAME || 'FreeWaterTipsDB';
const containerId = process.env.COSMOS_CONTAINER_NAME || 'Locations';

async function cleanDatabase() {
    console.log('🧹 Cleaning database...');
    
    try {
        const client = new CosmosClient({ 
            endpoint, 
            key,
            connectionPolicy: {
                requestTimeout: 30000
            }
        });
        
        const database = client.database(databaseId);
        const container = database.container(containerId);

        console.log('📋 Querying all documents...');
        const querySpec = {
            query: 'SELECT * FROM c'
        };

        const { resources: items } = await container.items.query(querySpec).fetchAll();
        console.log(`Found ${items.length} items to delete`);

        if (items.length === 0) {
            console.log('✅ Database is already clean!');
            return;
        }

        // Delete all items
        let deleted = 0;
        for (const item of items) {
            await container.item(item.id, item.city).delete();
            deleted++;
            console.log(`🗑️  Deleted: ${item.name} (${deleted}/${items.length})`);
        }

        console.log(`✅ Database cleaned successfully! Deleted ${deleted} items.`);
    } catch (error) {
        console.error('❌ Error cleaning database:', error.message);
        if (error.message.includes('ECONNREFUSED') || error.message.includes('certificate')) {
            console.error('💡 Make sure the Azure Cosmos DB Emulator is running on https://localhost:8081');
        }
        process.exit(1);
    }
}

if (require.main === module) {
    cleanDatabase();
}

module.exports = { cleanDatabase };
