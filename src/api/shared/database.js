const { CosmosClient } = require('@azure/cosmos');

class DatabaseService {
  constructor() {
    this.client = null;
    this.database = null;
    this.container = null;
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
      const containerName = process.env.COSMOS_CONTAINER_NAME;

      if (!endpoint || !key || !databaseName || !containerName) {
        throw new Error('Missing required Cosmos DB configuration');
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
      console.log('✅ Database connection initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
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
      const location = {
        ...locationData,
        id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        status: 'active',
        verified: false,
        reports: 0,
        rating: 0.0
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
      // Get all locations first (in a real app, you'd want spatial indexing)
      const allLocations = await this.getLocations(filters);

      // Calculate distances and filter
      const nearbyLocations = allLocations
        .map(location => {
          const distance = this.calculateDistance(
            latitude, 
            longitude, 
            location.coordinates.latitude, 
            location.coordinates.longitude
          );
          
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
      console.error('Error fetching nearby locations:', error);
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
}

module.exports = DatabaseService;
