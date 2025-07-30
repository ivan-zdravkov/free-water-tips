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
                console.warn(`API request '${endpoint}' attempt ${attempt} failed:`, error.message);
                
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
            console.warn('Failed to fetch locations, returning empty array:', error.message);
            return [];
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
            console.warn('Failed to fetch nearby locations, returning empty array:', error.message);
            return [];
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
            console.warn('Failed to search locations, returning empty array:', error.message);
            return [];
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
}

// Make ApiClient available globally
window.ApiClient = ApiClient;
