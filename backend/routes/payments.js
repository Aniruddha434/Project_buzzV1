import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import notificationService from '../services/notificationService.js';
import {
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
} from '../config/razorpay.js';

const router = express.Router();

// Initialize Razorpay on module load
initializeRazorpay();

// POST /api/payments/create-order - Create payment order
router.post('/create-order',
  verifyToken,
  requireRole(['buyer']),
  [
    body('projectId').isMongoId().withMessage('Invalid project ID'),
    body('discountCode').optional().isString().withMessage('Discount code must be a string'),
    body('customerPhone').optional().custom((value) => {
      if (value && value.trim() !== '') {
        // Remove any non-digit characters
        const cleanPhone = value.replace(/\D/g, '');

        // Check if it's a valid 10-digit Indian mobile number
        if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
          throw new Error('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
        }
      }
      return true;
    }),
    body('testMode').optional().isBoolean().withMessage('Test mode must be a boolean value')
  ],
  async (req, res) => {
    try {
      console.log('\n🔍 ===== PAYMENT ORDER CREATION REQUEST =====');
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('👤 User:', { id: req.user._id, email: req.user.email, role: req.user.role });
      console.log('📊 Headers:', req.headers['content-type']);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      console.log('✅ Validation passed successfully');

      let { projectId, discountCode, customerPhone, testMode = false } = req.body;
      const user = req.user;

      console.log('📋 Processing payment order:', { projectId, discountCode, customerPhone, testMode });

      // Clean phone number if provided
      if (customerPhone && customerPhone.trim() !== '') {
        customerPhone = customerPhone.replace(/\D/g, '');
      }

      // Validate project
      console.log('🔍 Looking for project:', projectId);
      const project = await Project.findById(projectId);
      if (!project) {
        console.log('❌ Project not found:', projectId);
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      console.log('✅ Project found:', { id: project._id, title: project.title, price: project.price, status: project.status });

      if (project.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Project is not available for purchase'
        });
      }

      // Check if user already purchased this project
      const alreadyPurchased = project.buyers.some(
        buyer => buyer.user.toString() === user._id.toString()
      );

      if (alreadyPurchased) {
        return res.status(400).json({
          success: false,
          message: 'You have already purchased this project'
        });
      }

      // Check for existing pending payment
      console.log(`🔍 Checking for existing payments for user ${user._id} and project ${projectId}`);

      const existingPayment = await Payment.findOne({
        user: user._id,
        project: projectId,
        status: { $in: ['PENDING', 'ACTIVE'] }
      });

      console.log('Existing payment found:', existingPayment ? {
        orderId: existingPayment.orderId,
        status: existingPayment.status,
        createdAt: existingPayment.createdAt,
        expiryTime: existingPayment.expiryTime,
        isExpired: existingPayment.isExpired(),
        razorpayOrderId: existingPayment.razorpayOrderId,
        cashfreeOrderId: existingPayment.cashfreeOrderId
      } : 'None');

      if (existingPayment && !existingPayment.isExpired()) {
        console.log('❌ Blocking payment creation due to existing non-expired payment');
        return res.status(400).json({
          success: false,
          message: 'You already have a pending payment for this project',
          data: {
            orderId: existingPayment.orderId,
            razorpayOrderId: existingPayment.razorpayOrderId || existingPayment.cashfreeOrderId,
            status: existingPayment.status,
            createdAt: existingPayment.createdAt,
            expiryTime: existingPayment.expiryTime,
            isExpired: existingPayment.isExpired()
          }
        });
      }

      // If there's an expired payment, clean it up
      if (existingPayment && existingPayment.isExpired()) {
        console.log('🧹 Found expired payment, marking as EXPIRED');
        existingPayment.status = 'EXPIRED';
        await existingPayment.save();
      }

      // Handle discount code if provided
      let finalPrice = project.price;
      let discountCodeData = null;

      if (discountCode) {
        console.log('🎫 Validating discount code:', discountCode);

        // Import DiscountCode model
        const DiscountCode = (await import('../models/DiscountCode.js')).default;

        const validation = await DiscountCode.validateForPurchase(discountCode, user._id, projectId);

        if (!validation.valid) {
          console.log('❌ Invalid discount code:', validation.error);
          return res.status(400).json({
            success: false,
            message: validation.error
          });
        }

        finalPrice = validation.finalPrice;
        discountCodeData = validation.discountCode;
        console.log('✅ Discount code valid. Final price:', finalPrice);
      }

      // Validate payment amount
      const amount = formatAmount(finalPrice);
      validatePaymentAmount(amount);

      // Generate order details
      const orderId = generateOrderId();
      const customerId = generateCustomerId(user._id);

      // Create Razorpay order
      const orderData = {
        orderId,
        amount,
        currency: 'INR',
        customerId,
        customerPhone: customerPhone || '',
        customerEmail: user.email,
        customerName: user.displayName || user.email.split('@')[0],
        orderMeta: {
          project_id: projectId,
          project_title: project.title,
          user_id: user._id.toString()
        }
      };

      const razorpayOrder = await createPaymentOrder(orderData);

      // Save payment record
      const payment = new Payment({
        orderId,
        razorpayOrderId: razorpayOrder.id,
        user: user._id,
        project: projectId,
        amount,
        currency: 'INR',
        status: 'ACTIVE',
        customerDetails: {
          customerId: orderData.customerId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone
        },
        expiryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        discountCode: discountCodeData ? {
          code: discountCodeData.code,
          discountAmount: discountCodeData.discountAmount,
          originalPrice: project.price,
          finalPrice: finalPrice
        } : undefined,
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip || req.connection.remoteAddress,
          source: 'web',
          hasDiscount: !!discountCodeData
        }
      });

      await payment.save();

      // Debug logging
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
      console.log('Razorpay Key ID:', razorpayKeyId ? `${razorpayKeyId.substring(0, 10)}...` : 'NOT FOUND');

      res.json({
        success: true,
        message: 'Payment order created successfully',
        data: {
          orderId: payment.orderId,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID,
          amount: payment.amount,
          currency: payment.currency,
          customerDetails: payment.customerDetails,
          expiryTime: payment.expiryTime
        }
      });

    } catch (error) {
      console.error('Error creating payment order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create payment order'
      });
    }
  }
);

// POST /api/payments/cancel/:orderId - Cancel payment order
router.post('/cancel/:orderId',
  verifyToken,
  param('orderId').notEmpty().withMessage('Order ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
          errors: errors.array()
        });
      }

      const { orderId } = req.params;
      const user = req.user;

      // Find payment record
      const payment = await Payment.findOne({ orderId, user: user._id });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment order not found'
        });
      }

      // Check if payment can be cancelled
      if (payment.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed payment'
        });
      }

      // Cancel the payment
      payment.status = 'CANCELLED';
      await payment.save();

      console.log('✅ Payment order cancelled:', orderId);

      res.json({
        success: true,
        message: 'Payment order cancelled successfully',
        data: {
          orderId: payment.orderId,
          status: payment.status
        }
      });

    } catch (error) {
      console.error('Error cancelling payment order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel payment order'
      });
    }
  }
);

// GET /api/payments/order/:orderId - Get order status
router.get('/order/:orderId',
  verifyToken,
  param('orderId').notEmpty().withMessage('Order ID is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order ID',
          errors: errors.array()
        });
      }

      const { orderId } = req.params;
      const user = req.user;

      // Find payment record
      const payment = await Payment.findOne({ orderId, user: user._id })
        .populate('project', 'title price');

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment order not found'
        });
      }

      // Get latest status from Razorpay (if razorpayOrderId exists)
      if (payment.razorpayOrderId) {
        try {
          const razorpayOrder = await getOrderStatus(payment.razorpayOrderId);

          // Update local status if different
          if (razorpayOrder.status !== payment.status.toLowerCase()) {
            payment.status = razorpayOrder.status.toUpperCase();
            await payment.save();
          }
        } catch (error) {
          console.error('Error fetching Razorpay order status:', error);
          // Continue with local status if Razorpay API fails
        }
      }

      res.json({
        success: true,
        data: {
          orderId: payment.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          project: payment.project,
          paymentTime: payment.paymentTime,
          expiryTime: payment.expiryTime,
          isExpired: payment.isExpired()
        }
      });

    } catch (error) {
      console.error('Error fetching order status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order status'
      });
    }
  }
);

// POST /api/payments/webhook - Razorpay webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.get('x-razorpay-signature');
    const rawBody = req.body.toString();

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const webhookData = JSON.parse(rawBody);
    const { event, payload } = webhookData;

    console.log('Received Razorpay webhook:', event, payload);

    if (event === 'payment.captured') {
      await handlePaymentSuccess(payload.payment.entity);
    } else if (event === 'payment.failed') {
      await handlePaymentFailed(payload.payment.entity);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

// GET /api/payments/verify/:orderId - Verify payment manually
router.get('/verify/:orderId',
  verifyToken,
  param('orderId').notEmpty().withMessage('Order ID is required'),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const user = req.user;

      const payment = await Payment.findOne({ orderId, user: user._id });
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment order not found'
        });
      }

      // Get payment details from Razorpay
      const razorpayOrder = await getOrderStatus(payment.razorpayOrderId);

      // Update payment status
      payment.status = razorpayOrder.status.toUpperCase();
      payment.webhookReceived = true;
      payment.webhookData = { razorpayOrder };

      if (razorpayOrder.status === 'paid') {
        // If payment is captured, get payment details
        if (payment.razorpayPaymentId) {
          const paymentDetails = await getPaymentDetails(payment.razorpayPaymentId);
          await handlePaymentSuccess(paymentDetails, payment);
        }
      }

      await payment.save();

      res.json({
        success: true,
        data: {
          orderId: payment.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          status: payment.status,
          verified: razorpayOrder.status === 'paid'
        }
      });

    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  }
);

// Middleware to handle malformed JSON requests
const handleMalformedJSON = (req, res, next) => {
  // Check if the request body is a string that should be an object
  if (typeof req.body === 'string' && req.body.startsWith('"order_')) {
    console.log('🔧 Detected malformed JSON request, attempting to fix...');
    console.log('Original body:', req.body);

    // This appears to be just an order ID sent as a string
    // We'll return a helpful error message
    return res.status(400).json({
      success: false,
      message: 'Invalid request format. Expected JSON object with razorpay_order_id, razorpay_payment_id, and razorpay_signature.',
      received: req.body,
      expected: {
        razorpay_order_id: 'string',
        razorpay_payment_id: 'string',
        razorpay_signature: 'string'
      }
    });
  }
  next();
};

// POST /api/payments/verify-payment - Verify Razorpay payment with signature
router.post('/verify-payment',
  verifyToken,
  handleMalformedJSON,
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  async (req, res) => {
    try {
      // Debug logging
      console.log('=== PAYMENT VERIFICATION REQUEST ===');
      console.log('Headers:', req.headers);
      console.log('Body type:', typeof req.body);
      console.log('Body content:', req.body);
      console.log('Raw body:', JSON.stringify(req.body));
      console.log('=====================================');

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      // Verify payment signature
      const isValidSignature = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValidSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      // Find payment by Razorpay order ID
      const payment = await Payment.findByRazorpayOrderId(razorpay_order_id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Verify user owns this payment
      if (payment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to payment'
        });
      }

      // Get payment details from Razorpay
      const paymentDetails = await getPaymentDetails(razorpay_payment_id);

      // Update payment record
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.status = 'PAID';
      payment.paymentTime = new Date();
      payment.paymentDetails = {
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod: paymentDetails.method,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
        cardId: paymentDetails.card_id,
        utr: paymentDetails.acquirer_data?.utr,
        acquirerData: paymentDetails.acquirer_data,
        fee: paymentDetails.fee,
        tax: paymentDetails.tax
      };

      await payment.save();

      // Handle successful payment (credit seller wallet, etc.)
      console.log('🔄 Calling handlePaymentSuccess with payment:', payment.orderId);
      await handlePaymentSuccess(paymentDetails, payment);
      console.log('✅ handlePaymentSuccess completed for payment:', payment.orderId);

      res.json({
        success: true,
        data: {
          orderId: payment.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          status: payment.status,
          verified: true
        }
      });

    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  }
);

// GET /api/payments/user - Get user's payment history
router.get('/user',
  verifyToken,
  async (req, res) => {
    try {
      const user = req.user;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { user: user._id };
      if (status) query.status = status;

      const payments = await Payment.find(query)
        .populate('project', 'title price category')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Payment.countDocuments(query);

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }
  }
);

// Helper function to handle successful payment
async function handlePaymentSuccess(paymentDetails, paymentRecord = null) {
  try {
    // If paymentRecord is not provided, find it by payment ID
    if (!paymentRecord) {
      paymentRecord = await Payment.findByRazorpayPaymentId(paymentDetails.id);
      if (!paymentRecord) {
        console.error('Payment record not found for payment_id:', paymentDetails.id);
        return;
      }
    }

    // Check if this payment has already been fully processed
    if (paymentRecord.status === 'PAID' && paymentRecord.statsUpdated) {
      console.log('Payment already fully processed:', paymentRecord.razorpayPaymentId);
      return;
    }

    // Update payment status if not already updated
    if (paymentRecord.status !== 'PAID') {
      await paymentRecord.markAsPaid({
        razorpayPaymentId: paymentDetails.id,
        paymentMethod: paymentDetails.method,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
        cardId: paymentDetails.card_id,
        utr: paymentDetails.acquirer_data?.utr,
        acquirerData: paymentDetails.acquirer_data,
        fee: paymentDetails.fee,
        tax: paymentDetails.tax
      });
    }

    // Add buyer to project (only if not already added)
    const project = await Project.findById(paymentRecord.project);
    if (project && !paymentRecord.statsUpdated) {
      await project.addBuyer(paymentRecord.user, paymentRecord.razorpayPaymentId);
    }

    // Process stats and wallet updates (only if not already updated for this payment)
    if (paymentRecord.status === 'PAID' && !paymentRecord.statsUpdated) {
      // Update buyer stats
      const user = await User.findById(paymentRecord.user);
      if (user) {
        console.log('📊 Before updateStats - User stats:', user.stats);
        await user.updateStats('purchase', paymentRecord.amount);
        console.log('📊 After updateStats - User stats:', user.stats);

        // Verify the user was saved by fetching again
        const updatedUser = await User.findById(paymentRecord.user);
        console.log('📊 Verified user stats from DB:', updatedUser.stats);
      } else {
        console.error('❌ User not found for stats update:', paymentRecord.user);
      }

      // Credit seller wallet and update seller stats
      if (project) {
        const seller = await User.findById(project.seller);
        if (seller) {
          await seller.updateStats('sale', paymentRecord.amount);

          // Create or get seller wallet
          let wallet = await Wallet.findByUser(seller._id);
          if (!wallet) {
            wallet = await Wallet.createForUser(seller._id);
          }

          // Calculate seller commission (85% of sale amount, 15% platform fee)
          const platformCommissionRate = 0.15; // 15% platform commission
          const sellerCommissionRate = 0.85; // 85% to seller

          const totalAmountInPaise = Math.round(paymentRecord.amount * 100);
          const platformCommissionInPaise = Math.round(totalAmountInPaise * platformCommissionRate);
          const sellerCommissionInPaise = Math.round(totalAmountInPaise * sellerCommissionRate);

          // Credit seller commission to wallet
          await wallet.credit(
            sellerCommissionInPaise,
            paymentRecord.razorpayPaymentId,
            `Sale commission (85%) from project: ${project.title}`,
            'sale',
            paymentRecord._id,
            paymentRecord.project
          );

          // Record platform commission transaction for tracking
          const Transaction = mongoose.model('Transaction');
          await Transaction.create({
            wallet: null, // Platform commission doesn't go to any user wallet
            user: project.seller,
            type: 'platform_commission',
            amount: platformCommissionInPaise,
            description: `Platform commission (15%) from project: ${project.title}`,
            transactionId: paymentRecord.razorpayPaymentId,
            relatedPayment: paymentRecord._id,
            relatedProject: paymentRecord.project,
            category: 'sale',
            status: 'completed',
            metadata: {
              source: 'razorpay',
              commissionRate: platformCommissionRate,
              totalSaleAmount: totalAmountInPaise
            }
          });

          console.log(`✅ Credited ₹${(sellerCommissionInPaise / 100).toFixed(2)} (85%) to seller wallet, Platform commission: ₹${(platformCommissionInPaise / 100).toFixed(2)} (15%)`);
        }
      }

      // Send notifications BEFORE marking as statsUpdated (only if not already sent)
      try {
        console.log('📧 ===== STARTING EMAIL NOTIFICATIONS =====');
        console.log('📧 Payment ID:', paymentRecord._id);
        console.log('📧 User ID:', paymentRecord.user);
        console.log('📧 Project ID:', paymentRecord.project);

        // Notify buyer about successful purchase
        console.log('📧 Sending purchase confirmation...');
        const purchaseResult = await notificationService.notifyPurchaseConfirmation(
          paymentRecord.user,
          paymentRecord.project,
          paymentRecord._id
        );
        console.log('📧 Purchase confirmation result:', purchaseResult ? '✅ Success' : '❌ Failed');

        // Notify buyer about successful payment
        console.log('📧 Sending payment success notification...');
        const paymentResult = await notificationService.notifyPaymentSuccess(
          paymentRecord.user,
          paymentRecord.project,
          paymentRecord._id
        );
        console.log('📧 Payment success result:', paymentResult ? '✅ Success' : '❌ Failed');

        // Notify seller about new sale
        if (project && project.seller) {
          console.log('📧 Sending sale notification to seller...');
          const saleResult = await notificationService.notifySale(
            project.seller,
            paymentRecord.user,
            paymentRecord.project,
            paymentRecord._id
          );
          console.log('📧 Sale notification result:', saleResult ? '✅ Success' : '❌ Failed');
        } else {
          console.log('📧 No seller found for sale notification');
        }

        console.log('✅ ===== EMAIL NOTIFICATIONS COMPLETED =====');
      } catch (notificationError) {
        console.error('❌ Failed to send payment notifications:', notificationError.message);
        // Don't fail the payment process if notifications fail
      }

      // Mark this payment as having stats updated (after notifications are sent)
      paymentRecord.statsUpdated = true;
      await paymentRecord.save();
    } else {
      console.log('📊 Stats and wallet already updated for this payment or payment not in PAID status');
      console.log('📧 Notifications already sent for this payment');
    }

    console.log('Payment processed successfully:', paymentRecord.razorpayPaymentId);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Helper function to handle failed payment
async function handlePaymentFailed(paymentDetails) {
  try {
    const paymentRecord = await Payment.findByRazorpayPaymentId(paymentDetails.id);
    if (!paymentRecord) {
      console.error('Payment record not found for payment_id:', paymentDetails.id);
      return;
    }

    await paymentRecord.markAsFailed(paymentDetails.error_description || 'Payment failed');

    // Send payment failed notification
    try {
      const project = await Project.findById(paymentRecord.project);
      if (project) {
        await notificationService.notifyPaymentFailed(
          paymentRecord.user,
          paymentRecord.project,
          paymentRecord._id
        );
        console.log('✅ Payment failure notification sent');
      }
    } catch (notificationError) {
      console.error('❌ Failed to send payment failure notification:', notificationError.message);
    }

    console.log('Payment marked as failed:', paymentDetails.id);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

export default router;
