/**
 * Development Mode Detection and API URL Override
 * This utility ensures that localhost always uses local backend
 */

// Check if we're in development mode
export const isDevelopmentMode = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    port === '5173' ||
    port === '5174' ||
    port === '5175' ||
    port === '5176' ||
    port === '3000' ||
    port === '4173'
  );
};

// Get the correct API URL based on environment
export const getApiUrl = () => {
  if (isDevelopmentMode()) {
    console.log('🔧 Development mode detected - using localhost API');
    return 'http://localhost:5000/api';
  } else {
    console.log('🌐 Production mode detected - using production API');
    return 'https://project-buzzv1-2.onrender.com/api';
  }
};

// Get the correct backend URL for OAuth redirects
export const getBackendUrl = () => {
  if (isDevelopmentMode()) {
    return 'http://localhost:5000';
  } else {
    return 'https://project-buzzv1-2.onrender.com';
  }
};

// Force override API URL for development
export const forceDevApiUrl = (axiosInstance) => {
  if (isDevelopmentMode()) {
    const devUrl = 'http://localhost:5000/api';
    axiosInstance.defaults.baseURL = devUrl;
    console.log('🚨 FORCED API URL OVERRIDE:', devUrl);
    return devUrl;
  }
  return axiosInstance.defaults.baseURL;
};

// Log environment information
export const logEnvironmentInfo = () => {
  console.log('🔍 Environment Information:', {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    isDevelopment: isDevelopmentMode(),
    apiUrl: getApiUrl(),
    backendUrl: getBackendUrl(),
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });
};
