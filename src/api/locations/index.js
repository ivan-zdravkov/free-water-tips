const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateLocation, sanitizeLocation } = require('../shared/validation');
const { applySecurityMiddleware } = require('../shared/security');

const db = new DatabaseService();

app.http('locations', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'locations',
    handler: async (request, context) => {
        try {
            const flagged = await applySecurityMiddleware(context, request, {
                enableRateLimit: true,
                enableSecurity: true,
                maxRequests: 100,
                windowMs: 15 * 60 * 1000 // 15-minute window
            });
            
            if (flagged) {
                return flagged;
            }

            if (request.method === 'GET') {
                const locations = await db.getAllLocations();

                return responses.success(request, 'Locations retrieved successfully', locations);
            }
            
            if (request.method === 'POST') {
                const locationData = await request.json();
                const sanitizedLocation = sanitizeLocation(locationData);
                const validation = validateLocation(sanitizedLocation);

                if (!validation.isValid) {
                    return responses.badRequest(request, 'Invalid location data', validation.errors);
                }
                
                const newLocation = await db.createLocation(sanitizedLocation);

                return responses.created(request, 'Location created successfully', newLocation);
            }
            
            return responses.methodNotAllowed(request);
        } catch (error) {
            return responses.handleError(request, error, 'Locations endpoint');
        }
    }
});
