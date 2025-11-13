import { EnvironmentEnum } from './EnvironmentEnum';

export class Environment {
  static get name(): string {
    return process.env.ENVIRONMENT || '';
  }

  static get type(): EnvironmentEnum {
    switch (this.name) {
      case 'Development':
        return EnvironmentEnum.Development;
      case 'Testing':
        return EnvironmentEnum.Testing;
      case 'Production':
        return EnvironmentEnum.Production;
      default:
        return EnvironmentEnum.Development;
    }
  }

  static get isDevelopment(): boolean {
    return this.type === EnvironmentEnum.Development;
  }

  static get isTesting(): boolean {
    return this.type === EnvironmentEnum.Testing;
  }

  static get isProduction(): boolean {
    return this.type === EnvironmentEnum.Production;
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
