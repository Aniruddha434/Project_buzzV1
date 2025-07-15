#!/usr/bin/env node

/**
 * Production CORS Fix Script for ProjectBuzz
 * This script helps identify and fix CORS issues in production
 */

import https from 'https';
import http from 'http';

// Configuration
const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';
const FRONTEND_URLS = [
  'https://project-buzz-v.vercel.app',
  'https://projectbuzz.tech',
  'https://www.projectbuzz.tech'
];

/**
 * Test CORS configuration by making a preflight request
 */
async function testCORS(backendUrl, frontendUrl) {
  return new Promise((resolve) => {
    const url = new URL(`${backendUrl}/api/auth/me`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    };

    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-credentials': res.headers['access-control-allow-credentials'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };

      resolve({
        success: res.statusCode === 200 || res.statusCode === 204,
        statusCode: res.statusCode,
        corsHeaders,
        allowed: corsHeaders['access-control-allow-origin'] === frontendUrl || 
                corsHeaders['access-control-allow-origin'] === '*'
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        allowed: false
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        allowed: false
      });
    });

    req.end();
  });
}

/**
 * Test backend health
 */
async function testBackendHealth(backendUrl) {
  return new Promise((resolve) => {
    const url = new URL(backendUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: '/',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            response
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Invalid JSON response',
            statusCode: res.statusCode
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

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

/**
 * Main diagnostic function
 */
async function diagnoseCORSIssues() {
  console.log('🔍 ProjectBuzz Production CORS Diagnostic Tool\n');
  
  // Test backend health
  console.log('1️⃣ Testing backend health...');
  const healthResult = await testBackendHealth(BACKEND_URL);
  
  if (healthResult.success) {
    console.log('✅ Backend is healthy and responding');
    console.log(`   Status: ${healthResult.statusCode}`);
    if (healthResult.response?.message) {
      console.log(`   Message: ${healthResult.response.message}`);
    }
  } else {
    console.log('❌ Backend health check failed');
    console.log(`   Error: ${healthResult.error || 'Unknown error'}`);
    console.log(`   Status: ${healthResult.statusCode || 'No response'}`);
    return;
  }

  console.log('\n2️⃣ Testing CORS configuration...');
  
  // Test CORS for each frontend URL
  for (const frontendUrl of FRONTEND_URLS) {
    console.log(`\n   Testing: ${frontendUrl}`);
    const corsResult = await testCORS(BACKEND_URL, frontendUrl);
    
    if (corsResult.success && corsResult.allowed) {
      console.log('   ✅ CORS is working correctly');
    } else if (corsResult.success && !corsResult.allowed) {
      console.log('   ❌ CORS is blocking this origin');
      console.log(`   📋 Allowed origin: ${corsResult.corsHeaders['access-control-allow-origin'] || 'None'}`);
    } else {
      console.log('   ❌ CORS test failed');
      console.log(`   📋 Error: ${corsResult.error || 'Unknown error'}`);
    }
    
    if (corsResult.corsHeaders) {
      console.log('   📋 CORS Headers:');
      Object.entries(corsResult.corsHeaders).forEach(([key, value]) => {
        if (value) console.log(`      ${key}: ${value}`);
      });
    }
  }

  console.log('\n3️⃣ Recommended Actions:');
  console.log('\n   To fix CORS issues, update your Render environment variables:');
  console.log('\n   🔧 Set CORS_ORIGIN to:');
  console.log(`   ${FRONTEND_URLS.join(',')}`);
  console.log('\n   🔧 Set FRONTEND_URL to:');
  console.log(`   ${FRONTEND_URLS[0]}`);
  
  console.log('\n   📝 Steps to update on Render:');
  console.log('   1. Go to your Render dashboard');
  console.log('   2. Select your ProjectBuzz backend service');
  console.log('   3. Go to Environment tab');
  console.log('   4. Add/Update these variables:');
  console.log(`      CORS_ORIGIN=${FRONTEND_URLS.join(',')}`);
  console.log(`      FRONTEND_URL=${FRONTEND_URLS[0]}`);
  console.log('   5. Deploy the changes');
  
  console.log('\n✨ After updating, run this script again to verify the fix!');
}

// Run the diagnostic
diagnoseCORSIssues().catch(console.error);
