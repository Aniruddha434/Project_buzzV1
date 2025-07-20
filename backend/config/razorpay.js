import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Global Razorpay instance
let razorpayInstance = null;

// Initialize Razorpay
const initializeRazorpay = () => {
  try {
    console.log('🔍 Checking Razorpay environment variables...');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 10)}...` : 'NOT FOUND');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? `${process.env.RAZORPAY_KEY_SECRET.substring(0, 10)}...` : 'NOT FOUND');
    console.log('RAZORPAY_ENVIRONMENT:', process.env.RAZORPAY_ENVIRONMENT || 'test');

    // Check if we're in development mode with mock keys
    const isDevelopmentMode = process.env.NODE_ENV === 'development' &&
                             process.env.RAZORPAY_ENVIRONMENT === 'development';

    if (isDevelopmentMode) {
      console.log('🧪 Running in development mode with mock Razorpay');
      console.log('✅ Mock Razorpay initialized - no real API calls will be made');
      return true; // Don't initialize real Razorpay instance
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️ Razorpay credentials not found in environment variables');
      return false;
    }

    // Only initialize real Razorpay for production/test with real keys
    if (process.env.RAZORPAY_KEY_ID.startsWith('rzp_')) {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      console.log(`✅ Razorpay initialized in ${process.env.RAZORPAY_ENVIRONMENT || 'test'} mode`);
    } else {
      console.log('🧪 Mock Razorpay keys detected - using development mode');
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error);
    return false;
  }
};

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${random}`.toUpperCase();
};

// Generate customer ID
const generateCustomerId = (userId) => {
  return `CUST_${userId}_${Date.now()}`;
};

// Create payment order
const createPaymentOrder = async (orderData) => {
  try {
    // Always use mock response in development mode
    const isDevelopmentMode = process.env.NODE_ENV === 'development' &&
                             process.env.RAZORPAY_ENVIRONMENT === 'development';

    if (isDevelopmentMode || !razorpayInstance) {
      console.log('🧪 Using mock Razorpay order for development');
      return {
        id: `order_${orderData.orderId}_mock`,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency || 'INR',
        status: 'created',
        receipt: orderData.orderId,
        notes: orderData.orderMeta || {}
      };
    }

    const options = {
      amount: Math.round(orderData.amount * 100), // Convert to paise
      currency: orderData.currency || 'INR',
      receipt: orderData.orderId,
      notes: {
        project_id: orderData.orderMeta?.project_id,
        project_title: orderData.orderMeta?.project_title,
        user_id: orderData.orderMeta?.user_id,
        customer_id: orderData.customerId,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone
      }
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpayInstance.orders.create(options);

    if (order && order.id) {
      console.log('✅ Razorpay order created successfully:', order.id);
      return order;
    } else {
      throw new Error('Invalid response from Razorpay API');
    }
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);

    // If API call fails, provide mock response for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Falling back to mock response for development');
      return {
        id: `order_${orderData.orderId}`,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        status: 'created'
      };
    }

    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

// Get order status
const getOrderStatus = async (razorpayOrderId) => {
  try {
    // Check if Razorpay is properly initialized
    if (!razorpayInstance) {
      console.warn('⚠️ Razorpay not properly configured, using mock response');
      return {
        id: razorpayOrderId,
        status: 'created'
      };
    }

    console.log('Fetching Razorpay order status for:', razorpayOrderId);

    const order = await razorpayInstance.orders.fetch(razorpayOrderId);

    if (order && order.id) {
      console.log('✅ Order status fetched successfully:', order.status);
      return order;
    } else {
      throw new Error('Invalid response from Razorpay API');
    }
  } catch (error) {
    console.error('❌ Error fetching order status:', error);

    // If API call fails, provide mock response for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Falling back to mock response for development');
      return {
        id: razorpayOrderId,
        status: 'created'
      };
    }

    throw new Error(`Failed to fetch order status: ${error.message}`);
  }
};

// Get payment details
const getPaymentDetails = async (razorpayPaymentId) => {
  try {
    // Check if Razorpay is properly initialized
    if (!razorpayInstance) {
      console.warn('⚠️ Razorpay not properly configured, using mock response');
      return {
        id: razorpayPaymentId,
        status: 'captured',
        method: 'card'
      };
    }

    console.log('Fetching Razorpay payment details for:', razorpayPaymentId);

    const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);

    if (payment && payment.id) {
      console.log('✅ Payment details fetched successfully:', payment.status);
      return payment;
    } else {
      throw new Error('Invalid response from Razorpay API');
    }
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);

    // If API call fails, provide mock response for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Falling back to mock response for development');
      return {
        id: razorpayPaymentId,
        status: 'captured',
        method: 'card'
      };
    }

    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Verify webhook signature
const verifyWebhookSignature = (rawBody, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
      .update(rawBody)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

// Validate payment amount
const validatePaymentAmount = (amount) => {
  const minAmount = 1; // Minimum 1 INR
  const maxAmount = 500000; // Maximum 5 lakh INR

  if (amount < minAmount) {
    throw new Error(`Minimum payment amount is ₹${minAmount}`);
  }

  if (amount > maxAmount) {
    throw new Error(`Maximum payment amount is ₹${maxAmount}`);
  }

  return true;
};

// Format amount for Razorpay (should be in paise for INR)
const formatAmount = (amount, currency = 'INR') => {
  if (currency === 'INR') {
    return Math.round(amount * 100) / 100; // Ensure 2 decimal places
  }
  return amount;
};

export {
  initializeRazorpay,
  generateOrderId,
  generateCustomerId,
  verifyWebhookSignature,
  verifyPaymentSignature,
  createPaymentOrder,
  getOrderStatus,
  getPaymentDetails,
  validatePaymentAmount,
  formatAmount
};
