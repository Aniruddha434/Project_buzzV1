import axios from 'axios';
import FormData from 'form-data';

const BACKEND_URL = 'https://project-buzzv1-2.onrender.com';

console.log('🔍 Testing FormData Specific Issue');
console.log('==================================');

// Create test seller first
const testSeller = {
  email: `formdata-test-${Date.now()}@test.com`,
  password: 'TestPassword123',
  displayName: 'FormData Test Seller',
  fullName: 'FormData Test Seller Full',
  phoneNumber: '+1234567890',
  occupation: 'Developer',
  experienceLevel: 'intermediate',
  yearsOfExperience: 3,
  motivation: 'Testing FormData issue',
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
  // Test FormData request (like frontend sends)
  console.log('\n📝 Testing FormData request...');
  
  const formData = new FormData();
  formData.append('title', 'FormData Test Project');
  formData.append('description', 'Testing FormData request that causes 500 error.');
  formData.append('price', '199.99');
  formData.append('category', 'web');
  formData.append('tags', JSON.stringify(['test', 'formdata']));
  formData.append('completionStatus', '100');
  formData.append('projectDetails.timeline', '1 week');
  formData.append('projectDetails.techStack', 'React, Node.js');
  formData.append('projectDetails.complexityLevel', 'intermediate');

  try {
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
    }
  } catch (formError) {
    console.log('❌ FormData request failed');
    console.log(`   Status: ${formError.response?.status || 'No response'}`);
    console.log(`   Error: ${formError.response?.data?.message || formError.message}`);
    
    if (formError.response?.data?.errors) {
      console.log('   Validation errors:');
      formError.response.data.errors.forEach(err => {
        console.log(`     - ${err.path}: ${err.msg}`);
      });
    }

    if (formError.response?.status === 500) {
      console.log('   🔍 500 Error - Full response:');
      console.log(`   ${JSON.stringify(formError.response.data, null, 2)}`);
    }
  }

  // Test with minimal FormData
  console.log('\n📝 Testing minimal FormData request...');
  
  const minimalFormData = new FormData();
  minimalFormData.append('title', 'Minimal FormData Test');
  minimalFormData.append('description', 'Testing minimal FormData.');
  minimalFormData.append('price', '99.99');

  try {
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
      console.log('✅ Minimal FormData request successful');
      console.log(`   Project ID: ${minimalResponse.data.data._id}`);
    }
  } catch (minimalError) {
    console.log('❌ Minimal FormData request failed');
    console.log(`   Status: ${minimalError.response?.status || 'No response'}`);
    console.log(`   Error: ${minimalError.response?.data?.message || minimalError.message}`);
    
    if (minimalError.response?.status === 500) {
      console.log('   🔍 500 Error - This confirms FormData is the issue');
      console.log('   🔧 The conditional multer fix may not be deployed yet');
    }
  }
}

console.log('\n📊 FormData Test Complete');
console.log('\nIf FormData requests fail but JSON works:');
console.log('- The conditional multer fix needs to be deployed');
console.log('- Or there\'s still an issue with multer middleware');
console.log('- The frontend should temporarily use JSON for text-only projects');
