#!/usr/bin/env node

/**
 * Debug script for project creation 500 error
 * Tests the POST /api/projects endpoint to identify the issue
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

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

// First, let's create a test seller account and get a token
async function createTestSellerAndGetToken() {
  try {
    const testSeller = {
      email: `debug-seller-${Date.now()}@test.com`,
      password: 'TestPassword123',
      displayName: 'Debug Seller',
      fullName: 'Debug Test Seller',
      phoneNumber: '+1234567890',
      occupation: 'Developer',
      experienceLevel: 'intermediate',
      yearsOfExperience: 3,
      motivation: 'Testing project creation',
      specializations: ['web-development'],
      sellerTermsAccepted: true
    };

    log('🔐 Creating test seller account...', 'blue');
    
    // Register seller
    const registerResponse = await axios.post(
      `${BACKEND_URL}/api/auth/register-seller`,
      testSeller
    );

    if (registerResponse.data.success) {
      log('✅ Test seller created successfully', 'green');
      return registerResponse.data.data.token;
    } else {
      throw new Error('Failed to create test seller');
    }
  } catch (error) {
    log(`❌ Failed to create test seller: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

async function testProjectCreation() {
  try {
    log('🔍 Debugging Project Creation 500 Error', 'cyan');
    log('=====================================', 'cyan');

    // Step 1: Get authentication token
    const token = await createTestSellerAndGetToken();
    if (!token) {
      log('❌ Cannot proceed without authentication token', 'red');
      return;
    }

    log(`🔑 Got authentication token: ${token.substring(0, 20)}...`, 'green');

    // Step 2: Test basic project creation without files
    log('\n📝 Step 1: Testing basic project creation (no files)...', 'blue');
    
    const basicProjectData = {
      title: 'Debug Test Project',
      description: 'This is a test project to debug the 500 error issue. It contains detailed information about the project.',
      price: 99.99,
      category: 'web',
      githubRepo: 'https://github.com/test/debug-project',
      tags: JSON.stringify(['react', 'nodejs', 'test']),
      completionStatus: 100,
      'projectDetails.timeline': '2 weeks',
      'projectDetails.techStack': 'React, Node.js, MongoDB',
      'projectDetails.complexityLevel': 'intermediate',
      'projectDetails.installationInstructions': 'npm install && npm start',
      'projectDetails.usageInstructions': 'Follow the README file',
      'projectDetails.prerequisites': 'Node.js 18+, npm'
    };

    try {
      const basicResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        basicProjectData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (basicResponse.data.success) {
        log('✅ Basic project creation successful!', 'green');
        log(`📋 Project ID: ${basicResponse.data.data._id}`, 'green');
      }

    } catch (basicError) {
      log('❌ Basic project creation failed', 'red');
      log(`📋 Status: ${basicError.response?.status}`, 'red');
      log(`📋 Error: ${basicError.response?.data?.message || basicError.message}`, 'red');
      
      if (basicError.response?.data?.errors) {
        log('📋 Validation errors:', 'yellow');
        basicError.response.data.errors.forEach(err => {
          log(`   - ${err.path}: ${err.msg}`, 'yellow');
        });
      }

      // Log full error details for debugging
      if (basicError.response?.status === 500) {
        log('\n🔍 500 Error Details:', 'red');
        log(`Full response: ${JSON.stringify(basicError.response.data, null, 2)}`, 'red');
      }
    }

    // Step 3: Test with FormData (simulating file upload)
    log('\n📝 Step 2: Testing with FormData (simulating frontend)...', 'blue');

    const formData = new FormData();
    formData.append('title', 'Debug Test Project FormData');
    formData.append('description', 'This is a test project using FormData to debug the 500 error issue.');
    formData.append('price', '149.99');
    formData.append('category', 'web');
    formData.append('tags', JSON.stringify(['react', 'formdata', 'test']));
    formData.append('completionStatus', '100');
    formData.append('githubRepo', 'https://github.com/test/debug-project');
    formData.append('projectDetails.timeline', '3 weeks');
    formData.append('projectDetails.techStack', 'React, Express, MongoDB');
    formData.append('projectDetails.complexityLevel', 'intermediate');
    formData.append('projectDetails.installationInstructions', 'npm install && npm start');
    formData.append('projectDetails.usageInstructions', 'Follow the README');
    formData.append('projectDetails.prerequisites', 'Node.js 18+');
    formData.append('zipDescription', 'Complete project source code');

    try {
      const formDataResponse = await axios.post(
        `${BACKEND_URL}/api/projects`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            ...formData.getHeaders()
          }
        }
      );

      if (formDataResponse.data.success) {
        log('✅ FormData project creation successful!', 'green');
        log(`📋 Project ID: ${formDataResponse.data.data._id}`, 'green');
      }

    } catch (formDataError) {
      log('❌ FormData project creation failed', 'red');
      log(`📋 Status: ${formDataError.response?.status}`, 'red');
      log(`📋 Error: ${formDataError.response?.data?.message || formDataError.message}`, 'red');
      
      if (formDataError.response?.data?.errors) {
        log('📋 Validation errors:', 'yellow');
        formDataError.response.data.errors.forEach(err => {
          log(`   - ${err.path}: ${err.msg}`, 'yellow');
        });
      }

      // Log full error details for debugging
      if (formDataError.response?.status === 500) {
        log('\n🔍 500 Error Details:', 'red');
        log(`Full response: ${JSON.stringify(formDataError.response.data, null, 2)}`, 'red');
      }
    }

    // Step 4: Test authentication
    log('\n🔐 Step 3: Testing authentication...', 'blue');
    
    try {
      const authTestResponse = await axios.get(
        `${BACKEND_URL}/api/projects`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      log('✅ Authentication working - can access projects endpoint', 'green');

    } catch (authError) {
      log('❌ Authentication issue detected', 'red');
      log(`📋 Status: ${authError.response?.status}`, 'red');
      log(`📋 Error: ${authError.response?.data?.message || authError.message}`, 'red');
    }

    log('\n📊 Debug Summary:', 'cyan');
    log('- Check if basic JSON project creation works', 'yellow');
    log('- Check if FormData project creation works', 'yellow');
    log('- Check if authentication is working', 'yellow');
    log('- Look for specific validation or server errors', 'yellow');

  } catch (error) {
    log(`❌ Debug test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`📋 Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run the debug test
testProjectCreation();
