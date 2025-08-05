const { sofiaLocations } = require('../data/seed-data');
const {
    createClient,
    getContainer,
    handleDatabaseError,
    getContainerKeyFromArgs
} = require('../utils/cosmos');

async function seedDatabase(containerKey) {
    console.log(`🌱 Seeding database with ${containerKey} data...`);
    
    try {
        const client = createClient();
        const container = await getContainer(client, containerKey);
        
        const { dataToSeed, label } = getData(containerKey);
        
        let seeded = 0;
        let skipped = 0;
        
        for (const item of dataToSeed) {
            let itemData = {
                ...item,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'development-seed'
            };
            
            if (containerKey === 'locations' || containerKey === 'testdata') {
                itemData = {
                    ...itemData,
                    partitionKey: `${item.country.toLowerCase()}-${item.city.toLowerCase()}-${item.type}`,
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
            } else if (containerKey === 'ratelimits') {
                itemData.partitionKey = item.clientId;
                itemData.ttl = item.ttl || 3600; // 1 hour
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
        console.log(`   📊 Added: ${seeded} ${label}`);
        console.log(`   ⏭️ Skipped: ${skipped} existing ${label}`);
        console.log(`   📍 Total ${label}: ${dataToSeed.length}`);
    } catch (error) {
        handleDatabaseError(error);
    }
}

function getData(containerKey) {
    let dataToSeed = [];
    let label = '';
    
    switch (containerKey) {
        case 'locations':
            dataToSeed = sofiaLocations;
            label = 'locations';
        case 'testdata':
            dataToSeed = sofiaLocations;
            label = 'test data'
            break;
        case 'ratelimits':
            dataToSeed = [];
            label = 'rate limits'
            break;
        default:
            throw new Error(`No seed data available for container: ${containerKey}`);
    }

    return { dataToSeed, label };
}

if (require.main === module) {
    const containerKey = getContainerKeyFromArgs();

    seedDatabase(containerKey);
}

module.exports = { 
    seedDatabase,
    sofiaLocations
};
