import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { HealthResponse } from '../types/HealthResponse';
import { Environment } from '../utils/Environment';
import { Client } from '../db/Client';

const cosmosClient = new Client();

export async function health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const cosmosConnected = await cosmosClient.isConnected();

    const response: HealthResponse = {
      status: 'Healthy',
      timestamp: new Date().toISOString(),
      environment: Environment.name,
      cosmosConnected: cosmosConnected,
      buildNumber: Environment.buildNumber,
      runId: Environment.runId,
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
      buildNumber: Environment.buildNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
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
