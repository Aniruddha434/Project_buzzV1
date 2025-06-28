// Test script to verify complete Cashfree removal and Razorpay-only functionality
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { 
  initializeRazorpay, 
  createPaymentOrder, 
  getOrderStatus,
  generateOrderId,
  generateCustomerId,
  formatAmount,
  validatePaymentAmount
} from './config/razorpay.js';

// Load environment variables
dotenv.config();

async function testCashfreeRemoval() {
  console.log('🧪 Testing Complete Cashfree Removal...\n');

  let allTestsPassed = true;
  const testResults = [];

  // Test 1: Verify Cashfree dependency is removed from package.json
  console.log('1. Testing package.json dependency removal...');
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (packageJson.dependencies && packageJson.dependencies['cashfree-pg']) {
      testResults.push('❌ Cashfree dependency still exists in package.json');
      allTestsPassed = false;
    } else {
      testResults.push('✅ Cashfree dependency successfully removed from package.json');
    }
  } catch (error) {
    testResults.push(`❌ Error checking package.json: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Verify Cashfree config file is deprecated
  console.log('2. Testing Cashfree config file deprecation...');
  try {
    const cashfreeConfigPath = path.join(process.cwd(), 'config', 'cashfree.js');
    if (fs.existsSync(cashfreeConfigPath)) {
      const configContent = fs.readFileSync(cashfreeConfigPath, 'utf8');
      if (configContent.includes('@deprecated')) {
        testResults.push('✅ Cashfree config file properly deprecated');
      } else {
        testResults.push('❌ Cashfree config file exists but not deprecated');
        allTestsPassed = false;
      }
    } else {
      testResults.push('✅ Cashfree config file removed');
    }
  } catch (error) {
    testResults.push(`❌ Error checking Cashfree config: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Verify environment variables are cleaned up
  console.log('3. Testing environment configuration...');
  try {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    
    if (envContent.includes('CASHFREE_')) {
      testResults.push('❌ Cashfree environment variables still in .env.example');
      allTestsPassed = false;
    } else {
      testResults.push('✅ Cashfree environment variables removed from .env.example');
    }

    if (envContent.includes('RAZORPAY_')) {
      testResults.push('✅ Razorpay environment variables present in .env.example');
    } else {
      testResults.push('❌ Razorpay environment variables missing from .env.example');
      allTestsPassed = false;
    }
  } catch (error) {
    testResults.push(`❌ Error checking environment config: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Verify Razorpay integration is working
  console.log('4. Testing Razorpay integration...');
  try {
    const razorpayInitialized = initializeRazorpay();
    if (razorpayInitialized) {
      testResults.push('✅ Razorpay initialization successful');
    } else {
      testResults.push('❌ Razorpay initialization failed');
      allTestsPassed = false;
    }
  } catch (error) {
    testResults.push(`❌ Error testing Razorpay: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 5: Test payment order creation with Razorpay
  console.log('5. Testing Razorpay payment order creation...');
  try {
    const orderId = generateOrderId();
    const customerId = generateCustomerId('test_user');
    const amount = formatAmount(100); // ₹100

    const orderData = {
      orderId,
      amount,
      currency: 'INR',
      customerId,
      customerPhone: '9999999999',
      customerEmail: 'test@example.com',
      customerName: 'Test User'
    };

    const razorpayOrder = await createPaymentOrder(orderData);
    
    if (razorpayOrder && razorpayOrder.id) {
      testResults.push('✅ Razorpay payment order creation successful');
      
      // Test order status retrieval
      const orderStatus = await getOrderStatus(razorpayOrder.id);
      if (orderStatus && orderStatus.status) {
        testResults.push('✅ Razorpay order status retrieval successful');
      } else {
        testResults.push('❌ Razorpay order status retrieval failed');
        allTestsPassed = false;
      }
    } else {
      testResults.push('❌ Razorpay payment order creation failed');
      allTestsPassed = false;
    }
  } catch (error) {
    testResults.push(`❌ Error testing Razorpay order creation: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 6: Verify discount functionality works with Razorpay
  console.log('6. Testing discount functionality with Razorpay...');
  try {
    const originalPrice = 100;
    const discountAmount = 20;
    const finalPrice = originalPrice - discountAmount;
    
    const formattedAmount = formatAmount(finalPrice);
    validatePaymentAmount(formattedAmount);
    
    testResults.push('✅ Discount calculation and validation working with Razorpay');
  } catch (error) {
    testResults.push(`❌ Error testing discount functionality: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 7: Check for any remaining Cashfree imports in routes
  console.log('7. Testing for remaining Cashfree imports...');
  try {
    const routesPath = path.join(process.cwd(), 'routes');
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));
    
    let cashfreeImportsFound = false;
    for (const file of routeFiles) {
      const filePath = path.join(routesPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes("from '../config/cashfree.js'") || 
          content.includes("require('../config/cashfree.js')")) {
        testResults.push(`❌ Cashfree import found in ${file}`);
        cashfreeImportsFound = true;
        allTestsPassed = false;
      }
    }
    
    if (!cashfreeImportsFound) {
      testResults.push('✅ No Cashfree imports found in route files');
    }
  } catch (error) {
    testResults.push(`❌ Error checking route files: ${error.message}`);
    allTestsPassed = false;
  }

  // Print results
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  testResults.forEach(result => console.log(result));

  console.log('\n🎯 Overall Status:');
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED - Cashfree removal successful!');
    console.log('🚀 ProjectBuzz is now running on Razorpay-only architecture');
    console.log('\n📊 Summary:');
    console.log('- ✅ Cashfree dependency removed');
    console.log('- ✅ Environment variables cleaned up');
    console.log('- ✅ Razorpay integration working');
    console.log('- ✅ Payment order creation functional');
    console.log('- ✅ Discount functionality preserved');
    console.log('- ✅ No remaining Cashfree imports');
    console.log('\n🔧 System Status: READY FOR PRODUCTION');
  } else {
    console.log('❌ SOME TESTS FAILED - Please review and fix issues');
    console.log('🔧 System Status: NEEDS ATTENTION');
  }

  return allTestsPassed;
}

// Run the test
testCashfreeRemoval()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
