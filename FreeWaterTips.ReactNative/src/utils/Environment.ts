export class Environment {
  static get name(): string {
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
}
