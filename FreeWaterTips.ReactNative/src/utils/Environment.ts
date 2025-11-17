export class Environment {
  static get name(): string {
    const environment = process.env.ENVIRONMENT || process.env.NODE_ENV;

    if (!environment) {
      throw new Error('ENVIRONMENT environment variable is not set.');
    }

    return environment;
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
}
