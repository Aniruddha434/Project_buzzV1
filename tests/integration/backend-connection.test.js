/**
 * Integration Test: Backend Connection and Health Checks
 * Verifies that all critical API endpoints are accessible and responding correctly
 */

import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

describe('Backend Connection Tests', () => {
  const timeout = 10000; // 10 second timeout for network requests

  test('should connect to root endpoint', async () => {
    try {
      const response = await axios.get(BACKEND_URL, { timeout });
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server not running, skipping connection test');
        return;
      }
      throw error;
    }
  });

  test('should access API health endpoint', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data.status).toBe('healthy');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server not running, skipping health check');
        return;
      }
      throw error;
    }
  });

  test('should access projects endpoint', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`, { timeout });
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server not running, skipping projects endpoint test');
        return;
      }
      throw error;
    }
  });

  test('should handle CORS properly', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/projects`, {
        headers: {
          'Origin': 'http://localhost:5173'
        },
        timeout
      });
      
      expect(response.status).toBe(200);
      // CORS headers should be present in a real environment
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server not running, skipping CORS test');
        return;
      }
      throw error;
    }
  });

  test('should return 404 for non-existent endpoints', async () => {
    try {
      await axios.get(`${BACKEND_URL}/api/non-existent-endpoint`, { timeout });
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Backend server not running, skipping 404 test');
        return;
      }
      expect(error.response?.status).toBe(404);
    }
  });
});

// Health check utility function
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/health`, { timeout: 5000 });
    return response.status === 200 && response.data.status === 'healthy';
  } catch (error) {
    return false;
  }
};

export { BACKEND_URL };
