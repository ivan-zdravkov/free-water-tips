import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { Client } from '../db/Client';
import { Environment } from '../utils/Environment';
import { HealthResponse } from '../types/HealthResponse';

const cosmosClient = new Client();

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('HTTP trigger function processed a request.');

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

    const response: HealthResponse = {
      status: 'Unhealthy',
      timestamp: new Date().toISOString(),
      environment: Environment.name,
      cosmosConnected: false,
    };

    return {
      status: 500,
      jsonBody: response,
    };
  }
}

app.http('health', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: health,
});
