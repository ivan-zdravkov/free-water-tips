const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');

const db = new DatabaseService();

app.http('stats', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'stats',
    handler: async (request, context) => {
        try {
            // Get statistics from the database
            const stats = await db.getStatistics();
            
            return responses.success('Statistics retrieved successfully', {
                ...stats,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            return responses.handleError(error, 'Statistics endpoint');
        }
    }
});
