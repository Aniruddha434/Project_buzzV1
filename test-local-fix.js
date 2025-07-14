#!/usr/bin/env node

/**
 * Test script to verify the conditional multer middleware fix
 * Tests both JSON and FormData requests to ensure the fix works
 */

import axios from 'axios';
import FormData from 'form-data';

// Test against the deployed backend (since we can't run locally easily)
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
    email: `fix-test-${Date.now()}@test.com`,
    password: 'TestPassword123',
    displayName: 'Fix Test Seller',
    fullName: 'Fix Test Seller Full',
    phoneNumber: '+1234567890',
    occupation: 'Developer',
    experienceLevel: 'intermediate',
    yearsOfExperience: 3,
    motivation: 'Testing the conditional multer fix',
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

async function testConditionalMulterFix() {
  try {
    log('🧪 Testing Conditional Multer Middleware Fix', 'cyan');
    log('============================================', 'cyan');

    // Create test seller
    log('\n🔐 Creating test seller...', 'blue');
    const token = await createTestSeller();
    if (!token) {
      log('❌ Cannot proceed without authentication token', 'red');
      return;
    }
    log('✅ Test seller created successfully', 'green');

    // Test data
    const testProject = {
      title: 'Conditional Multer Test Project',
      description: 'This project tests the conditional multer middleware fix for the 500 error.',
      price: 199.99,
      category: 'web',
      githubRepo: 'https://github.com/test/conditional-multer-fix',
      tags: JSON.stringify(['test', 'fix', 'multer']),
      completionStatus: 100,
      'projectDetails.timeline': '1 week',
      'projectDetails.techStack': 'React, Node.js',
      'projectDetails.complexityLevel': 'intermediate',
      'projectDetails.installationInstructions': 'npm install && npm start',
      'projectDetails.usageInstructions': 'Follow the README',
      'projectDetails.prerequisites': 'Node.js 18+'
    };

    // Test 1: JSON Request (should work as before)
    log('\n📝 Test 1: JSON Request (application/json)', 'blue');
    try {
      const jsonResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        testProject,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (jsonResponse.data.success) {
        log('✅ JSON request successful - multer middleware skipped correctly', 'green');
        log(`   Project ID: ${jsonResponse.data.data._id}`, 'green');
      }
    } catch (jsonError) {
      log('❌ JSON request failed', 'red');
      log(`   Status: ${jsonError.response?.status}`, 'red');
      log(`   Error: ${jsonError.response?.data?.message || jsonError.message}`, 'red');
    }

    // Test 2: FormData Request (should now work with conditional middleware)
    log('\n📝 Test 2: FormData Request (multipart/form-data)', 'blue');
    try {
      const formData = new FormData();
      Object.keys(testProject).forEach(key => {
        formData.append(key, testProject[key]);
      });

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
        log('✅ FormData request successful - conditional multer middleware working!', 'green');
        log(`   Project ID: ${formResponse.data.data._id}`, 'green');
      }
    } catch (formError) {
      log('❌ FormData request failed', 'red');
      log(`   Status: ${formError.response?.status}`, 'red');
      log(`   Error: ${formError.response?.data?.message || formError.message}`, 'red');
      
      if (formError.response?.status === 500) {
        log('   🔍 Still getting 500 error - fix may need deployment', 'yellow');
      }
    }

    // Test 3: FormData with minimal data (edge case)
    log('\n📝 Test 3: FormData with minimal data', 'blue');
    try {
      const minimalData = {
        title: 'Minimal FormData Test',
        description: 'Testing minimal FormData request with conditional multer.',
        price: 99.99
      };

      const minimalFormData = new FormData();
      Object.keys(minimalData).forEach(key => {
        minimalFormData.append(key, minimalData[key]);
      });

      const minimalResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        minimalFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...minimalFormData.getHeaders()
          },
          timeout: 30000
        }
      );

      if (minimalResponse.data.success) {
        log('✅ Minimal FormData request successful', 'green');
        log(`   Project ID: ${minimalResponse.data.data._id}`, 'green');
      }
    } catch (minimalError) {
      log('❌ Minimal FormData request failed', 'red');
      log(`   Status: ${minimalError.response?.status}`, 'red');
      log(`   Error: ${minimalError.response?.data?.message || minimalError.message}`, 'red');
    }

    log('\n📊 Test Results Summary:', 'cyan');
    log('═'.repeat(50), 'cyan');
    log('If FormData requests now work:', 'yellow');
    log('✅ The conditional multer middleware fix is working', 'green');
    log('✅ Both JSON and FormData requests are supported', 'green');
    log('✅ The 500 error should be resolved', 'green');
    log('', 'reset');
    log('If FormData requests still fail with 500:', 'yellow');
    log('⚠️ The fix needs to be deployed to the server', 'yellow');
    log('⚠️ Or there may be additional issues to address', 'yellow');

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run the test
testConditionalMulterFix();
