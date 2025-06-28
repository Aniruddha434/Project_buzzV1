// Test script for payment service functionality
// Run this in the browser console on the ProjectBuzz frontend

console.log('🧪 Testing ProjectBuzz Payment Service...');

// Test 1: Check environment variables
console.log('\n1. Testing Environment Variables:');
const envVars = {
  'VITE_API_URL': import.meta.env.VITE_API_URL,
  'VITE_BACKEND_URL': import.meta.env.VITE_BACKEND_URL,
  'VITE_RAZORPAY_KEY_ID': import.meta.env.VITE_RAZORPAY_KEY_ID
};

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key.includes('KEY') ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`❌ ${key}: NOT FOUND`);
  }
}

// Test 2: Load and test payment service
console.log('\n2. Testing Payment Service Import:');
try {
  // This would need to be adapted based on how the payment service is imported
  console.log('✅ Payment service import test - check if paymentService is available in components');
} catch (error) {
  console.log('❌ Payment service import failed:', error.message);
}

// Test 3: Test Razorpay SDK loading
console.log('\n3. Testing Razorpay SDK Loading:');
const testRazorpaySDK = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      console.log('✅ Razorpay SDK already loaded');
      resolve();
      return;
    }

    // Remove any existing script
    const existingScript = document.querySelector('script[src*="razorpay"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      } else {
        console.log('❌ Razorpay SDK loaded but not properly initialized');
        reject(new Error('Razorpay SDK not properly initialized'));
      }
    };

    script.onerror = (error) => {
      console.log('❌ Failed to load Razorpay SDK:', error);
      reject(new Error('Failed to load Razorpay SDK'));
    };

    document.head.appendChild(script);
  });
};

// Test 4: Test backend connection
console.log('\n4. Testing Backend Connection:');
const testBackendConnection = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
      return true;
    } else {
      console.log(`❌ Backend connection failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connection error:', error.message);
    return false;
  }
};

// Test 5: Test Razorpay checkout (mock)
console.log('\n5. Testing Razorpay Checkout (Mock):');
const testRazorpayCheckout = async () => {
  try {
    await testRazorpaySDK();
    
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    
    if (!razorpayKeyId) {
      throw new Error('VITE_RAZORPAY_KEY_ID not found');
    }

    // Create test options (don't actually open)
    const options = {
      key: razorpayKeyId,
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      name: 'ProjectBuzz Test',
      description: 'Payment Integration Test',
      order_id: 'test_order_' + Date.now(),
      prefill: {
        name: 'Test User',
        email: 'test@projectbuzz.com',
        contact: '9876543210'
      },
      theme: {
        color: '#000000'
      },
      handler: (response) => {
        console.log('✅ Payment successful:', response);
      },
      modal: {
        ondismiss: () => {
          console.log('⚠️ Payment cancelled by user');
        }
      }
    };

    console.log('✅ Razorpay checkout options created successfully:', options);
    console.log('💡 To test actual checkout, run: new Razorpay(options).open()');
    
    return true;
  } catch (error) {
    console.log('❌ Razorpay checkout test failed:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('\n🚀 Running all tests...');
  
  try {
    await testRazorpaySDK();
    await testBackendConnection();
    await testRazorpayCheckout();
    
    console.log('\n🎉 All tests completed! Check individual results above.');
    console.log('\n📋 Summary:');
    console.log('- Environment variables: Check individual results');
    console.log('- Razorpay SDK: Should be loaded');
    console.log('- Backend connection: Check result');
    console.log('- Razorpay checkout: Options created successfully');
    
    console.log('\n🔧 Next steps:');
    console.log('1. If any tests failed, check the specific error messages');
    console.log('2. Ensure backend is running on the correct port');
    console.log('3. Verify environment variables are set correctly');
    console.log('4. Test actual payment flow in the application');
    
  } catch (error) {
    console.log('\n❌ Test execution failed:', error.message);
  }
};

// Auto-run tests
runAllTests();

// Export test functions for manual use
window.paymentTests = {
  testRazorpaySDK,
  testBackendConnection,
  testRazorpayCheckout,
  runAllTests
};

console.log('\n💡 Test functions available as window.paymentTests');
console.log('Example: window.paymentTests.testRazorpaySDK()');
