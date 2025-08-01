const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { applySecurityMiddleware } = require('../shared/security');

const db = new DatabaseService();

app.http('stats', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'stats',
    handler: async (request, context) => {
        try {
            const flagged = await applySecurityMiddleware(context, request, {
                enableRateLimit: true,
                enableSecurity: true,
                maxRequests: 100,        // Higher limit for stats endpoint
                windowMs: 15 * 60 * 1000 // 15-minute window
            });
            
            if (flagged) {
                return flagged;
            }

            const stats = await db.getStatistics();
            
            return responses.success(request, 'Statistics retrieved successfully', {
                ...stats,
                lastUpdated: new Date().toISOString()
            });
            
        } catch (error) {
            return responses.handleError(request, error, 'Statistics endpoint');
        }
    }
});
