// Test script to verify Cashfree integration
import dotenv from 'dotenv';
import { 
  initializeCashfree, 
  createPaymentOrder, 
  getOrderStatus,
  generateOrderId,
  generateCustomerId 
} from './config/cashfree.js';

// Load environment variables
dotenv.config();

async function testCashfreeIntegration() {
  console.log('🧪 Testing Cashfree Integration...\n');

  try {
    // Test 1: Initialize Cashfree
    console.log('1. Testing Cashfree initialization...');
    const initialized = initializeCashfree();
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
      customerName: 'Test User'
    };

    const cashfreeOrder = await createPaymentOrder(orderData);
    console.log('   Cashfree Order Response:');
    console.log(`   - Order ID: ${cashfreeOrder.order_id}`);
    console.log(`   - Session ID: ${cashfreeOrder.payment_session_id}`);
    console.log(`   - Status: ${cashfreeOrder.order_status}\n`);

    // Test 4: Get order status
    console.log('4. Testing order status retrieval...');
    const orderStatus = await getOrderStatus(cashfreeOrder.order_id);
    console.log('   Order Status Response:');
    console.log(`   - Order ID: ${orderStatus.cf_order_id || orderStatus.order_id}`);
    console.log(`   - Status: ${orderStatus.order_status}\n`);

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testCashfreeIntegration();
