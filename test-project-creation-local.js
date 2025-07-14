#!/usr/bin/env node

/**
 * Local Project Creation Test
 * Tests project creation against local backend to identify issues
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test-seller@example.com';
const TEST_PASSWORD = 'testpassword123';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test authentication and get token
async function authenticate() {
  try {
    log('\n🔐 Testing Authentication...', 'blue');
    
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.data.success && response.data.token) {
      log('✅ Authentication successful', 'green');
      return response.data.token;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    log('❌ Authentication failed:', 'red');
    log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    
    // Try to register if login fails
    try {
      log('🔄 Attempting to register test user...', 'yellow');
      await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        displayName: 'Test Seller',
        role: 'seller'
      });
      
      // Try login again
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });
      
      if (loginResponse.data.success && loginResponse.data.token) {
        log('✅ Registration and login successful', 'green');
        return loginResponse.data.token;
      }
    } catch (regError) {
      log('❌ Registration also failed:', 'red');
      log(`   Error: ${regError.response?.data?.message || regError.message}`, 'red');
    }
    
    throw error;
  }
}

// Test project creation with current frontend logic
async function testProjectCreationCurrentLogic(token) {
  try {
    log('\n📝 Testing Project Creation (Current Frontend Logic)...', 'blue');
    
    // Simulate exact data structure from SellerDashboardPro.tsx
    const projectData = {
      title: 'Test Project Current Logic',
      description: 'This is a test project created using the current frontend logic to identify the 500 error.',
      price: 99.99,
      category: 'web',
      tags: ['react', 'javascript', 'test'],
      githubRepo: 'https://github.com/test/repo',
      demoUrl: 'https://test-demo.com',
      completionStatus: 100,
      projectDetails: {
        timeline: '2-3 weeks',
        techStack: 'React, Node.js, MongoDB',
        complexityLevel: 'intermediate',
        installationInstructions: 'npm install && npm start',
        usageInstructions: 'Follow the README file',
        prerequisites: 'Node.js 18+'
      }
    };

    // Replicate the exact FormData creation logic from projectService.js
    const formData = new FormData();

    // Append text fields (excluding specific keys)
    Object.keys(projectData).forEach(key => {
      if (key !== 'image' && key !== 'images' && key !== 'documentationFiles' && key !== 'projectZipFile' && key !== 'projectDetails' && projectData[key] !== undefined) {
        if (Array.isArray(projectData[key])) {
          formData.append(key, JSON.stringify(projectData[key]));
        } else {
          formData.append(key, projectData[key]);
        }
      }
    });

    // Handle projectDetails separately with flattened field names (FIRST TIME)
    if (projectData.projectDetails) {
      Object.keys(projectData.projectDetails).forEach(detailKey => {
        const value = projectData.projectDetails[detailKey];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(`projectDetails.${detailKey}`, value);
        }
      });
    }

    // Append project details as individual fields (SECOND TIME - DUPLICATE!)
    if (projectData.projectDetails) {
      Object.keys(projectData.projectDetails).forEach(key => {
        if (projectData.projectDetails[key] !== undefined) {
          formData.append(`projectDetails.${key}`, projectData.projectDetails[key]);
        }
      });
    }

    log('📋 FormData contents:', 'cyan');
    for (const [key, value] of formData.entries()) {
      log(`   ${key}: ${value}`, 'cyan');
    }

    const response = await axios.post(`${BACKEND_URL}/api/projects`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });

    if (response.data.success) {
      log('✅ Project creation successful with current logic!', 'green');
      log(`   Project ID: ${response.data.data._id}`, 'green');
      return response.data.data;
    } else {
      log('❌ Project creation failed (success: false)', 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }

  } catch (error) {
    log('❌ Project creation failed with current logic:', 'red');
    log(`   Status: ${error.response?.status}`, 'red');
    log(`   Message: ${error.response?.data?.message || error.message}`, 'red');
    log(`   Errors: ${JSON.stringify(error.response?.data?.errors, null, 2)}`, 'red');
    throw error;
  }
}

// Test project creation with fixed logic (no duplicates)
async function testProjectCreationFixedLogic(token) {
  try {
    log('\n🔧 Testing Project Creation (Fixed Logic - No Duplicates)...', 'blue');
    
    const projectData = {
      title: 'Test Project Fixed Logic',
      description: 'This is a test project created using the fixed frontend logic without duplicate fields.',
      price: 149.99,
      category: 'web',
      tags: ['react', 'javascript', 'fixed'],
      githubRepo: 'https://github.com/test/fixed-repo',
      demoUrl: 'https://test-fixed-demo.com',
      completionStatus: 100,
      projectDetails: {
        timeline: '3-4 weeks',
        techStack: 'React, Node.js, MongoDB, Express',
        complexityLevel: 'advanced',
        installationInstructions: 'npm install && npm run build && npm start',
        usageInstructions: 'Check the documentation folder',
        prerequisites: 'Node.js 18+, MongoDB'
      }
    };

    const formData = new FormData();

    // Append text fields (excluding specific keys)
    Object.keys(projectData).forEach(key => {
      if (key !== 'image' && key !== 'images' && key !== 'documentationFiles' && key !== 'projectZipFile' && key !== 'projectDetails' && projectData[key] !== undefined) {
        if (Array.isArray(projectData[key])) {
          formData.append(key, JSON.stringify(projectData[key]));
        } else {
          formData.append(key, projectData[key]);
        }
      }
    });

    // Handle projectDetails ONLY ONCE with flattened field names
    if (projectData.projectDetails) {
      Object.keys(projectData.projectDetails).forEach(detailKey => {
        const value = projectData.projectDetails[detailKey];
        if (value !== undefined && value !== null && value !== '') {
          formData.append(`projectDetails.${detailKey}`, value);
        }
      });
    }

    log('📋 FormData contents (Fixed):', 'cyan');
    for (const [key, value] of formData.entries()) {
      log(`   ${key}: ${value}`, 'cyan');
    }

    const response = await axios.post(`${BACKEND_URL}/api/projects`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });

    if (response.data.success) {
      log('✅ Project creation successful with fixed logic!', 'green');
      log(`   Project ID: ${response.data.data._id}`, 'green');
      return response.data.data;
    } else {
      log('❌ Project creation failed (success: false)', 'red');
      log(`   Response: ${JSON.stringify(response.data, null, 2)}`, 'red');
    }

  } catch (error) {
    log('❌ Project creation failed with fixed logic:', 'red');
    log(`   Status: ${error.response?.status}`, 'red');
    log(`   Message: ${error.response?.data?.message || error.message}`, 'red');
    log(`   Errors: ${JSON.stringify(error.response?.data?.errors, null, 2)}`, 'red');
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    log('🚀 Starting Project Creation Local Tests', 'magenta');
    log('==========================================', 'magenta');

    // Test backend connectivity
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/api`);
      log('✅ Backend is running and accessible', 'green');
      log(`   Version: ${healthResponse.data.version}`, 'green');
    } catch (error) {
      log('❌ Backend is not accessible:', 'red');
      log(`   Error: ${error.message}`, 'red');
      log('   Please start the backend server first: npm run dev', 'yellow');
      return;
    }

    // Authenticate
    const token = await authenticate();

    // Test current logic (with duplicates)
    try {
      await testProjectCreationCurrentLogic(token);
    } catch (error) {
      log('⚠️ Current logic test failed as expected', 'yellow');
    }

    // Test fixed logic (without duplicates)
    try {
      await testProjectCreationFixedLogic(token);
    } catch (error) {
      log('⚠️ Fixed logic test also failed - investigating further...', 'yellow');
    }

    log('\n🎯 Test Summary:', 'magenta');
    log('================', 'magenta');
    log('✅ Tests completed. Check results above.', 'green');

  } catch (error) {
    log('\n❌ Test execution failed:', 'red');
    log(`   Error: ${error.message}`, 'red');
  }
}

// Run tests
runTests();
