const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateLocation, sanitizeLocation } = require('../shared/validation');

const db = new DatabaseService();

app.http('locations', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'locations',
    handler: async (request, context) => {
        try {
            if (request.method === 'GET') {
                // Get all locations
                const locations = await db.getAllLocations();
                return responses.success('Locations retrieved successfully', locations);
            }
            
            if (request.method === 'POST') {
                // Create new location
                const locationData = await request.json();
                const sanitizedLocation = sanitizeLocation(locationData);
                
                // Validate the location data
                const validation = validateLocation(sanitizedLocation);
                if (!validation.isValid) {
                    return responses.badRequest('Invalid location data', validation.errors);
                }
                
                // Create the location
                const newLocation = await db.createLocation(sanitizedLocation);
                return responses.created('Location created successfully', newLocation);
            }
            
            return responses.methodNotAllowed();
        } catch (error) {
            return responses.handleError(error, 'Locations endpoint');
        }
    }
});
