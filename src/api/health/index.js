const { app } = require('@azure/functions');
const responses = require('../shared/responses');

const startTime = new Date();

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        try {
            const healthData = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
                version: '1.0.0',
                environment: process.env.ENVIRONMENT || 'unknown'
            };

            return responses.success('API is healthy', healthData);
        } catch (error) {
            return responses.handleError(error, 'Health check');
        }
    }
});
