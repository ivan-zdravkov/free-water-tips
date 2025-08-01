const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateNearbyQuery } = require('../shared/validation');

const db = new DatabaseService();

app.http('locations-nearby', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'locations-nearby',
    handler: async (request, context) => {
        try {
            const url = new URL(request.url);
            const lat = parseFloat(url.searchParams.get('lat'));
            const lon = parseFloat(url.searchParams.get('lon'));
            const radius = url.searchParams.get('radius') ? parseFloat(url.searchParams.get('radius')) : 10; // Default 10km
            
            // Validate the nearby query parameters
            const validation = validateNearbyQuery(lat, lon, radius);
            if (!validation.isValid) {
                return responses.badRequest('Invalid nearby query parameters', validation.errors);
            }
            
            // Find nearby locations
            const nearbyLocations = await db.findNearbyLocations(lat, lon, radius);
            
            return responses.success('Nearby locations found', {
                center: { latitude: lat, longitude: lon },
                radius: radius,
                unit: 'km',
                count: nearbyLocations.length,
                locations: nearbyLocations
            });
        } catch (error) {
            return responses.handleError(error, 'Nearby locations endpoint');
        }
    }
});
