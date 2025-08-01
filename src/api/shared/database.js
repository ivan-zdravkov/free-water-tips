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

      // Auto-create container if it doesn't exist (useful for rate limits and testing)
      if (this.containerType !== 'locations') {
        await this.ensureContainerExists(containerName);
      }

      this.isInitialized = true;
      console.log(`✅ Database connection initialized for container: ${containerName}`);
    } catch (error) {
      console.error(`❌ Failed to initialize database for ${this.containerType}:`, error);
      throw error;
    }
  }

  /**
   * Ensure container exists, create if it doesn't
   * @param {string} containerName - Container name to ensure exists
   */
  async ensureContainerExists(containerName) {
    try {
      const containerConfig = this.getContainerConfig(containerName);
      
      // Validate configuration before creation
      const validatedConfig = this.validateContainerConfig(containerConfig);
      
      await this.database.containers.createIfNotExists(validatedConfig);
      console.log(`✅ Container ensured: ${containerName} (${this.containerType})`);
      
      // Log optimization info for locations container
      if (this.containerType === 'locations') {
        console.log(`🗺️  Geo-spatial indexing enabled for ${containerName}`);
        console.log(`🔑 Partition key: city-country-type for optimal distribution`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to ensure container ${containerName}:`, error);
      throw error;
    }
  }

  /**
   * Get container configuration based on container type
   * @param {string} containerName - Container name
   * @returns {Object} Container configuration
   */
  getContainerConfig(containerName) {
    // Special configurations for different container types
    switch (this.containerType) {
      case 'locations':
        return {
          id: containerName,
          // Composite partition key: city-country-type for better distribution
          partitionKey: { 
            paths: ['/partitionKey'],
            kind: 'Hash'
          },
          indexingPolicy: {
            indexingMode: 'consistent',
            automatic: true,
            includedPaths: [
              // Essential location fields
              { path: '/name/?' },
              { path: '/address/?' },
              { path: '/city/?' },
              { path: '/country/?' },
              { path: '/type/?' },
              { path: '/status/?' },
              { path: '/verified/?' },
              { path: '/accessible/?' },
              { path: '/alwaysAvailable/?' },
              { path: '/tags/*' },
              { path: '/createdAt/?' },
              { path: '/updatedAt/?' },
              { path: '/rating/?' },
              { path: '/reports/?' },
              // Geo-spatial indexing for coordinates
              { path: '/coordinates/?' },
              { path: '/coordinates/latitude/?' },
              { path: '/coordinates/longitude/?' }
            ],
            excludedPaths: [
              // Exclude large text fields and metadata from indexing
              { path: '/description/?' },
              { path: '/photos/*' },
              { path: '/operatingHours/?' },
              { path: '/contact/?' },
              { path: '/socialMedia/*' },
              { path: '/metadata/*' }
            ],
            spatialIndexes: [
              {
                path: '/coordinates/*',
                types: ['Point']
              }
            ]
          },
          // Throughput settings for locations (higher RU/s due to frequent reads)
          throughput: {
            offerThroughput: 1000 // Start with 1000 RU/s, can be scaled
          }
        };

      case 'ratelimits':
        return {
          id: containerName,
          partitionKey: { 
            paths: ['/clientId'],
            kind: 'Hash'
          },
          defaultTtl: 3600, // 1 hour default TTL for automatic cleanup
          indexingPolicy: {
            indexingMode: 'consistent',
            automatic: true,
            includedPaths: [
              // Only index essential rate limiting fields
              { path: '/clientId/?' },
              { path: '/resetTime/?' },
              { path: '/requests/?' },
              { path: '/windowStart/?' }
            ],
            excludedPaths: [
              // Exclude all other paths for optimal performance
              { path: '/*' }
            ]
          },
          // Lower throughput for rate limiting (lighter load)
          throughput: {
            offerThroughput: 400 // Start with 400 RU/s
          }
        };
      
      case 'test':
        return {
          id: containerName,
          partitionKey: { 
            paths: ['/testType'],
            kind: 'Hash'
          },
          defaultTtl: 86400, // 24 hours default TTL for test data cleanup
          indexingPolicy: {
            indexingMode: 'consistent',
            automatic: true,
            includedPaths: [
              { path: '/testType/?' },
              { path: '/createdAt/?' },
              { path: '/testId/?' }
            ],
            excludedPaths: [
              // Minimal indexing for test data
              { path: '/data/*' },
              { path: '/metadata/*' }
            ]
          },
          // Minimal throughput for test data
          throughput: {
            offerThroughput: 400 // Start with 400 RU/s
          }
        };
      
      default:
        // Fallback configuration
        return {
          id: containerName,
          partitionKey: { paths: ['/id'] },
          indexingPolicy: {
            indexingMode: 'consistent',
            automatic: true
          },
          throughput: {
            offerThroughput: 400
          }
        };
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

  /**
   * Enhanced container setup with retry logic and validation
   * @param {string} containerName - Container name to ensure exists
   */
  async ensureContainerExistsWithRetry(containerName, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.ensureContainerExists(containerName);
        console.log(`✅ Container successfully ensured: ${containerName} (attempt ${attempt})`);
        return;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️  Attempt ${attempt}/${maxRetries} failed for container ${containerName}:`, error.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`❌ Failed to ensure container after ${maxRetries} attempts:`, lastError);
    throw lastError;
  }

  /**
   * Validate container configuration before creation
   * @param {Object} config - Container configuration
   * @returns {Object} Validated configuration
   */
  validateContainerConfig(config) {
    const requiredFields = ['id', 'partitionKey'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Container configuration missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate partition key structure
    if (!config.partitionKey.paths || !Array.isArray(config.partitionKey.paths)) {
      throw new Error('Partition key must have a paths array');
    }

    // Validate throughput settings if provided
    if (config.throughput && config.throughput.offerThroughput) {
      const throughput = config.throughput.offerThroughput;
      if (throughput < 400 || throughput > 100000) {
        console.warn(`⚠️  Throughput ${throughput} RU/s is outside recommended range (400-100000)`);
      }
    }

    // Validate TTL settings
    if (config.defaultTtl !== undefined && config.defaultTtl < -1) {
      throw new Error('Default TTL must be -1 (no TTL) or positive number (seconds)');
    }

    return config;
  }

  /**
   * Get container performance metrics and optimization suggestions
   * @returns {Object} Performance insights
   */
  async getContainerInsights() {
    await this.initialize();
    
    try {
      // This would require additional monitoring setup, but provides a framework
      const insights = {
        containerType: this.containerType,
        partitionStrategy: this.getPartitionStrategy(),
        indexingStrategy: this.getIndexingStrategy(),
        recommendations: this.getOptimizationRecommendations()
      };
      
      return insights;
    } catch (error) {
      console.error('Error getting container insights:', error);
      return {
        containerType: this.containerType,
        error: error.message
      };
    }
  }

  /**
   * Get partition strategy description
   * @returns {Object} Partition strategy info
   */
  getPartitionStrategy() {
    switch (this.containerType) {
      case 'locations':
        return {
          key: 'partitionKey (city-country-type)',
          rationale: 'Distributes data geographically and by type for optimal query performance',
          benefits: ['Even distribution', 'Geo-query optimization', 'Type-based filtering']
        };
      case 'ratelimits':
        return {
          key: 'clientId',
          rationale: 'Isolates rate limit data per client for fast lookups and updates',
          benefits: ['Client isolation', 'Fast lookups', 'TTL efficiency']
        };
      case 'test':
        return {
          key: 'testType',
          rationale: 'Groups test data by type for efficient cleanup and isolation',
          benefits: ['Test isolation', 'Batch operations', 'Easy cleanup']
        };
      default:
        return {
          key: 'id',
          rationale: 'Default single-field partition key',
          benefits: ['Simple setup']
        };
    }
  }

  /**
   * Get indexing strategy description
   * @returns {Object} Indexing strategy info
   */
  getIndexingStrategy() {
    switch (this.containerType) {
      case 'locations':
        return {
          approach: 'Selective with geo-spatial support',
          features: ['Geo-spatial indexing', 'Essential field indexing', 'Large field exclusion'],
          optimizations: ['ST_DISTANCE queries', 'Reduced RU consumption', 'Fast geo searches']
        };
      case 'ratelimits':
        return {
          approach: 'Minimal indexing for performance',
          features: ['Client-focused indexing', 'Time-based indexing', 'Exclude unnecessary fields'],
          optimizations: ['Fast rate limit checks', 'Efficient TTL', 'Low RU overhead']
        };
      case 'test':
        return {
          approach: 'Basic indexing for test scenarios',
          features: ['Test type indexing', 'Creation time indexing'],
          optimizations: ['Test data isolation', 'Efficient cleanup']
        };
      default:
        return {
          approach: 'Default automatic indexing',
          features: ['All fields indexed'],
          optimizations: ['General purpose']
        };
    }
  }

  /**
   * Get optimization recommendations
   * @returns {Array} List of recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    
    switch (this.containerType) {
      case 'locations':
        recommendations.push(
          'Use ST_DISTANCE for nearby location queries',
          'Include partition key in queries when possible',
          'Consider read-heavy throughput allocation',
          'Monitor geo-spatial query performance',
          'Use composite indexes for complex filters'
        );
        break;
      case 'ratelimits':
        recommendations.push(
          'Leverage TTL for automatic cleanup',
          'Use point reads with clientId partition key',
          'Monitor RU consumption during peak traffic',
          'Consider autoscale for variable load'
        );
        break;
      case 'test':
        recommendations.push(
          'Use TTL for automatic test data cleanup',
          'Group tests by type for efficient operations',
          'Consider separate containers for different test suites'
        );
        break;
    }
    
    return recommendations;
  }
}

module.exports = DatabaseService;
