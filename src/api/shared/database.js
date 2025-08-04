const { CosmosClient } = require('@azure/cosmos');

class DatabaseService {
  constructor(containerType = 'locations') {
    this.client = null;
    this.database = null;
    this.container = null;
    this.containerType = containerType;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const endpoint = process.env.COSMOS_ENDPOINT;
      const key = process.env.COSMOS_KEY;
      const databaseName = process.env.COSMOS_DATABASE_NAME;
      
      // Select container based on type
      let containerName;
      switch (this.containerType) {
        case 'ratelimits':
          containerName = process.env.COSMOS_RATELIMIT_CONTAINER_NAME || 'RateLimits';
          break;
        case 'test':
          containerName = process.env.COSMOS_TEST_CONTAINER_NAME || 'TestData';
          break;
        case 'locations':
        default:
          containerName = process.env.COSMOS_LOCATIONS_CONTAINER_NAME || 'Locations';
          break;
      }

      if (!endpoint || !key || !databaseName || !containerName) {
        throw new Error(`Missing required Cosmos DB configuration for container type: ${this.containerType}`);
      }

      // Handle local emulator SSL issues
      const clientOptions = {
        endpoint,
        key
      };

      // For local development with emulator
      if (endpoint.includes('127.0.0.1') || endpoint.includes('localhost')) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      }

      this.client = new CosmosClient(clientOptions);
      this.database = this.client.database(databaseName);
      this.container = this.database.container(containerName);

      this.isInitialized = true;
      console.log(`✅ Database connection initialized for container: ${containerName}`);
    } catch (error) {
      console.error(`❌ Failed to initialize database for ${this.containerType}:`, error);
      throw error;
    }
  }

  async getLocations(filters = {}) {
    await this.initialize();

    try {
      let query = 'SELECT * FROM c WHERE c.status = "active"';
      const parameters = [];

      // Apply filters
      if (filters.type) {
        query += ' AND c.type = @type';
        parameters.push({ name: '@type', value: filters.type });
      }

      if (filters.verified !== undefined) {
        query += ' AND c.verified = @verified';
        parameters.push({ name: '@verified', value: filters.verified });
      }

      if (filters.accessible !== undefined) {
        query += ' AND c.accessible = @accessible';
        parameters.push({ name: '@accessible', value: filters.accessible });
      }

      if (filters.alwaysAvailable !== undefined) {
        query += ' AND c.alwaysAvailable = @alwaysAvailable';
        parameters.push({ name: '@alwaysAvailable', value: filters.alwaysAvailable });
      }

      // Add ordering and limit
      query += ' ORDER BY c.createdAt DESC';
      
      if (filters.limit && filters.limit > 0) {
        query += ` OFFSET 0 LIMIT ${Math.min(parseInt(filters.limit), 1000)}`;
      }

      const querySpec = {
        query,
        parameters
      };

      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  async createLocation(locationData) {
    await this.initialize();

    try {
      const now = new Date().toISOString();
      
      // Generate composite partition key for better distribution
      const city = locationData.city || 'unknown';
      const country = locationData.country || 'unknown';
      const type = locationData.type || 'fountain';
      const partitionKey = `${city.toLowerCase()}-${country.toLowerCase()}-${type}`;
      
      const location = {
        ...locationData,
        id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        partitionKey: partitionKey, // Composite partition key
        createdAt: now,
        updatedAt: now,
        status: 'active',
        verified: false,
        reports: 0,
        rating: 0.0,
        // Ensure coordinates are properly formatted for geo-spatial indexing
        coordinates: {
          type: 'Point',
          coordinates: [
            locationData.coordinates?.longitude || 0,
            locationData.coordinates?.latitude || 0
          ],
          // Keep original format for backward compatibility
          latitude: locationData.coordinates?.latitude || 0,
          longitude: locationData.coordinates?.longitude || 0
        }
      };

      const { resource } = await this.container.items.create(location);
      return resource;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async searchLocations(query, filters = {}) {
    await this.initialize();

    try {
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
      
      let sqlQuery = `SELECT * FROM c WHERE c.status = "active"`;
      const parameters = [];

      // Add search conditions
      if (searchTerms.length > 0) {
        const searchConditions = searchTerms.map((term, index) => {
          const paramName = `@searchTerm${index}`;
          parameters.push({ name: paramName, value: `%${term}%` });
          return `(CONTAINS(LOWER(c.name), LOWER(${paramName})) OR CONTAINS(LOWER(c.address), LOWER(${paramName})) OR CONTAINS(LOWER(c.description), LOWER(${paramName})))`;
        });
        sqlQuery += ` AND (${searchConditions.join(' OR ')})`;
      }

      // Apply additional filters
      if (filters.type) {
        sqlQuery += ' AND c.type = @type';
        parameters.push({ name: '@type', value: filters.type });
      }

      if (filters.verified !== undefined) {
        sqlQuery += ' AND c.verified = @verified';
        parameters.push({ name: '@verified', value: filters.verified });
      }

      sqlQuery += ' ORDER BY c.createdAt DESC';

      if (filters.limit && filters.limit > 0) {
        sqlQuery += ` OFFSET 0 LIMIT ${Math.min(parseInt(filters.limit), 100)}`;
      }

      const querySpec = {
        query: sqlQuery,
        parameters
      };

      const { resources } = await this.container.items.query(querySpec).fetchAll();
      return resources;
    } catch (error) {
      console.error('Error searching locations:', error);
      throw error;
    }
  }

  async getNearbyLocations(latitude, longitude, radiusMeters = 5000, filters = {}) {
    await this.initialize();

    try {
      // Use geo-spatial query with ST_DISTANCE for better performance
      let query = `
        SELECT *, 
               ST_DISTANCE(c.coordinates, {
                 "type": "Point", 
                 "coordinates": [@longitude, @latitude]
               }) as distance
        FROM c 
        WHERE c.status = "active" 
        AND ST_DISTANCE(c.coordinates, {
          "type": "Point", 
          "coordinates": [@longitude, @latitude]
        }) <= @radiusMeters
      `;
      
      const parameters = [
        { name: '@latitude', value: latitude },
        { name: '@longitude', value: longitude },
        { name: '@radiusMeters', value: radiusMeters }
      ];

      // Apply additional filters
      if (filters.type) {
        query += ' AND c.type = @type';
        parameters.push({ name: '@type', value: filters.type });
      }

      if (filters.verified !== undefined) {
        query += ' AND c.verified = @verified';
        parameters.push({ name: '@verified', value: filters.verified });
      }

      if (filters.accessible !== undefined) {
        query += ' AND c.accessible = @accessible';
        parameters.push({ name: '@accessible', value: filters.accessible });
      }

      if (filters.alwaysAvailable !== undefined) {
        query += ' AND c.alwaysAvailable = @alwaysAvailable';
        parameters.push({ name: '@alwaysAvailable', value: filters.alwaysAvailable });
      }

      // Order by distance and apply limit
      query += ' ORDER BY distance ASC';
      
      const limit = filters.limit ? Math.min(parseInt(filters.limit), 100) : 50;
      query += ` OFFSET 0 LIMIT ${limit}`;

      const querySpec = {
        query,
        parameters
      };

      const { resources } = await this.container.items.query(querySpec).fetchAll();
      
      // Convert distance from meters to rounded value and ensure proper format
      return resources.map(location => ({
        ...location,
        distance: Math.round(location.distance || 0)
      }));

    } catch (error) {
      console.error('Error fetching nearby locations with geo-spatial query:', error);
      console.log('Falling back to manual distance calculation...');
      
      // Fallback to original method if geo-spatial query fails
      return this.getNearbyLocationsFallback(latitude, longitude, radiusMeters, filters);
    }
  }

  /**
   * Fallback method for nearby locations using manual distance calculation
   * Used when geo-spatial queries are not available or fail
   */
  async getNearbyLocationsFallback(latitude, longitude, radiusMeters = 5000, filters = {}) {
    try {
      // Get all locations first
      const allLocations = await this.getLocations(filters);

      // Calculate distances and filter
      const nearbyLocations = allLocations
        .map(location => {
          const lat = location.coordinates?.latitude || 0;
          const lng = location.coordinates?.longitude || 0;
          const distance = this.calculateDistance(latitude, longitude, lat, lng);
          
          return {
            ...location,
            distance: Math.round(distance)
          };
        })
        .filter(location => location.distance <= radiusMeters)
        .sort((a, b) => a.distance - b.distance);

      // Apply limit
      const limit = filters.limit ? Math.min(parseInt(filters.limit), 100) : 50;
      return nearbyLocations.slice(0, limit);
    } catch (error) {
      console.error('Error in fallback nearby locations:', error);
      throw error;
    }
  }

  async getStats() {
    await this.initialize();

    try {
      const query = 'SELECT * FROM c WHERE c.status = "active"';
      const { resources: locations } = await this.container.items.query(query).fetchAll();

      const stats = {
        totalLocations: locations.length,
        verifiedLocations: locations.filter(l => l.verified).length,
        accessibleLocations: locations.filter(l => l.accessible).length,
        alwaysAvailableLocations: locations.filter(l => l.alwaysAvailable).length,
        citiesCount: new Set(locations.map(l => l.city)).size,
        locationTypes: {},
        lastUpdated: new Date().toISOString()
      };

      // Count location types
      locations.forEach(location => {
        const type = location.type || 'unknown';
        stats.locationTypes[type] = (stats.locationTypes[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Haversine formula to calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // =============================================================================
  // GENERIC CRUD OPERATIONS (Added for rate limiting and other generic use cases)
  // =============================================================================

  /**
   * Get a single item by ID
   * @param {string} id - The item ID
   * @param {string} partitionKey - Optional partition key (defaults based on container type)
   * @returns {Object} The item
   */
  async getItemById(id, partitionKey = null) {
    await this.initialize();
    
    try {
      // Use appropriate default partition key based on container type
      let effectivePartitionKey = partitionKey;
      if (!effectivePartitionKey) {
        switch (this.containerType) {
          case 'locations':
            // For locations, we need the full partition key, which we can't determine from just ID
            // This method should be used with explicit partition key for locations
            throw new Error('Location items require explicit partitionKey (city-country-type)');
          case 'ratelimits':
            // For rate limits, partition key is clientId, which should be provided
            effectivePartitionKey = id; // Fallback assumption
            break;
          case 'test':
            // For test data, partition key is testType
            effectivePartitionKey = id; // Fallback assumption
            break;
          default:
            effectivePartitionKey = id;
        }
      }

      const { resource } = await this.container
        .item(id, effectivePartitionKey)
        .read();
      return resource;
    } catch (error) {
      if (error.code === 404) {
        return null; // Item not found
      }
      throw error;
    }
  }

  /**
   * Create a new item
   * @param {Object} item - The item to create
   * @returns {Object} The created item
   */
  async createItem(item) {
    await this.initialize();
    
    try {
      // Ensure proper partition key is set based on container type
      let enhancedItem = { ...item };
      
      switch (this.containerType) {
        case 'locations':
          // For locations, ensure composite partition key exists
          if (!enhancedItem.partitionKey) {
            const city = enhancedItem.city || 'unknown';
            const country = enhancedItem.country || 'unknown';
            const type = enhancedItem.type || 'fountain';
            enhancedItem.partitionKey = `${city.toLowerCase()}-${country.toLowerCase()}-${type}`;
          }
          // Ensure coordinates are properly formatted for geo-spatial indexing
          if (enhancedItem.coordinates && !enhancedItem.coordinates.type) {
            enhancedItem.coordinates = {
              type: 'Point',
              coordinates: [
                enhancedItem.coordinates.longitude || 0,
                enhancedItem.coordinates.latitude || 0
              ],
              latitude: enhancedItem.coordinates.latitude || 0,
              longitude: enhancedItem.coordinates.longitude || 0
            };
          }
          break;
        case 'ratelimits':
          // For rate limits, ensure clientId is set as partition key
          if (!enhancedItem.clientId && enhancedItem.id) {
            enhancedItem.clientId = enhancedItem.id;
          }
          break;
        case 'test':
          // For test data, ensure testType is set
          if (!enhancedItem.testType) {
            enhancedItem.testType = enhancedItem.type || 'general';
          }
          break;
      }

      const { resource } = await this.container.items.create(enhancedItem);
      return resource;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  /**
   * Update an existing item
   * @param {Object} item - The item to update (must include id and appropriate partition key)
   * @returns {Object} The updated item
   */
  async updateItem(item) {
    await this.initialize();
    
    try {
      // Determine the correct partition key based on container type
      let partitionKey;
      switch (this.containerType) {
        case 'locations':
          partitionKey = item.partitionKey || 
                        (item.city && item.country && item.type ? 
                         `${item.city.toLowerCase()}-${item.country.toLowerCase()}-${item.type}` : 
                         item.id);
          break;
        case 'ratelimits':
          partitionKey = item.clientId || item.id;
          break;
        case 'test':
          partitionKey = item.testType || item.id;
          break;
        default:
          partitionKey = item.id;
      }

      const { resource } = await this.container
        .item(item.id, partitionKey)
        .replace(item);
      return resource;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  /**
   * Delete an item by ID
   * @param {string} id - The item ID
   * @param {string} partitionKey - Optional partition key (required for locations)
   * @returns {boolean} Success status
   */
  async deleteItem(id, partitionKey = null) {
    await this.initialize();
    
    try {
      // Use appropriate default partition key based on container type
      let effectivePartitionKey = partitionKey;
      if (!effectivePartitionKey) {
        switch (this.containerType) {
          case 'locations':
            throw new Error('Location items require explicit partitionKey for deletion');
          case 'ratelimits':
          case 'test':
          default:
            effectivePartitionKey = id;
        }
      }

      await this.container
        .item(id, effectivePartitionKey)
        .delete();
      return true;
    } catch (error) {
      if (error.code === 404) {
        return false; // Item not found
      }
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  /**
   * Query items with custom SQL
   * @param {string} query - SQL query string
   * @param {Array} parameters - Query parameters
   * @returns {Array} Query results
   */
  async queryItems(query, parameters = []) {
    await this.initialize();
    
    try {
      const { resources } = await this.container.items
        .query({
          query,
          parameters
        })
        .fetchAll();
      
      return resources;
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  }

  // =============================================================================
  // HELPER METHODS FOR OPTIMIZED CONTAINER OPERATIONS
  // =============================================================================

  /**
   * Generate partition key for location data
   * @param {string} city - City name
   * @param {string} country - Country name
   * @param {string} type - Location type
   * @returns {string} Formatted partition key
   */
  static generateLocationPartitionKey(city, country, type) {
    const normalizedCity = (city || 'unknown').toLowerCase().trim();
    const normalizedCountry = (country || 'unknown').toLowerCase().trim();
    const normalizedType = (type || 'fountain').toLowerCase().trim();
    return `${normalizedCity}-${normalizedCountry}-${normalizedType}`;
  }
}

module.exports = DatabaseService;
