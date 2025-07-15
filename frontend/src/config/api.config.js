/**
 * Dynamic API Configuration
 * Handles automatic backend URL detection and port management
 */

// Environment-based configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Default configuration
const DEFAULT_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000',
    apiPath: '/api',
    timeout: 10000,
    retries: 3,
    retryDelay: 1000
  },
  production: {
    baseURL: import.meta.env.VITE_BACKEND_URL || 'https://project-buzzv1-2.onrender.com',
    apiPath: '/api',
    timeout: 15000,
    retries: 2,
    retryDelay: 2000
  }
};

/**
 * Test if a backend URL is reachable
 * @param {string} url - URL to test
 * @returns {Promise<boolean>} - True if reachable
 */
const testBackendConnection = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${url}/api`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 404; // 404 is OK, means server is running
  } catch (error) {
    return false;
  }
};

/**
 * Auto-detect the correct backend URL
 * @returns {Promise<string>} - Working backend URL
 */
const autoDetectBackendURL = async () => {
  // Priority list of URLs to try (prioritize 5000 since that's where our backend is currently running)
  const urlsToTry = [
    import.meta.env.VITE_API_URL?.replace('/api', ''),
    import.meta.env.VITE_BACKEND_URL,
    'http://localhost:5000', // Current backend port
    'http://localhost:5001',
    'http://localhost:5002',
    'http://localhost:5003',
    'http://localhost:3000',
    'http://localhost:8000'
  ].filter(Boolean); // Remove undefined values

  console.log('🔍 Auto-detecting backend URL...');

  for (const url of urlsToTry) {
    console.log(`   Testing: ${url}`);
    if (await testBackendConnection(url)) {
      console.log(`✅ Backend found at: ${url}`);
      return url;
    }
  }

  // Fallback to default
  const fallback = DEFAULT_CONFIG.development.baseURL;
  console.warn(`⚠️  No backend detected, using fallback: ${fallback}`);
  return fallback;
};

/**
 * Get the current API configuration
 * @returns {Promise<Object>} - API configuration object
 */
export const getApiConfig = async () => {
  const env = isDevelopment ? 'development' : 'production';
  const baseConfig = DEFAULT_CONFIG[env];

  let baseURL = baseConfig.baseURL;

  // In development, auto-detect the backend URL
  if (isDevelopment) {
    try {
      baseURL = await autoDetectBackendURL();
    } catch (error) {
      console.warn('Failed to auto-detect backend, using default:', error.message);
    }
  }

  return {
    ...baseConfig,
    baseURL,
    fullApiURL: `${baseURL}${baseConfig.apiPath}`,
    environment: env,
    isDevelopment,
    isProduction
  };
};

/**
 * Create a cached version of the API config
 */
let cachedConfig = null;
let configPromise = null;

export const getCachedApiConfig = () => {
  if (cachedConfig) {
    return Promise.resolve(cachedConfig);
  }

  if (!configPromise) {
    configPromise = getApiConfig().then(config => {
      cachedConfig = config;
      return config;
    });
  }

  return configPromise;
};

/**
 * Reset the cached configuration (useful for testing or when backend changes)
 */
export const resetApiConfig = () => {
  cachedConfig = null;
  configPromise = null;
};

/**
 * Get a simple API URL for immediate use (synchronous)
 * This uses environment variables and falls back to defaults
 */
export const getSimpleApiUrl = () => {
  return import.meta.env.VITE_API_URL ||
         `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;
};

// Export configuration constants
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  PROJECTS: '/projects',
  PAYMENTS: '/payments',
  ADMIN: '/admin'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

export default {
  getApiConfig,
  getCachedApiConfig,
  resetApiConfig,
  getSimpleApiUrl,
  API_ENDPOINTS,
  HTTP_STATUS
};
