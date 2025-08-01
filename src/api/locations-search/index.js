const { app } = require('@azure/functions');
const DatabaseService = require('../shared/database');
const responses = require('../shared/responses');
const { validateSearchQuery } = require('../shared/validation');
const { applySecurityMiddleware } = require('../shared/security');

const db = new DatabaseService();

app.http('locations-search', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'locations-search',
    handler: async (request, context) => {
        try {
            const flagged = await applySecurityMiddleware(context, request, {
                enableRateLimit: true,
                enableSecurity: true,
                maxRequests: 50,         // Lower limit for search to prevent abuse
                windowMs: 10 * 60 * 1000 // 10-minute window
            });
            
            if (flagged) {
                return flagged;
            }

            const url = new URL(request.url);
            const query = url.searchParams.get('q');
            
            if (!query) {
                return responses.badRequest(request, 'Search query parameter "q" is required');
            }
            
            const validation = validateSearchQuery(query);

            if (!validation.isValid) {
                return responses.badRequest(request, 'Invalid search query', validation.errors);
            }
            
            const locations = await db.searchLocations(query.trim());

            return responses.success(request, 'Search completed successfully', {
                query: query.trim(),
                count: locations.length,
                locations
            });
            
        } catch (error) {
            return responses.handleError(request, error, 'Location search endpoint');
        }
    }
});
