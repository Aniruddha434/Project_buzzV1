/**
 * Test Backend Connection
 * Quick script to test if the backend is responding
 */

// Try multiple possible URLs
const POSSIBLE_URLS = [
  'https://projectbuzz-backend.onrender.com',
  'https://projectbuzz-backend-xyz.onrender.com',
  'https://project-buzz-backend.onrender.com',
  'https://buzz-backend.onrender.com'
];

async function testEndpoint(url, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ProjectBuzz-Test/1.0'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`   ✅ Response: ${data.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`   ❌ Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function testBackend() {
  console.log('🚀 Testing ProjectBuzz Backend Connection');
  console.log('=' .repeat(50));
  
  const endpoints = [
    { url: `${BACKEND_URL}`, description: 'Root endpoint' },
    { url: `${BACKEND_URL}/health`, description: 'Health check' },
    { url: `${BACKEND_URL}/api`, description: 'API root' },
    { url: `${BACKEND_URL}/api/health`, description: 'API health check' },
    { url: `${BACKEND_URL}/api/projects`, description: 'Projects endpoint' }
  ];
  
  let workingEndpoints = 0;
  
  for (const endpoint of endpoints) {
    const isWorking = await testEndpoint(endpoint.url, endpoint.description);
    if (isWorking) workingEndpoints++;
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Results: ${workingEndpoints}/${endpoints.length} endpoints working`);
  
  if (workingEndpoints === 0) {
    console.log('❌ Backend is completely down or unreachable');
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check Render dashboard for service status');
    console.log('2. Check Render logs for errors');
    console.log('3. Restart the Render service');
    console.log('4. Verify environment variables in Render');
  } else if (workingEndpoints < endpoints.length) {
    console.log('⚠️  Backend is partially working');
    console.log('Some endpoints may be misconfigured');
  } else {
    console.log('✅ Backend is fully operational!');
  }
}

// Run the test
testBackend().catch(console.error);
