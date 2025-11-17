export class Environment {
  static get baseUrl(): string {
    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL environment variable is not set');
    }

    return process.env.BASE_URL;
  }
}
