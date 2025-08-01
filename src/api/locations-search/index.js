const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateSearchQuery } = require('../shared/validation');

const db = new DatabaseService();

app.http('locations-search', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'locations-search',
    handler: async (request, context) => {
        try {
            const url = new URL(request.url);
            const query = url.searchParams.get('q');
            
            if (!query) {
                return responses.badRequest('Search query parameter "q" is required');
            }
            
            // Validate the search query
            const validation = validateSearchQuery(query);
            if (!validation.isValid) {
                return responses.badRequest('Invalid search query', validation.errors);
            }
            
            // Search for locations
            const locations = await db.searchLocations(query.trim());
            return responses.success('Search completed successfully', {
                query: query.trim(),
                count: locations.length,
                locations
            });
        } catch (error) {
            return responses.handleError(error, 'Location search endpoint');
        }
    }
});
