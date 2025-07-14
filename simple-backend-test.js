import axios from 'axios';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

console.log('🔍 Testing Backend Endpoints');
console.log('============================');

// Test 1: Server health
console.log('\n🏥 Testing server health...');
try {
  const healthResponse = await axios.get(`${BACKEND_URL}`, { timeout: 10000 });
  console.log('✅ Server is responding');
  console.log(`   Response: ${JSON.stringify(healthResponse.data)}`);
} catch (healthError) {
  console.log('❌ Server health check failed');
  console.log(`   Error: ${healthError.message}`);
}

// Test 2: Create test seller
console.log('\n🔐 Creating test seller...');
const testSeller = {
  email: `simple-test-${Date.now()}@test.com`,
  password: 'TestPassword123',
  displayName: 'Simple Test Seller',
  fullName: 'Simple Test Seller Full',
  phoneNumber: '+1234567890',
  occupation: 'Developer',
  experienceLevel: 'intermediate',
  yearsOfExperience: 3,
  motivation: 'Testing simple backend',
  specializations: ['web-development'],
  sellerTermsAccepted: true
};

let token = null;
try {
  const sellerResponse = await axios.post(`${BACKEND_URL}/api/auth/register-seller`, testSeller);
  if (sellerResponse.data.success) {
    token = sellerResponse.data.data.token;
    console.log('✅ Test seller created successfully');
  }
} catch (sellerError) {
  console.log('❌ Failed to create test seller');
  console.log(`   Error: ${sellerError.response?.data?.message || sellerError.message}`);
}

if (token) {
  // Test 3: Test project creation with minimal data
  console.log('\n📝 Testing minimal project creation...');
  const minimalProject = {
    title: 'Simple Test Project',
    description: 'Testing minimal project creation.',
    price: 99.99
  };

  try {
    const projectResponse = await axios.post(
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

    if (projectResponse.data.success) {
      console.log('✅ Project creation successful');
      console.log(`   Project ID: ${projectResponse.data.data._id}`);
    }
  } catch (projectError) {
    console.log('❌ Project creation failed');
    console.log(`   Status: ${projectError.response?.status || 'No response'}`);
    console.log(`   Error: ${projectError.response?.data?.message || projectError.message}`);
    
    if (projectError.response?.status === 500) {
      console.log('   🔍 500 Error - Full response:');
      console.log(`   ${JSON.stringify(projectError.response.data, null, 2)}`);
    }
  }
}

console.log('\n📊 Test Complete');
