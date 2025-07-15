#!/usr/bin/env node

/**
 * Production Access Test Script for ProjectBuzz
 * Tests all critical API endpoints and functionality
 */

import https from 'https';
import http from 'http';

// Configuration
const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';
const FRONTEND_URL = 'https://project-buzz-v.vercel.app';

/**
 * Make HTTP request
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Origin': FRONTEND_URL,
        'User-Agent': 'ProjectBuzz-Test/1.0',
        ...options.headers
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = data ? JSON.parse(data) : null;
          resolve({
            success: res.statusCode >= 200 && res.statusCode < 300,
            statusCode: res.statusCode,
            headers: res.headers,
            data: response,
            rawData: data
          });
        } catch (error) {
          resolve({
            success: false,
            statusCode: res.statusCode,
            headers: res.headers,
            error: 'Invalid JSON response',
            rawData: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test API endpoints
 */
async function testEndpoints() {
  console.log('🔍 Testing Production API Endpoints\n');

  const tests = [
    {
      name: 'Backend Health Check',
      url: `${BACKEND_URL}/`,
      expected: 'ProjectBuzz Backend API is running'
    },
    {
      name: 'API Health Check',
      url: `${BACKEND_URL}/api`,
      expected: null // May return 404, that's OK
    },
    {
      name: 'Projects Endpoint (Public)',
      url: `${BACKEND_URL}/api/projects`,
      expected: 'projects array'
    },
    {
      name: 'Auth Me Endpoint (Should require auth)',
      url: `${BACKEND_URL}/api/auth/me`,
      expected: 'unauthorized'
    },
    {
      name: 'CORS Preflight Test',
      url: `${BACKEND_URL}/api/projects`,
      method: 'OPTIONS',
      expected: 'CORS headers'
    }
  ];

  for (const test of tests) {
    console.log(`📋 Testing: ${test.name}`);
    console.log(`   URL: ${test.url}`);
    
    const result = await makeRequest(test.url, { method: test.method });
    
    if (result.success) {
      console.log('   ✅ Request successful');
      console.log(`   📊 Status: ${result.statusCode}`);
      
      if (result.data?.message) {
        console.log(`   💬 Message: ${result.data.message}`);
      }
      
      if (test.name.includes('CORS')) {
        console.log('   🌐 CORS Headers:');
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-credentials',
          'access-control-allow-methods',
          'access-control-allow-headers'
        ];
        
        corsHeaders.forEach(header => {
          if (result.headers[header]) {
            console.log(`      ${header}: ${result.headers[header]}`);
          }
        });
      }
      
    } else {
      console.log('   ❌ Request failed');
      console.log(`   📊 Status: ${result.statusCode || 'No response'}`);
      console.log(`   💥 Error: ${result.error || 'Unknown error'}`);
      
      if (result.rawData) {
        console.log(`   📄 Response: ${result.rawData.substring(0, 200)}...`);
      }
    }
    
    console.log('');
  }
}

/**
 * Test authentication flow
 */
async function testAuthFlow() {
  console.log('🔐 Testing Authentication Flow\n');
  
  // Test registration endpoint
  console.log('📋 Testing Registration Endpoint');
  const regResult = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      // This should fail validation, but endpoint should respond
      email: 'test@example.com'
    }
  });
  
  if (regResult.statusCode === 400) {
    console.log('   ✅ Registration endpoint responding (validation error expected)');
  } else if (regResult.success) {
    console.log('   ✅ Registration endpoint accessible');
  } else {
    console.log('   ❌ Registration endpoint failed');
    console.log(`   📊 Status: ${regResult.statusCode}`);
    console.log(`   💥 Error: ${regResult.error}`);
  }
  
  console.log('');
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 ProjectBuzz Production Access Test\n');
  console.log(`🎯 Backend: ${BACKEND_URL}`);
  console.log(`🌐 Frontend: ${FRONTEND_URL}\n`);
  
  await testEndpoints();
  await testAuthFlow();
  
  console.log('✨ Test completed!');
  console.log('\n💡 If you see any failures:');
  console.log('   1. Check your Render deployment logs');
  console.log('   2. Verify environment variables are set correctly');
  console.log('   3. Ensure your backend service is running');
  console.log('   4. Check for any rate limiting or security blocks');
}

// Run the tests
runTests().catch(console.error);
