import axios from 'axios';
import { isDevelopmentMode, getApiUrl, forceDevApiUrl, logEnvironmentInfo } from './utils/devMode.js';
// import { getCachedApiConfig, resetApiConfig } from './config/api.config.js';

// Get API URL based on environment detection
const API_BASE_URL = getApiUrl();

// Log comprehensive environment information
logEnvironmentInfo();

console.log('🔍 Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});

// Create axios instance with dynamic baseURL
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout to 30 seconds for registration/login
});

// Set baseURL dynamically to ensure it's always current
api.defaults.baseURL = API_BASE_URL;

// Force development URL override if needed
forceDevApiUrl(api);

console.log('🔗 API client initialized with URL:', API_BASE_URL);
console.log('🔗 Final API baseURL:', api.defaults.baseURL);

// Test API configuration immediately
console.log('🧪 Testing API configuration...');
api.get('/').then(response => {
  console.log('✅ API test successful:', response.data);
}).catch(error => {
  console.error('❌ API test failed:', error.message);
  console.error('❌ Full error:', error);
});

// Dynamic configuration update - DISABLED for now, using fixed URL
// let configInitialized = false;

// const initializeApiConfig = async () => {
//   if (configInitialized) return;

//   try {
//     const config = await getCachedApiConfig();
//     api.defaults.baseURL = config.fullApiURL;
//     api.defaults.timeout = config.timeout;
//     configInitialized = true;

//     console.log(`🔗 API client configured for: ${config.fullApiURL}`);
//   } catch (error) {
//     console.warn('⚠️  Failed to initialize dynamic API config:', error.message);
//   }
// };

// Initialize configuration asynchronously
// initializeApiConfig();

// Utility function to reset and reinitialize API configuration - DISABLED
// export const reinitializeApi = async () => {
//   configInitialized = false;
//   resetApiConfig();
//   await initializeApiConfig();
// };

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FORCE localhost in development - Runtime override
  const currentHostname = window.location.hostname;
  if (currentHostname === 'localhost' || currentHostname === '127.0.0.1') {
    config.baseURL = 'http://localhost:5000/api';
    console.log('🚨 RUNTIME OVERRIDE: Forcing localhost API URL');
  }

  // Debug logging
  console.log('🔍 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    hostname: currentHostname,
    headers: config.headers
  });

  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;