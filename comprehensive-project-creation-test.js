#!/usr/bin/env node

/**
 * Comprehensive Project Creation Test
 * Systematically tests different scenarios to isolate the 500 error cause
 */

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Create a test seller and get token
async function createTestSeller() {
  const testSeller = {
    email: `comprehensive-test-${Date.now()}@test.com`,
    password: 'TestPassword123',
    displayName: 'Comprehensive Test Seller',
    fullName: 'Comprehensive Test Seller Full',
    phoneNumber: '+1234567890',
    occupation: 'Developer',
    experienceLevel: 'intermediate',
    yearsOfExperience: 3,
    motivation: 'Testing comprehensive project creation',
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

// Test scenarios
const testScenarios = [
  {
    name: 'Minimal Required Fields Only',
    data: {
      title: 'Minimal Test Project',
      description: 'This is a minimal test project with only required fields.',
      price: 99.99
    }
  },
  {
    name: 'Basic Project with Category',
    data: {
      title: 'Basic Test Project',
      description: 'This is a basic test project with category and tags.',
      price: 149.99,
      category: 'web',
      tags: JSON.stringify(['test', 'basic'])
    }
  },
  {
    name: 'Project with GitHub Repo',
    data: {
      title: 'GitHub Test Project',
      description: 'This is a test project with GitHub repository URL.',
      price: 199.99,
      category: 'web',
      githubRepo: 'https://github.com/test/github-project',
      tags: JSON.stringify(['test', 'github'])
    }
  },
  {
    name: 'Project with All Basic Fields',
    data: {
      title: 'Complete Basic Project',
      description: 'This is a complete basic project with all standard fields.',
      price: 249.99,
      category: 'web',
      githubRepo: 'https://github.com/test/complete-basic',
      demoUrl: 'https://demo.example.com',
      tags: JSON.stringify(['test', 'complete', 'basic']),
      completionStatus: 100
    }
  },
  {
    name: 'Project with ProjectDetails Fields',
    data: {
      title: 'ProjectDetails Test Project',
      description: 'This is a test project with projectDetails fields.',
      price: 299.99,
      category: 'web',
      githubRepo: 'https://github.com/test/project-details',
      tags: JSON.stringify(['test', 'details']),
      completionStatus: 100,
      'projectDetails.timeline': '2 weeks',
      'projectDetails.techStack': 'React, Node.js, MongoDB',
      'projectDetails.complexityLevel': 'intermediate',
      'projectDetails.installationInstructions': 'npm install && npm start',
      'projectDetails.usageInstructions': 'Follow the README file',
      'projectDetails.prerequisites': 'Node.js 18+, npm'
    }
  }
];

async function testProjectCreation() {
  try {
    log('🔬 Comprehensive Project Creation Test', 'cyan');
    log('====================================', 'cyan');

    // Step 1: Create test seller
    log('\n🔐 Creating test seller account...', 'blue');
    const token = await createTestSeller();
    if (!token) {
      log('❌ Cannot proceed without authentication token', 'red');
      return;
    }
    log('✅ Test seller created successfully', 'green');

    // Step 2: Test each scenario
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      log(`\n📝 Test ${i + 1}: ${scenario.name}`, 'blue');
      log('─'.repeat(50), 'blue');

      try {
        // Test with JSON content-type
        log('  Testing with JSON content-type...', 'yellow');
        const jsonResponse = await axios.post(
          `${BACKEND_URL}/api/projects`,
          scenario.data,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        if (jsonResponse.data.success) {
          log(`  ✅ JSON request successful - Project ID: ${jsonResponse.data.data._id}`, 'green');
        }

      } catch (jsonError) {
        log(`  ❌ JSON request failed`, 'red');
        log(`     Status: ${jsonError.response?.status || 'No response'}`, 'red');
        log(`     Error: ${jsonError.response?.data?.message || jsonError.message}`, 'red');
        
        if (jsonError.response?.data?.errors) {
          log('     Validation errors:', 'yellow');
          jsonError.response.data.errors.forEach(err => {
            log(`       - ${err.path}: ${err.msg}`, 'yellow');
          });
        }

        // If it's a 500 error, log more details
        if (jsonError.response?.status === 500) {
          log('     🔍 500 Error Details:', 'red');
          log(`     Full response: ${JSON.stringify(jsonError.response.data, null, 2)}`, 'red');
        }
      }

      // Test with FormData
      log('  Testing with FormData...', 'yellow');
      try {
        const formData = new FormData();
        Object.keys(scenario.data).forEach(key => {
          formData.append(key, scenario.data[key]);
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
          log(`  ✅ FormData request successful - Project ID: ${formResponse.data.data._id}`, 'green');
        }

      } catch (formError) {
        log(`  ❌ FormData request failed`, 'red');
        log(`     Status: ${formError.response?.status || 'No response'}`, 'red');
        log(`     Error: ${formError.response?.data?.message || formError.message}`, 'red');
        
        if (formError.response?.data?.errors) {
          log('     Validation errors:', 'yellow');
          formError.response.data.errors.forEach(err => {
            log(`       - ${err.path}: ${err.msg}`, 'yellow');
          });
        }

        // If it's a 500 error, log more details
        if (formError.response?.status === 500) {
          log('     🔍 500 Error Details:', 'red');
          log(`     Full response: ${JSON.stringify(formError.response.data, null, 2)}`, 'red');
        }
      }
    }

    // Step 3: Test authentication and basic connectivity
    log('\n🔍 Testing authentication and connectivity...', 'blue');
    try {
      const authTest = await axios.get(
        `${BACKEND_URL}/api/projects`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      log('✅ Authentication and connectivity working', 'green');
    } catch (authError) {
      log('❌ Authentication or connectivity issue', 'red');
      log(`   Status: ${authError.response?.status || 'No response'}`, 'red');
      log(`   Error: ${authError.response?.data?.message || authError.message}`, 'red');
    }

    // Step 4: Test server health
    log('\n🏥 Testing server health...', 'blue');
    try {
      const healthTest = await axios.get(`${BACKEND_URL}`, { timeout: 10000 });
      log('✅ Server health check passed', 'green');
    } catch (healthError) {
      log('❌ Server health check failed', 'red');
      log(`   Error: ${healthError.message}`, 'red');
    }

    log('\n📊 Test Summary:', 'cyan');
    log('═'.repeat(50), 'cyan');
    log('If all tests fail with 500 errors, possible causes:', 'yellow');
    log('1. Database connection issues', 'yellow');
    log('2. Model validation problems', 'yellow');
    log('3. Missing required environment variables', 'yellow');
    log('4. File system permission issues', 'yellow');
    log('5. Memory or resource constraints', 'yellow');
    log('6. Middleware configuration problems', 'yellow');

  } catch (error) {
    log(`❌ Test setup failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run the comprehensive test
testProjectCreation();
