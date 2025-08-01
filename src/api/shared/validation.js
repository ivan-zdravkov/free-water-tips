/**
 * Validation utilities for API requests
 */

function validateCoordinates(latitude, longitude) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'Latitude and longitude must be valid numbers' };
  }
  
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }
  
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }
  
  return { valid: true, latitude: lat, longitude: lng };
}

function validateLocation(locationData) {
  const errors = [];
  
  if (!locationData.name || typeof locationData.name !== 'string' || locationData.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!locationData.address || typeof locationData.address !== 'string' || locationData.address.trim().length === 0) {
    errors.push('Address is required and must be a non-empty string');
  }
  
  if (!locationData.type || typeof locationData.type !== 'string' || locationData.type.trim().length === 0) {
    errors.push('Type is required and must be a non-empty string');
  }
  
  if (!locationData.city || typeof locationData.city !== 'string' || locationData.city.trim().length === 0) {
    errors.push('City is required and must be a non-empty string');
  }
  
  if (!locationData.coordinates) {
    errors.push('Coordinates are required');
  } else {
    const coordValidation = validateCoordinates(
      locationData.coordinates.latitude, 
      locationData.coordinates.longitude
    );
    if (!coordValidation.valid) {
      errors.push(coordValidation.error);
    }
  }
  
  // Validate optional boolean fields
  if (locationData.accessible !== undefined && typeof locationData.accessible !== 'boolean') {
    errors.push('Accessible must be a boolean');
  }
  
  if (locationData.alwaysAvailable !== undefined && typeof locationData.alwaysAvailable !== 'boolean') {
    errors.push('AlwaysAvailable must be a boolean');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateSearchQuery(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return { valid: false, error: 'Search query is required and must be a non-empty string' };
  }
  
  if (query.length > 200) {
    return { valid: false, error: 'Search query must be 200 characters or less' };
  }
  
  return { valid: true, query: query.trim() };
}

function validateRadius(radius) {
  const radiusNum = parseFloat(radius);
  
  if (isNaN(radiusNum)) {
    return { valid: false, error: 'Radius must be a valid number' };
  }
  
  if (radiusNum <= 0) {
    return { valid: false, error: 'Radius must be greater than 0' };
  }
  
  if (radiusNum > 50000) { // 50km max
    return { valid: false, error: 'Radius must be 50000 meters (50km) or less' };
  }
  
  return { valid: true, radius: radiusNum };
}

function parseFilters(queryParams) {
  const filters = {};
  
  if (queryParams.type) {
    filters.type = queryParams.type;
  }
  
  if (queryParams.verified !== undefined) {
    filters.verified = queryParams.verified === 'true';
  }
  
  if (queryParams.accessible !== undefined) {
    filters.accessible = queryParams.accessible === 'true';
  }
  
  if (queryParams.alwaysAvailable !== undefined) {
    filters.alwaysAvailable = queryParams.alwaysAvailable === 'true';
  }
  
  if (queryParams.limit) {
    const limit = parseInt(queryParams.limit);
    if (!isNaN(limit) && limit > 0) {
      filters.limit = Math.min(limit, 1000); // Max 1000
    }
  }
  
  return filters;
}

module.exports = {
  validateCoordinates,
  validateLocation,
  validateSearchQuery,
  validateRadius,
  parseFilters
};
