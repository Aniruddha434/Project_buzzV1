import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/wallet/balance - Get user's wallet balance
router.get('/balance',
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Find or create wallet for user
      let wallet = await Wallet.findByUser(userId);
      if (!wallet) {
        wallet = await Wallet.createForUser(userId);
      }
      
      res.json({
        success: true,
        data: {
          balance: wallet.getBalanceInRupees(),
          balanceInPaise: wallet.balance,
          totalEarned: wallet.totalEarned / 100,
          totalWithdrawn: wallet.totalWithdrawn / 100,
          availableBalance: wallet.availableBalance / 100,
          status: wallet.status,
          lastTransactionAt: wallet.lastTransactionAt
        }
      });
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wallet balance'
      });
    }
  }
);

// GET /api/wallet/transactions - Get wallet transaction history
router.get('/transactions',
  verifyToken,
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be non-negative'),
  query('type').optional().isIn(['credit', 'debit']).withMessage('Type must be credit or debit'),
  query('category').optional().isIn(['sale', 'payout', 'refund', 'adjustment', 'bonus', 'penalty']),
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
        type = null,
        category = null,
        startDate = null,
        endDate = null
      } = req.query;

      // Find user's wallet
      const wallet = await Wallet.findByUser(userId);
      if (!wallet) {
        return res.json({
          success: true,
          data: {
            transactions: [],
            total: 0,
            hasMore: false
          }
        });
      }

      // Get transactions
      const transactions = await Transaction.getWalletTransactions(wallet._id, {
        limit: parseInt(limit),
        skip: parseInt(skip),
        type,
        category,
        startDate,
        endDate
      });

      // Get total count for pagination
      const totalQuery = { wallet: wallet._id };
      if (type) totalQuery.type = type;
      if (category) totalQuery.category = category;
      if (startDate || endDate) {
        totalQuery.createdAt = {};
        if (startDate) totalQuery.createdAt.$gte = new Date(startDate);
        if (endDate) totalQuery.createdAt.$lte = new Date(endDate);
      }
      
      const total = await Transaction.countDocuments(totalQuery);

      res.json({
        success: true,
        data: {
          transactions,
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
      console.error('Error fetching wallet transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wallet transactions'
      });
    }
  }
);

// PUT /api/wallet/bank-details - Update bank details
router.put('/bank-details',
  verifyToken,
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
      const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;

      // Find or create wallet
      let wallet = await Wallet.findByUser(userId);
      if (!wallet) {
        wallet = await Wallet.createForUser(userId);
      }

      // Update bank details
      wallet.bankDetails = {
        accountNumber,
        ifscCode,
        accountHolderName,
        bankName: bankName || '',
        verified: false, // Reset verification when details change
        verifiedAt: null
      };

      await wallet.save();

      res.json({
        success: true,
        message: 'Bank details updated successfully',
        data: {
          bankDetails: wallet.bankDetails
        }
      });
    } catch (error) {
      console.error('Error updating bank details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bank details'
      });
    }
  }
);

// GET /api/wallet/stats - Get wallet statistics
router.get('/stats',
  verifyToken,
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      // Find wallet
      const wallet = await Wallet.findByUser(userId);
      if (!wallet) {
        return res.json({
          success: true,
          data: {
            totalEarnings: 0,
            totalWithdrawals: 0,
            currentBalance: 0,
            availableBalance: 0,
            transactionCount: 0,
            lastTransactionAt: null
          }
        });
      }

      // Get transaction statistics
      const transactionStats = await Transaction.aggregate([
        { $match: { wallet: wallet._id } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalCredits: {
              $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] }
            },
            totalDebits: {
              $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] }
            },
            creditCount: {
              $sum: { $cond: [{ $eq: ['$type', 'credit'] }, 1, 0] }
            },
            debitCount: {
              $sum: { $cond: [{ $eq: ['$type', 'debit'] }, 1, 0] }
            }
          }
        }
      ]);

      const stats = transactionStats[0] || {
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        creditCount: 0,
        debitCount: 0
      };

      res.json({
        success: true,
        data: {
          totalEarnings: stats.totalCredits / 100,
          totalWithdrawals: stats.totalDebits / 100,
          currentBalance: wallet.getBalanceInRupees(),
          availableBalance: wallet.availableBalance / 100,
          transactionCount: stats.totalTransactions,
          creditCount: stats.creditCount,
          debitCount: stats.debitCount,
          lastTransactionAt: wallet.lastTransactionAt,
          status: wallet.status
        }
      });
    } catch (error) {
      console.error('Error fetching wallet stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wallet statistics'
      });
    }
  }
);

export default router;
