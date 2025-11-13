import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { HealthResponse, Environment } from '@free-water-tips/shared';
import { Client } from '../db/Client';

const cosmosClient = new Client();

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request.');

  // Log environment variables for debugging
  context.log('Environment variables check:', {
    ENVIRONMENT: process.env.ENVIRONMENT || 'NOT SET',
    COSMOS_DB_ENDPOINT: process.env.COSMOS_DB_ENDPOINT ? 'SET' : 'NOT SET',
    COSMOS_DB_KEY: process.env.COSMOS_DB_KEY
      ? 'SET (length: ' + (process.env.COSMOS_DB_KEY?.length || 0) + ')'
      : 'NOT SET',
  });

  try {
    const cosmosConnected = await cosmosClient.isConnected();

    const response: HealthResponse = {
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      environment: Environment.name,
      cosmosConnected: cosmosConnected,
    };

    return {
      status: 200,
      jsonBody: response,
    };
  } catch (error) {
    context.error('Health check failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const response: HealthResponse = {
      status: 'Unhealthy',
      timestamp: new Date().toISOString(),
      environment: Environment.name,
      cosmosConnected: false,
    };

    return {
      status: 500,
      jsonBody: {
        ...response,
        error: errorMessage, // Add error details for debugging
      },
    };
  }
}

app.http('health', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: health,
});
