// Test script to verify Razorpay integration
import dotenv from 'dotenv';
import { 
  initializeRazorpay, 
  createPaymentOrder, 
  getOrderStatus,
  generateOrderId,
  generateCustomerId 
} from './config/razorpay.js';

// Load environment variables
dotenv.config();

async function testRazorpayIntegration() {
  console.log('🧪 Testing Razorpay Integration...\n');

  try {
    // Test 1: Initialize Razorpay
    console.log('1. Testing Razorpay initialization...');
    const initialized = initializeRazorpay();
    console.log(`   Result: ${initialized ? '✅ Success' : '⚠️ Using mock mode'}\n`);

    // Test 2: Generate IDs
    console.log('2. Testing ID generation...');
    const orderId = generateOrderId();
    const customerId = generateCustomerId('test_user_123');
    console.log(`   Order ID: ${orderId}`);
    console.log(`   Customer ID: ${customerId}\n`);

    // Test 3: Create payment order
    console.log('3. Testing payment order creation...');
    const orderData = {
      orderId,
      amount: 100.00,
      currency: 'INR',
      customerId,
      customerPhone: '9999999999',
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      orderMeta: {
        project_id: 'test_project_123',
        project_title: 'Test Project',
        user_id: 'test_user_123'
      }
    };

    const razorpayOrder = await createPaymentOrder(orderData);
    console.log('   Razorpay Order Response:');
    console.log(`   - Order ID: ${razorpayOrder.id}`);
    console.log(`   - Amount: ${razorpayOrder.amount} paise`);
    console.log(`   - Currency: ${razorpayOrder.currency}`);
    console.log(`   - Status: ${razorpayOrder.status}\n`);

    // Test 4: Get order status
    console.log('4. Testing order status retrieval...');
    const orderStatus = await getOrderStatus(razorpayOrder.id);
    console.log('   Order Status Response:');
    console.log(`   - Order ID: ${orderStatus.id}`);
    console.log(`   - Status: ${orderStatus.status}\n`);

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testRazorpayIntegration();
