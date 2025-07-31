const { CosmosClient } = require('@azure/cosmos');
require('dotenv').config();

const endpoint = process.env.COSMOS_ENDPOINT || 'https://localhost:8081';
const key = process.env.COSMOS_KEY || 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';
const databaseId = process.env.COSMOS_DATABASE_NAME || 'FreeWaterTipsDB';
const containerId = process.env.COSMOS_CONTAINER_NAME || 'Locations';

// Sofia public drinking fountains and water dispensers
const sofiaLocations = [
    {
        id: "sofia-vitosha-fountain-001",
        name: "Vitosha Boulevard Fountain",
        description: "Historic public fountain on Sofia's main pedestrian street, near the intersection with Patriarch Evtimiy Boulevard",
        address: "Vitosha Boulevard 15",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6977,
        longitude: 23.3219,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.2,
        status: "active"
    },
    {
        id: "sofia-alexander-nevsky-fountain-002",
        name: "Alexander Nevsky Cathedral Fountain", 
        description: "Beautiful ornate fountain located in the square in front of the Alexander Nevsky Cathedral",
        address: "Alexander Nevsky Square",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6956,
        longitude: 23.3332,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.5,
        status: "active"
    },
    {
        id: "sofia-city-garden-fountain-003",
        name: "City Garden Central Fountain",
        description: "Historic fountain in the center of Sofia's City Garden park, established in 1884",
        address: "City Garden, Tsar Osvoboditel Boulevard",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6947,
        longitude: 23.3253,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.1,
        status: "active"
    },
    {
        id: "sofia-borisova-gradina-fountain-004",
        name: "Borisova Gradina Park Fountain",
        description: "Large decorative fountain in Sofia's largest and oldest park, perfect for refilling water bottles",
        address: "Borisova Gradina Park, near the main entrance",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6794,
        longitude: 23.3370,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.3,
        status: "active"
    },
    {
        id: "sofia-national-theatre-fountain-005",
        name: "National Theatre Fountain",
        description: "Elegant fountain in front of the Ivan Vazov National Theatre, a beautiful architectural landmark",
        address: "Dyakon Ignatiy Street 1",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6951,
        longitude: 23.3258,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.0,
        status: "active"
    },
    {
        id: "sofia-ndk-fountain-006",
        name: "National Palace of Culture Fountain",
        description: "Modern fountain complex at the National Palace of Culture (NDK), one of Sofia's largest cultural venues",
        address: "Bulgaria Boulevard 1",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6831,
        longitude: 23.3193,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.6,
        status: "active"
    },
    {
        id: "sofia-south-park-fountain-007",
        name: "South Park Fountain",
        description: "Peaceful fountain in South Park (Yuzhen Park), popular with joggers and families",
        address: "South Park, Cherni Vrah Boulevard",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6656,
        longitude: 23.3131,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 3.9,
        status: "active"
    },
    {
        id: "sofia-doctors-garden-fountain-008",
        name: "Doctors' Garden Fountain",
        description: "Small, charming fountain in the quiet Doctors' Garden park, near the medical university",
        address: "Doctors' Garden, Oborishte Street",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6925,
        longitude: 23.3343,
        type: "public-fountain",
        verified: true,
        accessible: true,
        alwaysAvailable: true,
        rating: 4.2,
        status: "active"
    },
    {
        id: "sofia-paradise-dispenser-009",
        name: "Paradise Center Water Dispenser",
        description: "Modern public water dispenser located inside Paradise Center shopping mall",
        address: "Paradise Center, Cherni Vrah Boulevard 100",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6510,
        longitude: 23.3394,
        type: "public-dispenser",
        verified: true,
        accessible: true,
        alwaysAvailable: false, // Mall hours only
        rating: 4.1,
        status: "active"
    },
    {
        id: "sofia-crystal-garden-dispenser-010",
        name: "Crystal Garden Water Dispenser",
        description: "High-tech water dispenser in the Crystal Garden business complex, available during business hours",
        address: "Crystal Garden, Sitnyakovo Boulevard",
        city: "Sofia",
        country: "Bulgaria",
        latitude: 42.6565,
        longitude: 23.3515,
        type: "public-dispenser",
        verified: true,
        accessible: true,
        alwaysAvailable: false, // Business hours only
        rating: 4.4,
        status: "active"
    }
];

async function createDatabaseAndContainer(client) {
    console.log('🏗️  Creating database and container if they don\'t exist...');
    
    const { database } = await client.databases.createIfNotExists({
        id: databaseId
    });
    
    const { container } = await database.containers.createIfNotExists({
        id: containerId,
        partitionKey: { 
            paths: ['/city'],
            kind: 'Hash'
        },
        indexingPolicy: {
            includedPaths: [
                {
                    path: "/*"
                }
            ],
            excludedPaths: [
                {
                    path: "/\"_etag\"/?"
                }
            ],
            spatialIndexes: [
                {
                    path: "/location/?",
                    types: ["Point", "Polygon"]
                }
            ]
        }
    });
    
    console.log('✅ Database and container ready');
    return container;
}

async function seedDatabase() {
    console.log('🌱 Seeding database with Sofia locations...');
    
    try {
        const client = new CosmosClient({ 
            endpoint, 
            key,
            connectionPolicy: {
                requestTimeout: 30000
            }
        });
        
        const container = await createDatabaseAndContainer(client);
        
        let seeded = 0;
        let skipped = 0;
        
        for (const location of sofiaLocations) {
            // Add timestamps and additional fields
            const locationData = {
                ...location,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Add GeoJSON point for spatial queries
                location: {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude]
                }
            };

            try {
                await container.items.create(locationData);
                seeded++;
                console.log(`✅ Added: ${location.name}`);
            } catch (error) {
                if (error.code === 409) {
                    skipped++;
                    console.log(`⚠️  Already exists: ${location.name}`);
                } else {
                    throw error;
                }
            }
        }

        console.log(`🎉 Database seeding completed!`);
        console.log(`   📊 Added: ${seeded} locations`);
        console.log(`   ⏭️  Skipped: ${skipped} existing locations`);
        console.log(`   📍 Total Sofia locations: ${sofiaLocations.length}`);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        if (error.message.includes('ECONNREFUSED') || error.message.includes('certificate')) {
            console.error('💡 Make sure the Azure Cosmos DB Emulator is running on https://localhost:8081');
            console.error('💡 You can download it from: https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator');
        }
        process.exit(1);
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sofiaLocations };
