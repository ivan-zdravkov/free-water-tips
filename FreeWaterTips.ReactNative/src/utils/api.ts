import { Platform } from 'react-native';

/**
 * Constructs a complete API URL by combining the base URL with a given path.
 * Automatically handles path formatting and ensures the '/api' segment is included only once.
 *
 * @param path - The API endpoint path (with or without leading slash)
 * @returns The complete API URL with proper formatting
 * @example
 * ```typescript
 * apiUrl('users'); // Returns: "http://localhost:7071/api/users"
 * apiUrl('/users'); // Returns: "http://localhost:7071/api/users"
 * ```
 */
export const apiUrl = (path: string): string => {
  const base = baseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  if (base.includes('/api')) {
    return `${base}/${cleanPath}`;
  }

  return `${base}/api/${cleanPath}`;
};

/**
 * Retrieves the base URL for API requests, adjusted for platform-specific requirements.
 *
 * Android emulator needs 10.0.2.2 to access host's localhost. iOS simulator and web can use localhost.
 * The function reads from the EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT environment variable and applies
 * platform-specific transformations.
 *
 * @returns The base URL for API requests, with trailing slashes removed
 * @example
 * ```typescript
 * baseUrl(); // Returns: "http://localhost:7071" on iOS or web, where EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT is http://localhost:7071/
 * baseUrl(); // Returns: "http://10.0.2.2:7071" on Android with same environment variable
 * ```
 */
const baseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_AZURE_FUNCTIONS_ENDPOINT || '';

  let baseUrl = envUrl.replace(/\/$/, ''); // Remove trailing slash if present

  if (Platform.OS === 'android') {
    baseUrl = baseUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  }

  return baseUrl;
};
