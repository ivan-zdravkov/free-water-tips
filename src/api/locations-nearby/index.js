const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateNearbyQuery } = require('../shared/validation');
const { applySecurityMiddleware } = require('../shared/security');

const db = new DatabaseService();

app.http('locations-nearby', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'locations-nearby',
    handler: async (request, context) => {
        try {
            const flagged = await applySecurityMiddleware(context, request, {
                enableRateLimit: true,
                enableSecurity: true,
                maxRequests: 75,         // Moderate limit for location queries
                windowMs: 10 * 60 * 1000 // 10-minute window
            });
            
            if (flagged) {
                return flagged;
            }

            const url = new URL(request.url);
            const lat = parseFloat(url.searchParams.get('lat'));
            const lon = parseFloat(url.searchParams.get('lon'));
            const radius = url.searchParams.get('radius') ? parseFloat(url.searchParams.get('radius')) : 10; // Default 10km
            
            const validation = validateNearbyQuery(lat, lon, radius);

            if (!validation.isValid) {
                return responses.badRequest(request, 'Invalid nearby query parameters', validation.errors);
            }
            
            const nearbyLocations = await db.findNearbyLocations(lat, lon, radius);
            
            return responses.success(request, 'Nearby locations found', {
                center: { latitude: lat, longitude: lon },
                radius: radius,
                unit: 'km',
                count: nearbyLocations.length,
                locations: nearbyLocations
            });
            
        } catch (error) {
            return responses.handleError(request, error, 'Nearby locations endpoint');
        }
    }
});
