/**
 * @deprecated This file is deprecated and should not be used for new implementations.
 * ProjectBuzz now uses Razorpay as the primary and only payment gateway.
 * This file is kept for backward compatibility with existing payment records only.
 *
 * For new payment implementations, use backend/config/razorpay.js instead.
 *
 * @see backend/config/razorpay.js
 */

import { Cashfree } from 'cashfree-pg';
import crypto from 'crypto';

// Global Cashfree instance
let cashfreeInstance = null;

// Initialize Cashfree
const initializeCashfree = () => {
  try {
    const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // SANDBOX or PRODUCTION

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.warn('⚠️ Cashfree credentials not found in environment variables');
      return false;
    }

    // Initialize Cashfree instance for v5+ API
    const envMode = environment === 'PRODUCTION' ? Cashfree.PRODUCTION : Cashfree.SANDBOX;
    cashfreeInstance = new Cashfree(envMode, process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

    console.log(`✅ Cashfree initialized in ${environment} mode`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Cashfree:', error);
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

// Verify webhook signature
const verifyWebhookSignature = (rawBody, signature, timestamp) => {
  try {
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const signedPayload = `${rawBody}${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signedPayload)
      .digest('base64');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

// Create payment order
const createPaymentOrder = async (orderData) => {
  try {
    // Check if Cashfree is properly initialized
    if (!cashfreeInstance) {
      console.warn('⚠️ Cashfree not properly configured, using mock response');
      return {
        order_id: `cf_${orderData.orderId}`,
        payment_session_id: `session_${Date.now()}`,
        order_status: 'ACTIVE'
      };
    }

    const request = {
      order_amount: orderData.amount,
      order_currency: orderData.currency || 'INR',
      order_id: orderData.orderId,
      customer_details: {
        customer_id: orderData.customerId,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`
      }
    };

    console.log('Creating Cashfree order with request:', request);

    // Use v5+ API method
    const response = await cashfreeInstance.PGCreateOrder("2023-08-01", request);

    if (response && response.data) {
      console.log('✅ Cashfree order created successfully:', response.data.order_id);
      return response.data;
    } else {
      throw new Error('Invalid response from Cashfree API');
    }
  } catch (error) {
    console.error('❌ Error creating Cashfree order:', error);

    // If API call fails, provide mock response for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Falling back to mock response for development');
      return {
        order_id: `cf_${orderData.orderId}`,
        payment_session_id: `session_${Date.now()}`,
        order_status: 'ACTIVE'
      };
    }

    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

// Get order status
const getOrderStatus = async (cfOrderId) => {
  try {
    // Check if Cashfree is properly initialized
    if (!cashfreeInstance) {
      console.warn('⚠️ Cashfree not properly configured, using mock response');
      return {
        order_status: 'ACTIVE',
        cf_order_id: cfOrderId
      };
    }

    console.log('Fetching Cashfree order status for:', cfOrderId);

    // Use v5+ API method
    const response = await cashfreeInstance.PGFetchOrder("2023-08-01", cfOrderId);

    if (response && response.data) {
      console.log('✅ Order status fetched successfully:', response.data.order_status);
      return response.data;
    } else {
      throw new Error('Invalid response from Cashfree API');
    }
  } catch (error) {
    console.error('❌ Error fetching order status:', error);

    // If API call fails, provide mock response for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Falling back to mock response for development');
      return {
        order_status: 'ACTIVE',
        cf_order_id: cfOrderId
      };
    }

    throw new Error(`Failed to fetch order status: ${error.message}`);
  }
};

// Get payment details
const getPaymentDetails = async (cfOrderId) => {
  try {
    console.log('Getting payment details (mock):', cfOrderId);
    // Temporary mock response
    return [{
      cf_payment_id: `payment_${Date.now()}`,
      payment_status: 'SUCCESS'
    }];
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error(`Failed to fetch payment details: ${error.message}`);
  }
};

// Create refund
const createRefund = async (cfOrderId, refundData) => {
  try {
    console.log('Creating refund (mock):', cfOrderId, refundData);
    // Temporary mock response
    return {
      cf_refund_id: `refund_${Date.now()}`,
      refund_status: 'SUCCESS'
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
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

// Format amount for Cashfree (should be in paisa for INR)
const formatAmount = (amount, currency = 'INR') => {
  if (currency === 'INR') {
    return Math.round(amount * 100) / 100; // Ensure 2 decimal places
  }
  return amount;
};

export {
  initializeCashfree,
  generateOrderId,
  generateCustomerId,
  verifyWebhookSignature,
  createPaymentOrder,
  getOrderStatus,
  getPaymentDetails,
  createRefund,
  validatePaymentAmount,
  formatAmount
};
