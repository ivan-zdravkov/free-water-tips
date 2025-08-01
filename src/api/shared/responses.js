/**
 * HTTP response utilities for Azure Functions
 */
function createResponse(request, statusCode, success, message, data = null, error = null) {
  const response = {
    success,
    message
  };
  
  if (data)
    response.data = data;
  
  if (error)
    response.error = error;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.rateLimitHeaders) {
    Object.assign(headers, request.rateLimitHeaders);
  }
  
  return {
    status: statusCode,
    headers,
    body: JSON.stringify(response)
  };
}

function success(request, message, data = null, statusCode = 200) {
  return createResponse(request, statusCode, true, message, data, null);
}

function created(request, message, data) {
  return createResponse(request, 201, true, message, data, null);
}

function badRequest(request, message, error = null) {
  return createResponse(request, 400, false, message, null, error);
}

function notFound(request, message = 'Resource not found') {
  return createResponse(request, 404, false, message, null, null);
}

function methodNotAllowed(request, message = 'Method not allowed') {
  return createResponse(request, 405, false, message, null, null);
}

function internalServerError(request, message = 'Internal server error', error = null) {
  if (error) {
    console.error('Internal server error:', error);
  }

  return createResponse(request, 500, false, message, null, null); // Don't expose error details to client
}

function handleError(request, error, context = 'Unknown operation') {
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return internalServerError(request, `${context}: database connection failed`, error);
  }
  
  if (error.name === 'ValidationError') {
    return badRequest('Validation failed', error.message, request);
  }
  
  return internalServerError(request, `${context}: an unexpected error occurred`, error);
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
