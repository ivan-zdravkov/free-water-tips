/**
 * HTTP response utilities for Azure Functions
 */

function createResponse(statusCode, success, message, data = null, error = null) {
  const response = {
    success,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (error !== null) {
    response.error = error;
  }
  
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(response)
  };
}

function success(message, data = null, statusCode = 200) {
  return createResponse(statusCode, true, message, data);
}

function created(message, data) {
  return createResponse(201, true, message, data);
}

function badRequest(message, error = null) {
  return createResponse(400, false, message, null, error);
}

function notFound(message = 'Resource not found') {
  return createResponse(404, false, message);
}

function methodNotAllowed(message = 'Method not allowed') {
  return createResponse(405, false, message);
}

function internalServerError(message = 'Internal server error', error = null) {
  // Log error for debugging but don't expose details to client
  if (error) {
    console.error('Internal server error:', error);
  }
  return createResponse(500, false, message);
}

function handleError(error, context = 'Unknown operation') {
  console.error(`Error in ${context}:`, error);
  
  // Handle known error types
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return internalServerError('Database connection failed');
  }
  
  if (error.name === 'ValidationError') {
    return badRequest('Validation failed', error.message);
  }
  
  // Default server error
  return internalServerError('An unexpected error occurred');
}

module.exports = {
  success,
  created,
  badRequest,
  notFound,
  methodNotAllowed,
  internalServerError,
  handleError
};
