import axios from 'axios';
// import { getCachedApiConfig, resetApiConfig } from './config/api.config.js';

// Use environment variable or fallback to port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout to 30 seconds for registration/login
});

console.log('🔗 API client initialized with URL:', API_BASE_URL);

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
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;