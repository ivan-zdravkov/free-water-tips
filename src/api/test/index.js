const { app } = require('@azure/functions');

// Simple test function to verify Azure Functions is working
app.http('test', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'test',
    handler: async (request, context) => {
        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Test function working',
                timestamp: new Date().toISOString()
            })
        };
    }
});
