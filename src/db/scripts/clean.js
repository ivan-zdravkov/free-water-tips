const {
    createClient,
    getContainer,
    handleDatabaseError,
    getContainerKeyFromArgs
} = require('../utils/cosmos');

async function cleanDatabase(containerKey) {
    console.log(`🧹 Cleaning ${containerKey} container...`);
    
    try {
        const client = createClient();
        const container = await getContainer(client, containerKey);

        console.log(`📋 Querying all documents in ${container.id} container...`);

        const { resources: items } = await container.items
            .query({ query: 'SELECT * FROM c' })
            .fetchAll();

        console.log(`Found ${items.length} items to delete`);

        if (items.length === 0) {
            console.log(`✅ ${container.id} container is already clean!`);
            return;
        }

        let deleted = 0;
        let errors = 0;
        
        for (const item of items) {
            try {
                const partitionKeyValue = item.partitionKey || item.id;
                await container.item(item.id, partitionKeyValue).delete();
                deleted++;
                console.log(`🗑️  Deleted: ${item.name || item.id} (${deleted}/${items.length})`);
            } catch (deleteError) {
                errors++;
                console.error(`❌ Failed to delete ${item.name || item.id}: ${deleteError.message}`);
            }
        }

        console.log(`\n🎯 Cleaning completed!`);
        console.log(`   ✅ Successfully deleted: ${deleted}/${items.length} items`);
        if (errors > 0) {
            console.log(`   ❌ Errors encountered: ${errors}/${items.length} items`);
        }
    } catch (error) {
        handleDatabaseError(error);
    }
}

if (require.main === module) {
    const containerKey = getContainerKeyFromArgs();

    cleanDatabase(containerKey);
}

module.exports = { cleanDatabase };
