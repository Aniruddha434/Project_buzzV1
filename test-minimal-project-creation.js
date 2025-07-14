#!/usr/bin/env node

/**
 * Minimal project creation test to isolate the 500 error
 */

import axios from 'axios';

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

async function testMinimalProjectCreation() {
  try {
    log('🔬 Minimal Project Creation Test', 'cyan');
    log('===============================', 'cyan');

    // Step 1: Create a test seller
    const testSeller = {
      email: `minimal-seller-${Date.now()}@test.com`,
      password: 'TestPassword123',
      displayName: 'Minimal Seller',
      fullName: 'Minimal Test Seller',
      phoneNumber: '+1234567890',
      occupation: 'Developer',
      experienceLevel: 'intermediate',
      yearsOfExperience: 3,
      motivation: 'Testing minimal project creation',
      specializations: ['web-development'],
      sellerTermsAccepted: true
    };

    log('🔐 Creating test seller...', 'blue');
    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/auth/register-seller`,
      testSeller
    );

    if (!registerResponse.data.success) {
      throw new Error('Failed to create test seller');
    }

    const token = registerResponse.data.data.token;
    log('✅ Test seller created successfully', 'green');

    // Step 2: Test absolute minimal project data
    log('\n📝 Testing absolute minimal project...', 'blue');
    
    const minimalProject = {
      title: 'Minimal Test Project',
      description: 'This is the most minimal project possible to test the API endpoint.',
      price: 1.0
    };

    try {
      const minimalResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        minimalProject,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (minimalResponse.data.success) {
        log('✅ Minimal project creation successful!', 'green');
        log(`📋 Project ID: ${minimalResponse.data.data._id}`, 'green');
      }

    } catch (minimalError) {
      log('❌ Minimal project creation failed', 'red');
      log(`📋 Status: ${minimalError.response?.status}`, 'red');
      log(`📋 Error: ${minimalError.response?.data?.message || minimalError.message}`, 'red');
      
      if (minimalError.response?.data?.errors) {
        log('📋 Validation errors:', 'yellow');
        minimalError.response.data.errors.forEach(err => {
          log(`   - ${err.path}: ${err.msg}`, 'yellow');
        });
      }
    }

    // Step 3: Test with required fields only
    log('\n📝 Testing with all required fields...', 'blue');
    
    const requiredFieldsProject = {
      title: 'Required Fields Test Project',
      description: 'This project includes all required fields based on the model definition.',
      price: 99.99,
      category: 'web',
      tags: ['test', 'minimal'],
      githubRepo: 'https://github.com/test/required-fields-project'
    };

    try {
      const requiredResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        requiredFieldsProject,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (requiredResponse.data.success) {
        log('✅ Required fields project creation successful!', 'green');
        log(`📋 Project ID: ${requiredResponse.data.data._id}`, 'green');
      }

    } catch (requiredError) {
      log('❌ Required fields project creation failed', 'red');
      log(`📋 Status: ${requiredError.response?.status}`, 'red');
      log(`📋 Error: ${requiredError.response?.data?.message || requiredError.message}`, 'red');
      
      if (requiredError.response?.data?.errors) {
        log('📋 Validation errors:', 'yellow');
        requiredError.response.data.errors.forEach(err => {
          log(`   - ${err.path}: ${err.msg}`, 'yellow');
        });
      }
    }

    // Step 4: Test database connection by fetching projects
    log('\n🔍 Testing database connection...', 'blue');
    
    try {
      const projectsResponse = await axios.get(
        `${BACKEND_URL}/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (projectsResponse.data.success) {
        log('✅ Database connection working - can fetch projects', 'green');
        log(`📋 Found ${projectsResponse.data.data.length} projects`, 'green');
      }

    } catch (dbError) {
      log('❌ Database connection issue', 'red');
      log(`📋 Status: ${dbError.response?.status}`, 'red');
      log(`📋 Error: ${dbError.response?.data?.message || dbError.message}`, 'red');
    }

    log('\n📊 Test Summary:', 'cyan');
    log('- Tested minimal project creation', 'yellow');
    log('- Tested required fields project creation', 'yellow');
    log('- Tested database connectivity', 'yellow');
    log('\n💡 If all tests fail with 500 errors, the issue is likely:', 'cyan');
    log('  1. Database connection problem', 'yellow');
    log('  2. Model validation issue', 'yellow');
    log('  3. Server configuration problem', 'yellow');

  } catch (error) {
    log(`❌ Test setup failed: ${error.message}`, 'red');
    if (error.response) {
      log(`📋 Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run the minimal test
testMinimalProjectCreation();
