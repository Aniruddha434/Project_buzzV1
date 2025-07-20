// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configuration with production support
if (process.env.NODE_ENV === 'production') {
  // In production, try .env.production first, then .env
  const prodEnvPath = path.join(__dirname, '.env.production');
  const envPath = path.join(__dirname, '.env');

  let envLoaded = false;
  try {
    const result = dotenv.config({ path: prodEnvPath });
    if (!result.error) {
      console.log('✅ Loaded .env.production');
      envLoaded = true;
    }
  } catch (error) {
    // Fall back to .env
  }

  if (!envLoaded) {
    try {
      dotenv.config({ path: envPath });
      console.log('✅ Loaded .env');
    } catch (error) {
      console.log('⚠️  Using system environment variables');
    }
  }
} else {
  // Development mode - use .env
  dotenv.config({ path: path.join(__dirname, '.env') });
}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
// import { getOptimalPort, PortManager } from './utils/portManager.js';

// Import routes
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import walletRoutes from './routes/wallet.js';
import payoutRoutes from './routes/payouts.js';
import notificationRoutes from './routes/notifications.js';
import adminManagementRoutes from './routes/adminManagement.js';
import negotiationRoutes from './routes/negotiations.js';
import discountRoutes from './routes/discounts.js';

// Configure Passport after environment variables are loaded
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from './models/User.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Debug environment variables
console.log('🔍 Environment variables check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GITHUB_CLIENT_SECRET:', process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET');

// Define backend URL for OAuth callbacks
const backendUrl = process.env.NODE_ENV === 'production'
  ? (process.env.BACKEND_URL || 'https://project-buzzv1-2.onrender.com')
  : 'http://localhost:5000';

// Only configure OAuth strategies if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${backendUrl}/api/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google OAuth profile:', profile);

      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        console.log('✅ Existing Google user found:', user.email);
        return done(null, user);
      }

      // Check if user exists with the same email
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
        console.log('🔗 Linked Google account to existing user:', user.email);
        return done(null, user);
      }

      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatar: profile.photos[0]?.value,
        role: 'buyer',
        emailVerified: true, // Google emails are pre-verified
        authProvider: 'google'
      });

      await user.save();
      console.log('✅ New Google user created:', user.email);
      return done(null, user);

    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️ Google OAuth credentials not found, skipping Google strategy');
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${backendUrl}/api/auth/github/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 GitHub OAuth profile:', profile);

      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        console.log('✅ Existing GitHub user found:', user.email);
        return done(null, user);
      }

      // Check if user exists with the same email
      const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
      user = await User.findOne({ email: email });

      if (user) {
        // Link GitHub account to existing user
        user.githubId = profile.id;
        user.githubProfile = profile.username;
        user.avatar = profile.photos[0]?.value || user.avatar;
        await user.save();
        console.log('🔗 Linked GitHub account to existing user:', user.email);
        return done(null, user);
      }

      // Create new user
      user = new User({
        githubId: profile.id,
        email: email,
        displayName: profile.displayName || profile.username,
        githubProfile: profile.username,
        avatar: profile.photos[0]?.value,
        role: 'buyer',
        emailVerified: profile.emails?.[0]?.value ? true : false,
        authProvider: 'github'
      });

      await user.save();
      console.log('✅ New GitHub user created:', user.email);
      return done(null, user);

    } catch (error) {
      console.error('❌ GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('⚠️ GitHub OAuth credentials not found, skipping GitHub strategy');
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - Comprehensive solution for development and production
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🌐 CORS request from origin: ${origin || 'no-origin'}`);

    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Define allowed origins based on environment
    const allowedOrigins = [
      // Frontend URLs
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.PRODUCTION_FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      // Backend URLs (for internal requests)
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:5002',
      // Development tools
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      // Vercel deployment URLs - Updated with actual deployment URL
      'https://project-buzz-8p7pyql08-aniruddhagayki0-gmailcoms-projects.vercel.app',
      'https://project-buzz-v.vercel.app',
      'https://projectbuzz.vercel.app',
      'https://projectbuzz.tech', // Custom domain
      'https://www.projectbuzz.tech', // Custom domain with www
      // Production URLs from environment
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(url => url.trim()) : [])
    ].filter(Boolean); // Remove undefined values

    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      // Allow all localhost and 127.0.0.1 origins
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        console.log('✅ CORS: Allowing localhost/127.0.0.1 origin in development');
        return callback(null, true);
      }
    }

    // Allow Vercel deployment URLs (they have dynamic subdomains)
    if (origin && origin.includes('vercel.app') &&
        (origin.includes('project-buzz') || origin.includes('projectbuzz'))) {
      console.log('✅ CORS: Allowing Vercel deployment URL');
      return callback(null, true);
    }

    // Temporary fix: Allow all HTTPS origins for production debugging
    if (origin && origin.startsWith('https://') && origin.includes('vercel.app')) {
      console.log('✅ CORS: Allowing HTTPS Vercel origin for debugging');
      return callback(null, true);
    }

    // Allow custom domain
    if (origin.includes('projectbuzz.tech')) {
      console.log('✅ CORS: Allowing ProjectBuzz custom domain');
      return callback(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Origin found in allowed list');
      return callback(null, true);
    }

    // In production, be strict
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ CORS: Origin not allowed in production');
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }

    // Default allow in development
    console.log('✅ CORS: Allowing origin in development mode');
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Cache-Control',
    'Last-Modified',
    'ETag'
  ]
};

app.use(cors(corsOptions));

// Enhanced CORS middleware for all requests
app.use((req, res, next) => {
  const origin = req.get('Origin');

  // In development, be very permissive with CORS
  if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'false'); // Set to false when using wildcard
  } else {
    // Production - be more selective
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'false');
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Cache-Control, Last-Modified, ETag');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Vary', 'Origin');

  // For image requests, add additional headers
  if (req.path.includes('/images/')) {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔄 CORS preflight request from ${origin || 'no-origin'} for ${req.path}`);
    return res.sendStatus(200);
  }

  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/projectbuzz',
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Serve static images with CORS headers as fallback
app.use('/api/projects/images', (req, res, next) => {
  // Set CORS headers for static image serving
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cache-Control', 'public, max-age=86400');
  next();
}, express.static(path.join(process.cwd(), 'uploads', 'images')));

// Images are also served through the API route in projects.js for additional functionality

// MongoDB connection with enhanced error handling and production optimization
const connectMongoDB = async () => {
  try {
    // Production-optimized connection options
    const connectionOptions = {
      // Connection timeouts
      serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 10000,
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 15000,
      socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 60000,

      // Connection pool settings
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 20,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME) || 60000,

      // Reliability settings
      retryWrites: true,
      retryReads: true,
      w: 'majority',

      // Monitoring
      monitorCommands: process.env.NODE_ENV === 'development',

      // Buffer settings (temporarily enable for development)
      bufferCommands: true,

      // Heartbeat
      heartbeatFrequencyMS: 10000,

      // Additional production settings
      ...(process.env.NODE_ENV === 'production' && {
        tls: true,
        tlsAllowInvalidCertificates: false,
        authSource: 'admin'
      })
    };

    console.log('🔗 Connecting to MongoDB...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.MONGODB_ATLAS_DB_NAME || 'projectbuzz'}`);

    await mongoose.connect(process.env.MONGO_URI, connectionOptions);

    console.log('✅ MongoDB connected successfully');
    console.log(`🏊 Connection pool: ${connectionOptions.minPoolSize}-${connectionOptions.maxPoolSize} connections`);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    // Initialize services after DB connection and environment variables are loaded
    console.log('🔧 Initializing services...');

    // Dynamically import services to ensure environment variables are loaded first
    const { default: emailService } = await import('./services/emailService.js');
    const { default: notificationService } = await import('./services/notificationService.js');

    console.log('📧 Email service loaded');
    console.log('🔔 Notification service loaded');

    // Test database connectivity
    await testDatabaseConnection();

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);

    if (err.message.includes('authentication failed')) {
      console.error('🔐 Authentication failed - check your MongoDB credentials');
    } else if (err.message.includes('network')) {
      console.error('🌐 Network error - check your internet connection and MongoDB Atlas IP whitelist');
    } else if (err.message.includes('timeout')) {
      console.error('⏱️  Connection timeout - check your MongoDB Atlas cluster status');
    }

    console.warn('⚠️  Server will continue running without database functionality');
    console.warn('⚠️  Some API endpoints may not work properly');

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_DB === 'true') {
      console.error('💥 Database connection required in production. Exiting...');
      process.exit(1);
    }
  }
};

// Test database connection and basic operations
const testDatabaseConnection = async () => {
  try {
    // Test basic database operations
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    console.log('🏓 Database ping successful');

    // Test collection access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📚 Found ${collections.length} collections in database`);

    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
};

// Connect to MongoDB asynchronously
connectMongoDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/discounts', discountRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ProjectBuzz Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API health check route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ProjectBuzz Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      users: '/api/users',
      admin: '/api/admin',
      payments: '/api/payments',
      wallet: '/api/wallet',
      payouts: '/api/payouts',
      notifications: '/api/notifications',
      adminManagement: '/api/admin-management',
      negotiations: '/api/negotiations'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Handle JSON parsing errors (malformed requests)
  if (error.type === 'entity.parse.failed' && error.body) {
    console.log('🔧 Malformed JSON request detected');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Malformed body:', error.body);

    // Check if this is a payment verification request with just an order ID
    if (req.url.includes('/verify-payment') && typeof error.body === 'string' && error.body.includes('order_')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment verification request format',
        error: 'Expected JSON object with razorpay_order_id, razorpay_payment_id, and razorpay_signature',
        received: error.body,
        hint: 'Make sure you are sending a proper JSON object, not just a string'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: error.message,
      received: error.body
    });
  }

  // Multer file upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }

  if (error.message && error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // MongoDB validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Simple server startup
const startServer = () => {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/`);

    // Log important URLs
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📋 Development URLs:');
      console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`   Backend API: http://localhost:${PORT}/api`);
      console.log(`   MongoDB: ${process.env.MONGO_URI || 'mongodb://localhost:27017/projectbuzz'}`);
      console.log('');
    }
  });
};

startServer();