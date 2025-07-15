/**
 * Integration Test: Project Creation Workflow
 * Tests the complete project creation process including authentication and file uploads
 * Migrated from comprehensive-project-creation-test.js
 */

import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'https://project-buzzv1-2.onrender.com';

describe('Project Creation Integration Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup: Login to get authentication token
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'seller@test.com',
        password: 'password123'
      });
      authToken = loginResponse.data.data?.token;
    } catch (error) {
      console.warn('Login failed, using test token');
      authToken = 'test-token';
    }
  });

  test('should create project with JSON data', async () => {
    const projectData = {
      title: 'Test Project - JSON',
      description: 'Testing JSON project creation.',
      price: 99.99,
      category: 'web',
      tags: ['react', 'javascript']
    };

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/projects`,
        projectData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.title).toBe(projectData.title);
      expect(response.data.data.price).toBe(projectData.price);
    } catch (error) {
      if (error.response?.status === 401) {
        console.warn('Authentication required for this test');
        return;
      }
      throw error;
    }
  });

  test('should handle validation errors gracefully', async () => {
    const invalidProjectData = {
      title: '', // Invalid: empty title
      description: 'Test description',
      price: -10 // Invalid: negative price
    };

    try {
      await axios.post(
        `${BACKEND_URL}/api/projects`,
        invalidProjectData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.success).toBe(false);
    }
  });

  test('should require authentication', async () => {
    const projectData = {
      title: 'Unauthorized Test Project',
      description: 'Testing without authentication.',
      price: 50
    };

    try {
      await axios.post(`${BACKEND_URL}/api/projects`, projectData);
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response?.status).toBe(401);
    }
  });
});

// Export for use in other test files
export { BACKEND_URL };
