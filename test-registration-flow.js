/**
 * Test script to verify registration and login flow
 * Run with: node test-registration-flow.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

console.log('🧪 Testing ProjectBuzz Registration & Login Flow');
console.log('================================================');

async function testRegistrationFlow() {
  try {
    console.log('\n1️⃣ Testing Buyer Registration with Password...');
    
    // Test registration with OTP
    const registrationResponse = await axios.post(`${BASE_URL}/auth/register-with-otp`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      displayName: TEST_NAME,
      role: 'buyer'
    });

    if (registrationResponse.data.success) {
      console.log('✅ Registration initiated successfully');
      console.log('📧 OTP sent to:', TEST_EMAIL);
      console.log('🆔 User ID:', registrationResponse.data.userId);
      
      // In a real test, you would verify OTP here
      console.log('\n⚠️  OTP verification step skipped for automated test');
      
    } else {
      console.log('❌ Registration failed:', registrationResponse.data.message);
      return false;
    }

  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('✅ Registration validation working - user already exists');
    } else {
      console.log('❌ Registration error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  return true;
}

async function testLoginFlow() {
  try {
    console.log('\n2️⃣ Testing Login Flow...');
    
    // Test login with email and password
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('👤 User:', loginResponse.data.data.user.email);
      console.log('🎭 Role:', loginResponse.data.data.user.role);
      console.log('🔑 Token received:', !!loginResponse.data.data.token);
      return true;
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
      return false;
    }

  } catch (error) {
    console.log('❌ Login error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testPasswordValidation() {
  try {
    console.log('\n3️⃣ Testing Password Validation...');
    
    // Test registration with weak password
    const weakPasswordResponse = await axios.post(`${BASE_URL}/auth/register-with-otp`, {
      email: `weak-${Date.now()}@example.com`,
      password: '123', // Too short
      displayName: 'Weak Password User',
      role: 'buyer'
    });

    console.log('❌ Weak password should have been rejected');
    return false;

  } catch (error) {
    if (error.response?.data?.message?.includes('6 characters')) {
      console.log('✅ Password validation working - weak password rejected');
      return true;
    } else {
      console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      return false;
    }
  }
}

async function runTests() {
  console.log('🚀 Starting tests...\n');
  
  const results = {
    registration: await testRegistrationFlow(),
    login: await testLoginFlow(),
    validation: await testPasswordValidation()
  };

  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log('Registration Flow:', results.registration ? '✅ PASS' : '❌ FAIL');
  console.log('Login Flow:', results.login ? '✅ PASS' : '❌ FAIL');
  console.log('Password Validation:', results.validation ? '✅ PASS' : '❌ FAIL');

  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  if (allPassed) {
    console.log('\n🎉 Registration and login system is working correctly!');
    console.log('✅ Users can register with email and password');
    console.log('✅ Users can login with their credentials');
    console.log('✅ Password validation is enforced');
  } else {
    console.log('\n⚠️  Some issues detected. Please check the backend server and database connection.');
  }
}

// Run the tests
runTests().catch(console.error);
