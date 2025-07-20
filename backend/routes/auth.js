import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import SellerVerificationService from '../services/sellerVerificationService.js';
import otpService from '../services/otpService.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';

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

// POST /api/auth/register-with-otp - Register new user with OTP verification
router.post('/register-with-otp', registerValidation, async (req, res) => {
  try {
    console.log('\n🔍 ===== REGISTRATION WITH OTP REQUEST RECEIVED =====');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, displayName } = req.body;
    const role = 'buyer'; // Force all standard registrations to be buyers

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user but don't save to database yet
    const user = new User({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      role,
      emailVerified: false
    });

    // Generate temporary user ID for OTP tracking
    const tempUserId = user._id.toString();

    // Send OTP
    const otpResult = await otpService.sendRegistrationOTP(tempUserId, email, displayName);

    if (otpResult.success) {
      // Store user data temporarily (in production, use Redis or database)
      global.tempUsers = global.tempUsers || new Map();
      global.tempUsers.set(tempUserId, {
        userData: {
          email,
          password,
          displayName: displayName || email.split('@')[0],
          role
        },
        createdAt: Date.now()
      });

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please verify your email.',
        userId: tempUserId,
        expiresAt: otpResult.expiresAt
      });
    } else {
      res.status(500).json({
        success: false,
        message: otpResult.message || 'Failed to send OTP'
      });
    }

  } catch (error) {
    console.error('Registration with OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// POST /api/auth/register-seller-with-otp - Register seller with OTP verification
router.post('/register-seller-with-otp',
  SellerVerificationService.getSellerRegistrationValidation(),
  SellerVerificationService.validateSellerData,
  async (req, res) => {
    try {
      console.log('\n🔍 ===== SELLER REGISTRATION WITH OTP REQUEST RECEIVED =====');
      console.log('📝 Request body keys:', Object.keys(req.body));

      const { email, displayName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Generate temporary user ID for OTP tracking
      const tempUserId = new Date().getTime().toString();

      // Send OTP
      const otpResult = await otpService.sendSellerRegistrationOTP(tempUserId, email, displayName);

      if (otpResult.success) {
        // Store seller data temporarily
        global.tempSellers = global.tempSellers || new Map();
        global.tempSellers.set(tempUserId, {
          userData: req.body,
          createdAt: Date.now()
        });

        console.log('✅ Seller data stored in temporary storage');
        console.log('📝 TempUserId:', tempUserId);
        console.log('📝 Current tempSellers keys:', Array.from(global.tempSellers.keys()));

        res.status(200).json({
          success: true,
          message: 'OTP sent successfully. Please verify your email.',
          userId: tempUserId,
          expiresAt: otpResult.expiresAt
        });
      } else {
        res.status(500).json({
          success: false,
          message: otpResult.message || 'Failed to send OTP'
        });
      }

    } catch (error) {
      console.error('Seller registration with OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during seller registration'
      });
    }
  }
);

// POST /api/auth/verify-otp - Verify OTP and complete registration
router.post('/verify-otp', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('type').isIn(['registration', 'seller_registration', 'email', 'sms']).withMessage('Invalid verification type')
], async (req, res) => {
  try {
    console.log('\n🔍 ===== OTP VERIFICATION REQUEST =====');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📝 Headers:', req.headers);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        details: errors.array().map(err => `${err.path}: ${err.msg}`).join(', ')
      });
    }

    let { userId, otp, type } = req.body;

    // Map frontend verification types to backend types
    if (type === 'email') {
      // Check if this is a seller registration by looking in tempSellers
      global.tempSellers = global.tempSellers || new Map();
      global.tempUsers = global.tempUsers || new Map();

      console.log('🔍 Checking temporary storage...');
      console.log('TempSellers keys:', Array.from(global.tempSellers.keys()));
      console.log('TempUsers keys:', Array.from(global.tempUsers.keys()));

      // Clean up expired entries (older than 30 minutes)
      const now = Date.now();
      const expirationTime = 30 * 60 * 1000; // 30 minutes

      for (const [key, data] of global.tempSellers.entries()) {
        if (now - data.createdAt > expirationTime) {
          global.tempSellers.delete(key);
          console.log('🧹 Cleaned up expired tempSeller:', key);
        }
      }

      for (const [key, data] of global.tempUsers.entries()) {
        if (now - data.createdAt > expirationTime) {
          global.tempUsers.delete(key);
          console.log('🧹 Cleaned up expired tempUser:', key);
        }
      }

      if (global.tempSellers.has(userId)) {
        type = 'seller_registration';
        console.log('✅ Found in tempSellers, setting type to seller_registration');
      } else if (global.tempUsers.has(userId)) {
        type = 'registration';
        console.log('✅ Found in tempUsers, setting type to registration');
      } else {
        console.log('❌ User ID not found in temporary storage');
        console.log('📝 Available tempSellers:', Array.from(global.tempSellers.keys()));
        console.log('📝 Available tempUsers:', Array.from(global.tempUsers.keys()));
        return res.status(400).json({
          success: false,
          message: 'Registration session expired or invalid. Please start registration again.',
          userId: userId,
          debug: {
            availableTempSellers: Array.from(global.tempSellers.keys()),
            availableTempUsers: Array.from(global.tempUsers.keys())
          }
        });
      }
    }

    // Verify OTP
    console.log(`🔍 Verifying OTP for user: ${userId}, type: ${type}`);
    const verificationResult = await otpService.verifyOTP(userId, otp, type);

    if (!verificationResult.success) {
      console.log(`❌ OTP verification failed: ${verificationResult.message}`);
      return res.status(400).json(verificationResult);
    }

    console.log(`✅ OTP verification successful, creating user account`);

    // OTP verified successfully - now create the user
    if (type === 'registration') {
      // Handle buyer registration
      global.tempUsers = global.tempUsers || new Map();
      const tempUserData = global.tempUsers.get(userId);

      if (!tempUserData) {
        return res.status(400).json({
          success: false,
          message: 'Registration session expired. Please start again.'
        });
      }

      const user = new User({
        ...tempUserData.userData,
        emailVerified: true
      });

      await user.save();
      global.tempUsers.delete(userId);

      const token = generateToken(user._id);

      // For buyers, create welcome discount code and send welcome email
      if (user.role === 'buyer') {
        try {
          // Import DiscountCode model and create welcome code
          const DiscountCode = (await import('../models/DiscountCode.js')).default;
          const welcomeCode = await DiscountCode.createWelcomeCode(user._id);

          if (welcomeCode) {
            console.log('🎫 Welcome discount code created for new buyer:', user.email);
          }

          // Send welcome email with discount code
          const emailService = (await import('../services/emailService.js')).default;
          const emailResult = await emailService.sendWelcomeBuyerEmail(user);

          if (emailResult.success) {
            console.log('📧 Welcome email sent to new buyer:', user.email);
          } else {
            console.warn('⚠️ Failed to send welcome email:', emailResult.error);
          }
        } catch (error) {
          console.error('❌ Error setting up welcome benefits for new buyer:', error);
          // Don't fail registration if welcome setup fails
        }
      }

      res.status(201).json({
        success: true,
        message: 'Registration completed successfully',
        data: {
          user: user.toJSON(),
          token,
          welcomeOffer: user.role === 'buyer' ? {
            hasWelcomeCode: true,
            discountCode: 'WELCOME20',
            discountPercentage: 20,
            maxDiscount: 500,
            validDays: 30
          } : undefined
        }
      });

    } else if (type === 'seller_registration') {
      // Handle seller registration
      global.tempSellers = global.tempSellers || new Map();
      const tempSellerData = global.tempSellers.get(userId);

      if (!tempSellerData) {
        return res.status(400).json({
          success: false,
          message: 'Registration session expired. Please start again.'
        });
      }

      const result = await SellerVerificationService.registerSeller({
        ...tempSellerData.userData,
        emailVerified: true
      });

      global.tempSellers.delete(userId);

      const token = generateToken(result.user._id);

      res.status(201).json({
        success: true,
        message: 'Seller registration completed successfully',
        data: {
          user: result.user,
          token
        }
      });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during verification'
    });
  }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('type').isIn(['registration', 'seller_registration', 'email', 'sms']).withMessage('Invalid verification type'),
  body('email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    console.log('\n🔍 ===== RESEND OTP REQUEST RECEIVED =====');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let { userId, type, email } = req.body;

    // Map frontend verification types to backend types
    if (type === 'email') {
      // Check if this is a seller registration by looking in tempSellers
      global.tempSellers = global.tempSellers || new Map();
      if (global.tempSellers.has(userId)) {
        type = 'seller_registration';
      } else {
        type = 'registration';
      }
    }

    // Get user data from temporary storage
    let userData;
    if (type === 'registration') {
      global.tempUsers = global.tempUsers || new Map();
      userData = global.tempUsers.get(userId);
    } else if (type === 'seller_registration') {
      global.tempSellers = global.tempSellers || new Map();
      userData = global.tempSellers.get(userId);
    }

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: 'Registration session expired. Please start again.'
      });
    }

    const userEmail = email || userData.userData.email;
    const displayName = userData.userData.displayName;

    // Resend OTP
    const otpResult = await otpService.resendOTP(userId, type, userEmail, displayName);

    res.status(200).json(otpResult);

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during OTP resend'
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ===== OAUTH ROUTES =====
// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Google OAuth initiation request:', {
      origin: req.get('origin'),
      hostname: req.hostname
    });
  }
  next();
}, passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth callback successful');

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);

      // Determine frontend URL based on environment
      const isDevelopment = req.get('referer')?.includes('localhost') ||
                           req.get('origin')?.includes('localhost') ||
                           process.env.NODE_ENV === 'development';

      let frontendUrl;
      if (isDevelopment) {
        frontendUrl = 'http://localhost:5175';
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 DEVELOPMENT MODE: Using localhost frontend');
        }
      } else {
        frontendUrl = process.env.FRONTEND_URL || 'https://projectbuzz.tech';
      }

      // Only log detailed info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Redirecting to frontend:', frontendUrl);
      }

      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&provider=google`;
      res.redirect(redirectUrl);

    } catch (error) {
      console.error('❌ Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_callback_failed`);
    }
  }
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email']
  })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('✅ GitHub OAuth callback successful');

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user._id);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=github`);

    } catch (error) {
      console.error('❌ GitHub OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=oauth_callback_failed`);
    }
  }
);

// OAuth success endpoint for frontend to get user data
router.get('/oauth/user', async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('❌ OAuth user fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user data'
    });
  }
});

export default router;
