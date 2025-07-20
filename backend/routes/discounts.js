import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import DiscountCode from '../models/DiscountCode.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// GET /api/discounts/welcome/eligibility - Check if user is eligible for welcome code
router.get('/welcome/eligibility',
  verifyToken,
  requireRole(['buyer']),
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      console.log('🎫 Checking welcome code eligibility for user:', userId);
      
      const eligibility = await DiscountCode.isEligibleForWelcomeCode(userId);
      
      if (eligibility.eligible) {
        // Create welcome code if eligible
        const welcomeCode = await DiscountCode.createWelcomeCode(userId);
        
        res.json({
          success: true,
          eligible: true,
          welcomeCode: welcomeCode ? {
            code: welcomeCode.code,
            discountPercentage: welcomeCode.discountPercentage,
            maxDiscountAmount: welcomeCode.maxDiscountAmount,
            minPurchaseAmount: welcomeCode.minPurchaseAmount,
            expiresAt: welcomeCode.expiresAt,
            isActive: welcomeCode.isActive && !welcomeCode.isUsed
          } : null
        });
      } else {
        res.json({
          success: true,
          eligible: false,
          reason: eligibility.reason,
          message: eligibility.reason === 'already_has_code' 
            ? 'You already have a welcome discount code'
            : eligibility.reason === 'already_purchased'
            ? 'Welcome discount is only available for first-time buyers'
            : 'Not eligible for welcome discount'
        });
      }
      
    } catch (error) {
      console.error('❌ Error checking welcome code eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check welcome code eligibility'
      });
    }
  }
);

// GET /api/discounts/welcome/status - Get current welcome code status
router.get('/welcome/status',
  verifyToken,
  requireRole(['buyer']),
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      console.log('🎫 Getting welcome code status for user:', userId);
      
      const welcomeCode = await DiscountCode.findOne({
        buyer: userId,
        type: 'welcome',
        code: 'WELCOME20'
      });
      
      if (!welcomeCode) {
        return res.json({
          success: true,
          hasWelcomeCode: false,
          message: 'No welcome code found'
        });
      }
      
      const isValid = welcomeCode.isValid();
      const daysUntilExpiry = Math.ceil((welcomeCode.expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      
      res.json({
        success: true,
        hasWelcomeCode: true,
        welcomeCode: {
          code: welcomeCode.code,
          discountPercentage: welcomeCode.discountPercentage,
          maxDiscountAmount: welcomeCode.maxDiscountAmount,
          minPurchaseAmount: welcomeCode.minPurchaseAmount,
          isValid,
          isUsed: welcomeCode.isUsed,
          expiresAt: welcomeCode.expiresAt,
          daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
          usedAt: welcomeCode.usedAt
        }
      });
      
    } catch (error) {
      console.error('❌ Error getting welcome code status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get welcome code status'
      });
    }
  }
);

// POST /api/discounts/validate - Validate any discount code
router.post('/validate',
  verifyToken,
  requireRole(['buyer']),
  async (req, res) => {
    try {
      const { code, projectId } = req.body;
      const userId = req.user._id;
      
      if (!code || !projectId) {
        return res.status(400).json({
          success: false,
          message: 'Discount code and project ID are required'
        });
      }
      
      console.log('🎫 Validating discount code:', code, 'for project:', projectId, 'user:', userId);
      
      const validation = await DiscountCode.validateForPurchase(code, userId, projectId);
      
      if (validation.valid) {
        res.json({
          success: true,
          valid: true,
          discountCode: {
            code: validation.discountCode.code,
            type: validation.discountCode.type,
            discountAmount: validation.discountAmount,
            finalPrice: validation.finalPrice,
            originalPrice: validation.originalPrice || validation.discountCode.originalPrice,
            discountPercentage: validation.discountCode.discountPercentage,
            expiresAt: validation.discountCode.expiresAt
          }
        });
      } else {
        res.status(400).json({
          success: false,
          valid: false,
          message: validation.error
        });
      }
      
    } catch (error) {
      console.error('❌ Error validating discount code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate discount code'
      });
    }
  }
);

// GET /api/discounts/user/codes - Get all user's discount codes
router.get('/user/codes',
  verifyToken,
  requireRole(['buyer']),
  async (req, res) => {
    try {
      const userId = req.user._id;
      
      console.log('🎫 Getting all discount codes for user:', userId);
      
      const discountCodes = await DiscountCode.find({
        buyer: userId,
        isActive: true
      }).populate('project', 'title price').sort({ createdAt: -1 });
      
      const formattedCodes = discountCodes.map(code => ({
        id: code._id,
        code: code.code,
        type: code.type,
        discountPercentage: code.discountPercentage,
        discountAmount: code.discountAmount,
        maxDiscountAmount: code.maxDiscountAmount,
        minPurchaseAmount: code.minPurchaseAmount,
        isValid: code.isValid(),
        isUsed: code.isUsed,
        expiresAt: code.expiresAt,
        usedAt: code.usedAt,
        project: code.project ? {
          id: code.project._id,
          title: code.project.title,
          price: code.project.price
        } : null,
        createdAt: code.createdAt
      }));
      
      res.json({
        success: true,
        discountCodes: formattedCodes,
        total: formattedCodes.length,
        active: formattedCodes.filter(code => code.isValid && !code.isUsed).length,
        used: formattedCodes.filter(code => code.isUsed).length,
        expired: formattedCodes.filter(code => !code.isValid && !code.isUsed).length
      });
      
    } catch (error) {
      console.error('❌ Error getting user discount codes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get discount codes'
      });
    }
  }
);

export default router;
