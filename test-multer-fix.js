import axios from 'axios';
import FormData from 'form-data';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

console.log('🔧 Testing Multer Error Handling Fix');
console.log('===================================');

// Create test seller
const testSeller = {
  email: `multer-fix-test-${Date.now()}@test.com`,
  password: 'TestPassword123',
  displayName: 'Multer Fix Test Seller',
  fullName: 'Multer Fix Test Seller Full',
  phoneNumber: '+1234567890',
  occupation: 'Developer',
  experienceLevel: 'intermediate',
  yearsOfExperience: 3,
  motivation: 'Testing multer error handling fix',
  specializations: ['web-development'],
  sellerTermsAccepted: true
};

console.log('\n🔐 Creating test seller...');
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
  // Test 1: JSON request (should work as before)
  console.log('\n📝 Test 1: JSON request...');
  try {
    const jsonProject = {
      title: 'JSON Test Project',
      description: 'Testing JSON request after multer fix.',
      price: 99.99
    };

    const jsonResponse = await axios.post(
      `${BACKEND_URL}/api/projects`,
      jsonProject,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (jsonResponse.data.success) {
      console.log('✅ JSON request successful');
      console.log(`   Project ID: ${jsonResponse.data.data._id}`);
    }
  } catch (jsonError) {
    console.log('❌ JSON request failed');
    console.log(`   Status: ${jsonError.response?.status}`);
    console.log(`   Error: ${jsonError.response?.data?.message || jsonError.message}`);
  }

  // Test 2: FormData request (should now work with error handling)
  console.log('\n📝 Test 2: FormData request...');
  try {
    const formData = new FormData();
    formData.append('title', 'FormData Test Project');
    formData.append('description', 'Testing FormData request after multer error handling fix.');
    formData.append('price', '149.99');
    formData.append('category', 'web');
    formData.append('tags', JSON.stringify(['test', 'formdata', 'fix']));

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
      console.log('✅ FormData request successful');
      console.log(`   Project ID: ${formResponse.data.data._id}`);
      console.log('🎉 The multer error handling fix is working!');
    }
  } catch (formError) {
    console.log('❌ FormData request still failing');
    console.log(`   Status: ${formError.response?.status || 'No response'}`);
    console.log(`   Error: ${formError.response?.data?.message || formError.message}`);
    
    if (formError.response?.status === 500) {
      console.log('   🔍 Still getting 500 error - fix needs deployment');
    }
  }

  // Test 3: FormData with projectDetails (like frontend sends)
  console.log('\n📝 Test 3: FormData with projectDetails...');
  try {
    const completeFormData = new FormData();
    completeFormData.append('title', 'Complete FormData Test');
    completeFormData.append('description', 'Testing complete FormData with projectDetails.');
    completeFormData.append('price', '199.99');
    completeFormData.append('category', 'web');
    completeFormData.append('tags', JSON.stringify(['test', 'complete']));
    completeFormData.append('projectDetails.timeline', '1 week');
    completeFormData.append('projectDetails.techStack', 'React, Node.js');
    completeFormData.append('projectDetails.complexityLevel', 'intermediate');

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
      console.log('✅ Complete FormData request successful');
      console.log(`   Project ID: ${completeResponse.data.data._id}`);
      console.log('🎉 All FormData requests are now working!');
    }
  } catch (completeError) {
    console.log('❌ Complete FormData request failed');
    console.log(`   Status: ${completeError.response?.status || 'No response'}`);
    console.log(`   Error: ${completeError.response?.data?.message || completeError.message}`);
  }
}

console.log('\n📊 Test Summary:');
console.log('If FormData requests now work:');
console.log('✅ The multer error handling fix resolved the 500 error');
console.log('✅ Projects can be created without file upload issues');
console.log('✅ The seller dashboard should work properly');
console.log('');
console.log('If FormData requests still fail:');
console.log('⚠️ The fix needs to be deployed to the server');
console.log('⚠️ Or additional error handling may be needed');
