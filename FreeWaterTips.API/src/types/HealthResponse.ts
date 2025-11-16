export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
  cosmosConnected: boolean;
  buildNumber?: string;
  runId?: string;
  error?: string;
}
