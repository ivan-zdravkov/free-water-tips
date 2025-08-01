const { app } = require('@azure/functions');
const responses = require('../shared/responses');
const { applySecurityMiddleware } = require('../shared/security');

const startTime = new Date();

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        try {
            const flagged = await applySecurityMiddleware(context, request, {
                enableRateLimit: true,
                enableSecurity: false, // Don't block health checks
                maxRequests: 200,      // Higher limit for monitoring
                windowMs: 5 * 60 * 1000 // 5-minute window
            });
            
            if (flagged) {
                return flagged;
            }

            const healthData = {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - startTime.getTime()) / 1000),
                version: '1.0.0',
                environment: process.env.ENVIRONMENT || 'unknown'
            };

            return responses.success(request, 'API is healthy', healthData);
        } catch (error) {
            return responses.handleError(request, error, 'Health check');
        }
    }
});
