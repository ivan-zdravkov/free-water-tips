export class Environment {
  static get name(): string {
    // Support both Node.js (process.env) and React Native (process.env via metro)
    // In React Native, check ENVIRONMENT first, then fall back to NODE_ENV
    return process.env.ENVIRONMENT || process.env.NODE_ENV || '';
  }

  static get isDevelopment(): boolean {
    return this.name !== 'Production' && this.name !== 'Testing';
  }

  static get isTesting(): boolean {
    return this.name === 'Testing';
  }

  static get isProduction(): boolean {
    return this.name === 'Production';
  }

  static get cosmosDBEndpoint(): string {
    const endpoint = process.env.COSMOS_DB_ENDPOINT;

    if (!endpoint) {
      throw new Error("Environment variable 'COSMOS_DB_ENDPOINT' missing.");
    }

    return endpoint;
  }

  static get cosmosDBKey(): string {
    const key = process.env.COSMOS_DB_KEY;

    if (!key) {
      throw new Error("Environment variable 'COSMOS_DB_KEY' missing.");
    }

    return key;
  }
}
