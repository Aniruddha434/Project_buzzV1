import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Wallet from '../models/Wallet.js';
import Payout from '../models/Payout.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';
// Note: Payout functionality will be implemented with Cashfree in future
// For now, we'll handle payouts manually through admin approval

const router = express.Router();

// POST /api/payouts/request - Request a payout
router.post('/request',
  verifyToken,
  requireRole(['seller', 'admin']),
  body('amount').isFloat({ min: 250 }).withMessage('Minimum payout amount is ₹250'),
  body('accountNumber').notEmpty().withMessage('Account number is required'),
  body('ifscCode').notEmpty().withMessage('IFSC code is required'),
  body('accountHolderName').notEmpty().withMessage('Account holder name is required'),
  body('bankName').optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user._id;
      const { amount, accountNumber, ifscCode, accountHolderName, bankName } = req.body;

      // Find user's wallet
      const wallet = await Wallet.findByUser(userId);
      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found'
        });
      }

      // Check if wallet has sufficient balance
      const amountInPaise = Math.round(amount * 100);
      if (!wallet.canWithdraw(amountInPaise)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Available: ₹${wallet.availableBalance / 100}, Requested: ₹${amount}`
        });
      }

      // Check for pending payouts
      const pendingPayout = await Payout.findOne({
        user: userId,
        status: { $in: ['pending', 'approved', 'processing'] }
      });

      if (pendingPayout) {
        return res.status(400).json({
          success: false,
          message: 'You have a pending payout request. Please wait for it to be processed.'
        });
      }

      // Create payout request
      const payoutId = Payout.generatePayoutId();
      const payout = new Payout({
        payoutId,
        user: userId,
        wallet: wallet._id,
        amount: amountInPaise,
        netAmount: amountInPaise, // No fees for now
        bankDetails: {
          accountNumber,
          ifscCode,
          accountHolderName,
          bankName: bankName || ''
        },
        metadata: {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          source: 'web'
        }
      });

      await payout.save();

      // Send notification to admins
      try {
        await notificationService.notifyPayoutRequest(userId, payout._id, amount);
      } catch (notificationError) {
        console.error('Failed to send payout request notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Payout request submitted successfully',
        data: {
          payoutId: payout.payoutId,
          amount: payout.getAmountInRupees(),
          status: payout.status,
          requestedAt: payout.requestedAt
        }
      });
    } catch (error) {
      console.error('Error creating payout request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payout request'
      });
    }
  }
);

// GET /api/payouts/requests - Get user's payout requests
router.get('/requests',
  verifyToken,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be non-negative'),
  query('status').optional().isIn(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user._id;
      const {
        limit = 20,
        skip = 0,
        status = null,
        startDate = null,
        endDate = null
      } = req.query;

      const payouts = await Payout.getUserPayouts(userId, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        status,
        startDate,
        endDate
      });

      // Get total count
      const query = { user: userId };
      if (status) query.status = status;
      if (startDate || endDate) {
        query.requestedAt = {};
        if (startDate) query.requestedAt.$gte = new Date(startDate);
        if (endDate) query.requestedAt.$lte = new Date(endDate);
      }

      const total = await Payout.countDocuments(query);

      res.json({
        success: true,
        data: {
          payouts,
          total,
          hasMore: (parseInt(skip) + parseInt(limit)) < total,
          pagination: {
            limit: parseInt(limit),
            skip: parseInt(skip),
            total
          }
        }
      });
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payout requests'
      });
    }
  }
);

// GET /api/payouts/stats - Get payout statistics
router.get('/stats',
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const stats = await Payout.getPayoutStats(userId);

      res.json({
        success: true,
        data: {
          totalRequests: stats.totalRequests,
          totalAmount: stats.totalAmount / 100,
          pendingCount: stats.pendingCount,
          approvedCount: stats.approvedCount,
          completedCount: stats.completedCount,
          rejectedCount: stats.rejectedCount,
          completedAmount: stats.completedAmount / 100
        }
      });
    } catch (error) {
      console.error('Error fetching payout stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payout statistics'
      });
    }
  }
);

// Admin routes

// GET /api/payouts/admin/pending - Get pending payouts (Admin only)
router.get('/admin/pending',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const pendingPayouts = await Payout.getPendingPayouts();

      res.json({
        success: true,
        data: {
          payouts: pendingPayouts,
          count: pendingPayouts.length
        }
      });
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pending payouts'
      });
    }
  }
);

// PUT /api/payouts/admin/:payoutId/approve - Approve payout (Admin only)
router.put('/admin/:payoutId/approve',
  verifyToken,
  requireRole(['admin']),
  param('payoutId').notEmpty().withMessage('Payout ID is required'),
  body('comments').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { payoutId } = req.params;
      const { comments = '' } = req.body;
      const adminUserId = req.user._id;

      const payout = await Payout.findOne({ payoutId }).populate('user wallet');
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found'
        });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending payouts can be approved'
        });
      }

      // Check wallet balance before approval
      const wallet = payout.wallet;
      if (wallet.balance < payout.amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient wallet balance for payout'
        });
      }

      // Approve the payout
      await payout.approve(adminUserId, comments);

      // Debit the amount from wallet
      await wallet.debit(
        payout.amount,
        payout.payoutId,
        `Payout withdrawal - ${payout.payoutId}`,
        'payout',
        payout._id
      );

      // Update payout status to processing (ready for bank transfer)
      payout.status = 'processing';
      payout.processedAt = new Date();
      await payout.save();

      console.log(`✅ Payout approved and wallet debited: ₹${(payout.amount / 100).toFixed(2)} for user ${payout.user._id}`);

      // Send notification to user
      try {
        await notificationService.notifyPayoutApproved(payout.user._id, payout._id);
      } catch (notificationError) {
        console.error('Failed to send payout approval notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Payout approved and processed successfully',
        data: {
          payoutId: payout.payoutId,
          status: payout.status,
          approvedAt: payout.approvedAt,
          processedAt: payout.processedAt,
          amountDebited: payout.amount / 100
        }
      });
    } catch (error) {
      console.error('Error approving payout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve payout'
      });
    }
  }
);

// PUT /api/payouts/admin/:payoutId/reject - Reject payout (Admin only)
router.put('/admin/:payoutId/reject',
  verifyToken,
  requireRole(['admin']),
  param('payoutId').notEmpty().withMessage('Payout ID is required'),
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  body('comments').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { payoutId } = req.params;
      const { reason, comments = '' } = req.body;
      const adminUserId = req.user._id;

      const payout = await Payout.findOne({ payoutId }).populate('user');
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found'
        });
      }

      if (payout.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending payouts can be rejected'
        });
      }

      // Reject the payout
      await payout.reject(adminUserId, reason, comments);

      // Send notification to user
      try {
        await notificationService.notifyPayoutRejected(payout.user._id, payout._id, reason);
      } catch (notificationError) {
        console.error('Failed to send payout rejection notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Payout rejected successfully',
        data: {
          payoutId: payout.payoutId,
          status: payout.status,
          rejectionReason: reason
        }
      });
    } catch (error) {
      console.error('Error rejecting payout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject payout'
      });
    }
  }
);

// PUT /api/payouts/admin/:payoutId/complete - Mark payout as completed (Admin only)
router.put('/admin/:payoutId/complete',
  verifyToken,
  requireRole(['admin']),
  param('payoutId').notEmpty().withMessage('Payout ID is required'),
  body('utr').optional().isString().withMessage('UTR must be a string'),
  body('comments').optional().isString(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { payoutId } = req.params;
      const { utr = '', comments = '' } = req.body;

      const payout = await Payout.findOne({ payoutId }).populate('user');
      if (!payout) {
        return res.status(404).json({
          success: false,
          message: 'Payout not found'
        });
      }

      if (payout.status !== 'processing') {
        return res.status(400).json({
          success: false,
          message: 'Only processing payouts can be marked as completed'
        });
      }

      // Mark payout as completed
      await payout.markAsCompleted(utr);

      console.log(`✅ Payout completed: ${payout.payoutId} with UTR: ${utr}`);

      // Send notification to user
      try {
        await notificationService.notifyPayoutCompleted(payout.user._id, payout._id, utr);
      } catch (notificationError) {
        console.error('Failed to send payout completion notification:', notificationError);
      }

      res.json({
        success: true,
        message: 'Payout marked as completed successfully',
        data: {
          payoutId: payout.payoutId,
          status: payout.status,
          completedAt: payout.completedAt,
          utr: utr
        }
      });
    } catch (error) {
      console.error('Error completing payout:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete payout'
      });
    }
  }
);

// GET /api/payouts/admin/all - Get all payouts with filters (Admin only)
router.get('/admin/all',
  verifyToken,
  requireRole(['admin']),
  query('status').optional().isIn(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected']),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be non-negative'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const {
        status = null,
        limit = 50,
        skip = 0,
        startDate = null,
        endDate = null
      } = req.query;

      const query = {};
      if (status) query.status = status;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const payouts = await Payout.find(query)
        .populate('user', 'email displayName')
        .populate('wallet')
        .populate('adminReview.reviewedBy', 'email displayName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Payout.countDocuments(query);

      res.json({
        success: true,
        data: {
          payouts,
          total,
          hasMore: total > parseInt(skip) + payouts.length
        }
      });
    } catch (error) {
      console.error('Error fetching all payouts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payouts'
      });
    }
  }
);

export default router;
