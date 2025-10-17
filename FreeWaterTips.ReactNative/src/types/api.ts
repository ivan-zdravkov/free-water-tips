export interface HealthResponse {
  status: string;
  azureFunctionsEndpoint: string;
  cosmosDBEndpoint: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hasWater: boolean;
}
