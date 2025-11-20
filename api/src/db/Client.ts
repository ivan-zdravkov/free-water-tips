import { CosmosClient } from '@azure/cosmos';
import { Environment } from '../utils/Environment';

export class Client {
  private cosmos: CosmosClient;

  constructor() {
    this.cosmos = new CosmosClient({
      endpoint: Environment.cosmosDBEndpoint,
      key: Environment.cosmosDBKey,
    });
  }

  async initialize(): Promise<void> {
    // Initialization logic here if needed
  }

  async isConnected(): Promise<boolean> {
    try {
      const { resource: account } = await this.cosmos.getDatabaseAccount();
      return account != null;
    } catch (error) {
      console.error('Cosmos DB connection check failed:', error);
      return false;
    }
  }
}
