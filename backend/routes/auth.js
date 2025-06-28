import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import SellerVerificationService from '../services/sellerVerificationService.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  body('role')
    .optional()
    .isIn(['buyer'])
    .withMessage('Only buyer role is allowed for standard registration')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    console.log('\n🔍 ===== REGISTRATION REQUEST RECEIVED =====');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📝 Request headers Content-Type:', req.headers['content-type']);
    console.log('📝 Request method:', req.method);
    console.log('📝 Request URL:', req.url);

    // Check if body is empty or malformed
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ Empty request body detected');
      return res.status(400).json({
        success: false,
        message: 'Request body is empty or malformed'
      });
    }

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

    const { email, password, displayName } = req.body;
    const role = 'buyer'; // Force all standard registrations to be buyers

    console.log('📝 Extracted data:', { email, password: password ? '***' : 'empty', displayName, role: 'buyer (forced)' });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user (buyers only)
    console.log('👤 Creating new buyer with data:', { email, displayName: displayName || email.split('@')[0], role: 'buyer' });

    const user = new User({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      role: 'buyer',
      emailVerified: true, // For simplicity, we'll consider all emails verified
      stats: {
        projectsPurchased: 0,
        projectsSold: 0,
        totalSpent: 0,
        totalEarned: 0
      }
    });

    console.log('💾 Attempting to save user to database...');
    await user.save();
    console.log('✅ User saved successfully to database:', user.email);
    console.log('✅ User saved to database:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response immediately to prevent timeout
    const response = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    };

    console.log('📤 Sending registration response for:', user.email);
    res.status(201).json(response);

    // Note: Admin email notifications for new user registrations have been disabled
    // If you need to re-enable them, uncomment the code below:
    /*
    // Send new user registration notifications to admins asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        console.log('📧 Starting async email notifications for new user:', user.email);
        await notificationService.notifyNewUserRegistration(user._id);
        console.log('✅ New user registration notifications sent to admins');
      } catch (notificationError) {
        console.error('❌ Failed to send new user registration notifications:', notificationError.message);
        // Don't fail registration if notifications fail - user is already created and response sent
      }
    });
    */

  } catch (error) {
    console.error('\n❌ ===== REGISTRATION ERROR =====');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      console.error('❌ MongoDB Validation Error:', error.errors);
      return res.status(400).json({
        success: false,
        message: 'User data validation failed',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.code === 11000) {
      console.error('❌ MongoDB Duplicate Key Error:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Handle other specific errors
    if (error.message.includes('password')) {
      return res.status(400).json({
        success: false,
        message: 'Password validation failed'
      });
    }

    console.error('❌ Unexpected error during registration');
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
});

// POST /api/auth/register-seller - Enhanced seller registration
router.post('/register-seller',
  SellerVerificationService.getSellerRegistrationValidation(),
  SellerVerificationService.validateSellerData,
  async (req, res) => {
    try {
      console.log('\n🔍 ===== SELLER REGISTRATION REQUEST RECEIVED =====');
      console.log('📝 Request body keys:', Object.keys(req.body));
      console.log('📝 Request body data:', JSON.stringify(req.body, null, 2));

      const result = await SellerVerificationService.registerSeller(req.body);

      // Generate JWT token for immediate login
      const token = generateToken(result.user._id);

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
          token
        }
      });

      // Send notification to admins about new seller registration
      setImmediate(async () => {
        try {
          console.log('📧 Sending admin notification for new seller registration');
          await notificationService.notifyAdminNewSellerRegistration(result.user._id);
          console.log('✅ Admin notification sent for seller registration');
        } catch (notificationError) {
          console.error('❌ Failed to send admin notification:', notificationError.message);
        }
      });

    } catch (error) {
      console.error('\n❌ ===== SELLER REGISTRATION ERROR =====');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);

      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('required')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during seller registration'
      });
    }
  }
);

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;
