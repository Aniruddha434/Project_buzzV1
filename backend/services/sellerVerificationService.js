import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

/**
 * Seller Verification Service
 * Handles enhanced seller registration and verification processes
 */

class SellerVerificationService {

  /**
   * Validation rules for seller registration
   */
  static getSellerRegistrationValidation() {
    return [
      // Basic Information
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),

      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

      body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Display name must be between 2-50 characters'),

      // Seller-specific fields
      body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name is required (2-100 characters)'),

      body('phoneNumber')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Phone number must be 10-20 characters if provided'),

      body('occupation')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Occupation must be 2-100 characters if provided'),

      body('experienceLevel')
        .optional({ checkFalsy: true })
        .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
        .withMessage('Experience level must be one of: beginner, intermediate, advanced, expert'),

      body('yearsOfExperience')
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 50 })
        .withMessage('Years of experience must be between 0-50 if provided'),

      body('portfolioUrl')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('Portfolio URL must be valid'),

      body('githubProfile')
        .optional({ checkFalsy: true })
        .isURL()
        .withMessage('GitHub profile must be valid URL'),

      body('motivation')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Motivation must be between 10-1000 characters if provided'),

      body('specializations')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Maximum 10 specializations allowed'),

      body('sellerTermsAccepted')
        .custom((value) => {
          return value === true || value === 'true';
        })
        .withMessage('Seller terms and conditions must be accepted'),

      // Work Examples Validation
      body('workExamples')
        .optional()
        .isArray({ max: 5 })
        .withMessage('Maximum 5 work examples allowed'),

      body('workExamples.*.title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Work example title must be 2-100 characters'),

      body('workExamples.*.description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Work example description must be 10-500 characters'),

      body('workExamples.*.url')
        .optional()
        .isURL()
        .withMessage('Work example URL must be valid')
    ];
  }

  /**
   * Register a new seller with enhanced verification
   */
  static async registerSeller(userData) {
    try {
      console.log('🔐 Starting seller registration process...');

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate required seller fields (only essential ones)
      const requiredFields = [
        'email', 'password', 'displayName', 'fullName', 'sellerTermsAccepted'
      ];

      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required for seller registration`);
        }
      }

      // Validate sellerTermsAccepted specifically
      if (userData.sellerTermsAccepted !== true && userData.sellerTermsAccepted !== 'true') {
        throw new Error('Seller terms and conditions must be accepted');
      }

      // Create user with seller verification data
      const newUser = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        displayName: userData.displayName,
        role: 'seller',
        sellerVerification: {
          verifiedFullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          occupation: userData.occupation,
          experienceLevel: userData.experienceLevel,
          yearsOfExperience: parseInt(userData.yearsOfExperience),
          portfolioUrl: userData.portfolioUrl || '',
          githubProfile: userData.githubProfile || '',
          workExamples: userData.workExamples || [],
          businessName: userData.businessName || '',
          businessType: userData.businessType || 'individual',
          businessRegistrationNumber: userData.businessRegistrationNumber || '',
          motivation: userData.motivation,
          specializations: userData.specializations,
          sellerTermsAccepted: userData.sellerTermsAccepted === 'true' || userData.sellerTermsAccepted === true,
          sellerTermsAcceptedDate: new Date(),
          verificationStatus: 'approved', // Auto-approve sellers for immediate access
          verificationDate: new Date(), // Set verification date to now
          autoApproved: true, // Flag to indicate this was auto-approved
          expectedMonthlyRevenue: userData.expectedMonthlyRevenue || 0
        }
      });

      await newUser.save();
      console.log('✅ Seller registration successful:', newUser._id);

      // Remove password from response
      const userResponse = newUser.toJSON();
      delete userResponse.password;

      return {
        success: true,
        user: userResponse,
        message: 'Seller registration successful! You can start selling immediately.'
      };

    } catch (error) {
      console.error('❌ Seller registration error:', error);
      throw error;
    }
  }

  /**
   * Get seller verification status
   */
  static async getVerificationStatus(userId) {
    try {
      const user = await User.findById(userId).select('sellerVerification role');

      if (!user || user.role !== 'seller') {
        throw new Error('User not found or not a seller');
      }

      return {
        success: true,
        verificationStatus: user.sellerVerification?.verificationStatus || 'pending',
        verificationData: user.sellerVerification
      };
    } catch (error) {
      console.error('❌ Error getting verification status:', error);
      throw error;
    }
  }

  /**
   * Update seller verification status (Admin only)
   */
  static async updateVerificationStatus(sellerId, status, adminId, adminNotes = '') {
    try {
      const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid verification status');
      }

      const updateData = {
        'sellerVerification.verificationStatus': status,
        'sellerVerification.reviewedBy': adminId,
        'sellerVerification.reviewedAt': new Date()
      };

      if (status === 'approved') {
        updateData['sellerVerification.verificationDate'] = new Date();
      }

      if (status === 'rejected' && adminNotes) {
        updateData['sellerVerification.rejectionReason'] = adminNotes;
      }

      if (adminNotes) {
        updateData['sellerVerification.adminNotes'] = adminNotes;
      }

      const user = await User.findByIdAndUpdate(
        sellerId,
        updateData,
        { new: true }
      ).select('-password');

      if (!user) {
        throw new Error('Seller not found');
      }

      console.log(`✅ Seller verification status updated: ${sellerId} -> ${status}`);

      return {
        success: true,
        user,
        message: `Seller verification status updated to ${status}`
      };

    } catch (error) {
      console.error('❌ Error updating verification status:', error);
      throw error;
    }
  }

  /**
   * Get all pending seller verifications (Admin only)
   */
  static async getPendingVerifications() {
    try {
      const pendingSellers = await User.find({
        role: 'seller',
        'sellerVerification.verificationStatus': { $in: ['pending', 'under_review'] }
      }).select('-password').sort({ createdAt: -1 });

      return {
        success: true,
        sellers: pendingSellers,
        count: pendingSellers.length
      };
    } catch (error) {
      console.error('❌ Error getting pending verifications:', error);
      throw error;
    }
  }

  /**
   * Validate seller registration data
   */
  static validateSellerData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('\n❌ ===== SELLER VALIDATION FAILED =====');
      console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
      console.log('❌ Validation errors:', JSON.stringify(errors.array(), null, 2));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        details: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
      });
    }
    next();
  }
}

export default SellerVerificationService;
