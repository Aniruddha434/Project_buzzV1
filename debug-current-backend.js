#!/usr/bin/env node

/**
 * Debug script to test the current backend state after the conditional multer fix
 */

import axios from 'axios';
import FormData from 'form-data';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function createTestSeller() {
  const testSeller = {
    email: `debug-current-${Date.now()}@test.com`,
    password: 'TestPassword123',
    displayName: 'Debug Current Seller',
    fullName: 'Debug Current Seller Full',
    phoneNumber: '+1234567890',
    occupation: 'Developer',
    experienceLevel: 'intermediate',
    yearsOfExperience: 3,
    motivation: 'Testing current backend state',
    specializations: ['web-development'],
    sellerTermsAccepted: true
  };

  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register-seller`, testSeller);
    if (response.data.success) {
      return response.data.data.token;
    }
    throw new Error('Failed to create test seller');
  } catch (error) {
    log(`❌ Failed to create test seller: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function debugCurrentBackend() {
  try {
    log('🔍 Debugging Current Backend State', 'cyan');
    log('=================================', 'cyan');

    // Test 1: Basic server health
    log('\n🏥 Testing server health...', 'blue');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}`, { timeout: 10000 });
      log('✅ Server is responding', 'green');
    } catch (healthError) {
      log('❌ Server health check failed', 'red');
      log(`   Error: ${healthError.message}`, 'red');
      return;
    }

    // Test 2: Create test seller
    log('\n🔐 Creating test seller...', 'blue');
    const token = await createTestSeller();
    if (!token) {
      log('❌ Cannot proceed without authentication token', 'red');
      return;
    }
    log('✅ Test seller created successfully', 'green');

    // Test 3: Test notifications endpoint
    log('\n📢 Testing notifications endpoint...', 'blue');
    try {
      const notificationsResponse = await axios.get(
        `${BACKEND_URL}/api/notifications/unread-count`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      log('✅ Notifications endpoint working', 'green');
    } catch (notifError) {
      log('❌ Notifications endpoint failed', 'red');
      log(`   Status: ${notifError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${notifError.response?.data?.message || notifError.message}`, 'red');
    }

    // Test 4: Test projects GET endpoint
    log('\n📋 Testing projects GET endpoint...', 'blue');
    try {
      const projectsGetResponse = await axios.get(
        `${BACKEND_URL}/api/projects`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      log('✅ Projects GET endpoint working', 'green');
      log(`   Found ${projectsGetResponse.data.data?.length || 0} projects`, 'green');
    } catch (getError) {
      log('❌ Projects GET endpoint failed', 'red');
      log(`   Status: ${getError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${getError.response?.data?.message || getError.message}`, 'red');
    }

    // Test 5: Test project creation with minimal JSON data
    log('\n📝 Testing project creation with minimal JSON...', 'blue');
    const minimalProject = {
      title: 'Debug Minimal Project',
      description: 'Testing minimal project creation after conditional multer fix.',
      price: 99.99
    };

    try {
      const jsonResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        minimalProject,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (jsonResponse.data.success) {
        log('✅ JSON project creation successful', 'green');
        log(`   Project ID: ${jsonResponse.data.data._id}`, 'green');
      }
    } catch (jsonError) {
      log('❌ JSON project creation failed', 'red');
      log(`   Status: ${jsonError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${jsonError.response?.data?.message || jsonError.message}`, 'red');
      
      if (jsonError.response?.data?.errors) {
        log('   Validation errors:', 'yellow');
        jsonError.response.data.errors.forEach(err => {
          log(`     - ${err.path}: ${err.msg}`, 'yellow');
        });
      }

      if (jsonError.response?.status === 500) {
        log('   🔍 500 Error Details:', 'red');
        log(`   Full response: ${JSON.stringify(jsonError.response.data, null, 2)}`, 'red');
      }
    }

    // Test 6: Test project creation with FormData
    log('\n📝 Testing project creation with FormData...', 'blue');
    try {
      const formData = new FormData();
      formData.append('title', 'Debug FormData Project');
      formData.append('description', 'Testing FormData project creation after conditional multer fix.');
      formData.append('price', '149.99');

      const formResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
          },
          timeout: 30000
        }
      );

      if (formResponse.data.success) {
        log('✅ FormData project creation successful', 'green');
        log(`   Project ID: ${formResponse.data.data._id}`, 'green');
      }
    } catch (formError) {
      log('❌ FormData project creation failed', 'red');
      log(`   Status: ${formError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${formError.response?.data?.message || formError.message}`, 'red');
      
      if (formError.response?.data?.errors) {
        log('   Validation errors:', 'yellow');
        formError.response.data.errors.forEach(err => {
          log(`     - ${err.path}: ${err.msg}`, 'yellow');
        });
      }

      if (formError.response?.status === 500) {
        log('   🔍 500 Error Details:', 'red');
        log(`   Full response: ${JSON.stringify(formError.response.data, null, 2)}`, 'red');
      }
    }

    // Test 7: Test with complete project data (like frontend sends)
    log('\n📝 Testing with complete project data (frontend simulation)...', 'blue');
    const completeProject = {
      title: 'Complete Debug Project',
      description: 'Testing complete project creation with all fields like frontend sends.',
      price: 299.99,
      category: 'web',
      githubRepo: 'https://github.com/test/complete-debug',
      tags: JSON.stringify(['test', 'debug', 'complete']),
      completionStatus: 100,
      'projectDetails.timeline': '2 weeks',
      'projectDetails.techStack': 'React, Node.js, MongoDB',
      'projectDetails.complexityLevel': 'intermediate',
      'projectDetails.installationInstructions': 'npm install && npm start',
      'projectDetails.usageInstructions': 'Follow the README',
      'projectDetails.prerequisites': 'Node.js 18+'
    };

    try {
      const completeFormData = new FormData();
      Object.keys(completeProject).forEach(key => {
        completeFormData.append(key, completeProject[key]);
      });

      const completeResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        completeFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...completeFormData.getHeaders()
          },
          timeout: 30000
        }
      );

      if (completeResponse.data.success) {
        log('✅ Complete FormData project creation successful', 'green');
        log(`   Project ID: ${completeResponse.data.data._id}`, 'green');
      }
    } catch (completeError) {
      log('❌ Complete FormData project creation failed', 'red');
      log(`   Status: ${completeError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${completeError.response?.data?.message || completeError.message}`, 'red');
      
      if (completeError.response?.data?.errors) {
        log('   Validation errors:', 'yellow');
        completeError.response.data.errors.forEach(err => {
          log(`     - ${err.path}: ${err.msg}`, 'yellow');
        });
      }

      if (completeError.response?.status === 500) {
        log('   🔍 500 Error Details:', 'red');
        log(`   Full response: ${JSON.stringify(completeError.response.data, null, 2)}`, 'red');
      }
    }

    log('\n📊 Debug Summary:', 'cyan');
    log('═'.repeat(50), 'cyan');
    log('Check the results above to identify:', 'yellow');
    log('1. Which endpoints are working vs failing', 'yellow');
    log('2. Whether the conditional multer fix was deployed', 'yellow');
    log('3. What specific errors are occurring', 'yellow');
    log('4. Whether it\'s a validation, authentication, or server issue', 'yellow');

  } catch (error) {
    log(`❌ Debug test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run the debug test
debugCurrentBackend();
