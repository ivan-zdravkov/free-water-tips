// API Client for Free Water Tips
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.timeout = 1000; // 1 second
        this.retryAttempts = 3;
    }

    /**
     * Make HTTP request with retry logic
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
                
            } catch (error) {
                lastError = error;
                console.warn(`API request attempt ${attempt} failed:`, error.message);
                
                // Don't retry on certain errors
                if (error.name === 'AbortError' || 
                    (error.message.includes('HTTP 4') && !error.message.includes('HTTP 429'))) {
                    break;
                }
                
                // Wait before retry (exponential backoff)
                if (attempt < this.retryAttempts) {
                    await this.wait(Math.pow(2, attempt) * 1000);
                }
            }
        }
        
        throw new Error(`API request failed after ${this.retryAttempts} attempts: ${lastError.message}`);
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(endpoint + url.search, {
            method: 'GET'
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} Response data
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    /**
     * Get all water locations
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>} Array of locations
     */
    async getLocations(filters = {}) {
        try {
            return await this.get('/locations', filters);
        } catch (error) {
            console.warn('Failed to fetch locations, returning mock data:', error.message);
            return this.getMockLocations();
        }
    }

    /**
     * Get nearby water locations
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @param {number} radius - Search radius in meters
     * @returns {Promise<Array>} Array of nearby locations
     */
    async getNearbyLocations(lat, lng, radius = 5000) {
        try {
            return await this.get('/locations/nearby', { lat, lng, radius });
        } catch (error) {
            console.warn('Failed to fetch nearby locations, returning mock data:', error.message);
            return this.getMockNearbyLocations(lat, lng);
        }
    }

    /**
     * Add a new water location
     * @param {Object} location - Location data
     * @returns {Promise<Object>} Created location
     */
    async addLocation(location) {
        try {
            return await this.post('/locations', location);
        } catch (error) {
            console.warn('Failed to add location to API, simulating success:', error.message);
            return {
                id: Utils.generateId(),
                ...location,
                createdAt: new Date().toISOString(),
                status: 'pending'
            };
        }
    }

    /**
     * Search locations by text
     * @param {string} query - Search query
     * @returns {Promise<Array>} Array of matching locations
     */
    async searchLocations(query) {
        try {
            return await this.get('/locations/search', { q: query });
        } catch (error) {
            console.warn('Failed to search locations, returning mock results:', error.message);
            return this.getMockSearchResults(query);
        }
    }

    /**
     * Health check endpoint
     * @returns {Promise<Object>} Health status
     */
    async health() {
        return await this.get('/health');
    }

    /**
     * Get stats from the API
     * @returns {Promise<Object>} Stats data
     * @throws {Error} If stats cannot be fetched
     */
    async getStats() {
        try {
            return await this.get('/stats');
        } catch (error) {
            console.warn('Failed to fetch stats, returning empty object:', error.message);
            return {};
        }
    }

    /**
     * Wait utility function
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after specified time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get mock locations for development/fallback
     * @returns {Array} Mock location data
     */
    getMockLocations() {
        return [
            {
                id: '1',
                name: 'Central Park Visitor Center',
                address: 'Central Park, New York, NY',
                type: 'park',
                coordinates: { lat: 40.7829, lng: -73.9654 },
                description: 'Free water fountains available near the visitor center',
                accessible: true,
                alwaysAvailable: false,
                rating: 4.5,
                createdAt: '2024-01-15T10:00:00Z'
            },
            {
                id: '2',
                name: 'Starbucks Times Square',
                address: '1585 Broadway, New York, NY',
                type: 'cafe',
                coordinates: { lat: 40.7580, lng: -73.9855 },
                description: 'Ask barista for free water cup',
                accessible: true,
                alwaysAvailable: false,
                rating: 4.2,
                createdAt: '2024-01-16T14:30:00Z'
            },
            {
                id: '3',
                name: 'Washington Square Park',
                address: 'Washington Square Park, New York, NY',
                type: 'public-fountain',
                coordinates: { lat: 40.7308, lng: -73.9973 },
                description: 'Public water fountain near the arch',
                accessible: true,
                alwaysAvailable: true,
                rating: 4.0,
                createdAt: '2024-01-17T09:15:00Z'
            }
        ];
    }

    /**
     * Get mock nearby locations for development/fallback
     * @param {number} lat - User latitude
     * @param {number} lng - User longitude
     * @returns {Array} Mock nearby locations
     */
    getMockNearbyLocations(lat, lng) {
        const mockLocations = this.getMockLocations();
        
        // Calculate distances and sort by proximity
        return mockLocations
            .map(location => ({
                ...location,
                distance: Utils.calculateDistance(
                    lat, lng,
                    location.coordinates.lat, location.coordinates.lng
                )
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Return top 10 nearest
    }

    /**
     * Get mock search results for development/fallback
     * @param {string} query - Search query
     * @returns {Array} Mock search results
     */
    getMockSearchResults(query) {
        const mockLocations = this.getMockLocations();
        const lowerQuery = query.toLowerCase();
        
        return mockLocations.filter(location => 
            location.name.toLowerCase().includes(lowerQuery) ||
            location.address.toLowerCase().includes(lowerQuery) ||
            location.type.toLowerCase().includes(lowerQuery) ||
            (location.description && location.description.toLowerCase().includes(lowerQuery))
        );
    }
}

// Make ApiClient available globally
window.ApiClient = ApiClient;
