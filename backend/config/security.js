import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Security configuration for production
export const securityConfig = {
  // Helmet configuration for security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'", 
          "'unsafe-inline'", 
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "https:",
          "blob:"
        ],
        scriptSrc: [
          "'self'", 
          "https://checkout.razorpay.com",
          "https://cdn.jsdelivr.net"
        ],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://lumberjack.razorpay.com",
          "https://checkout.razorpay.com",
          "wss:"
        ],
        frameSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://checkout.razorpay.com"
        ],
        objectSrc: [
          "'none'"
        ],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  },

  // Rate limiting configurations
  rateLimits: {
    // General API rate limit
    general: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        return req.path === '/health' || req.path === '/api/health';
      }
    },

    // Authentication rate limit
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: 900
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true
    },

    // Payment rate limit
    payment: {
      windowMs: 60 * 1000, // 1 minute
      max: 3, // 3 payment attempts per minute
      message: {
        error: 'Too many payment attempts, please try again later.',
        retryAfter: 60
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Registration rate limit
    registration: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 registrations per hour per IP
      message: {
        error: 'Too many registration attempts, please try again later.',
        retryAfter: 3600
      },
      standardHeaders: true,
      legacyHeaders: false
    },

    // Password reset rate limit
    passwordReset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 password reset attempts per hour
      message: {
        error: 'Too many password reset attempts, please try again later.',
        retryAfter: 3600
      },
      standardHeaders: true,
      legacyHeaders: false
    }
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173'
      ];
      
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'X-Requested-With',
      'X-CSRF-Token'
    ],
    exposedHeaders: [
      'X-RateLimit-Limit', 
      'X-RateLimit-Remaining', 
      'X-RateLimit-Reset'
    ],
    maxAge: 86400 // 24 hours
  },

  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: 'projectbuzz.sid'
  },

  // File upload security
  fileUpload: {
    limits: {
      fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
      files: parseInt(process.env.MAX_FILES_PER_PROJECT) || 5
    },
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'text/markdown'
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp',
      '.pdf', '.zip', '.txt', '.md'
    ]
  },

  // Input validation patterns
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    name: /^[a-zA-Z\s]{2,50}$/,
    phone: /^\+?[\d\s\-\(\)]{10,15}$/,
    url: /^https?:\/\/.+/,
    mongoId: /^[0-9a-fA-F]{24}$/
  },

  // Trusted proxy configuration
  proxy: {
    trust: process.env.TRUST_PROXY === 'true',
    hops: 1
  }
};

// Create rate limiters
export const createRateLimiters = () => {
  const limiters = {};
  
  Object.keys(securityConfig.rateLimits).forEach(key => {
    limiters[key] = rateLimit(securityConfig.rateLimits[key]);
  });
  
  return limiters;
};

// Security middleware factory
export const createSecurityMiddleware = () => {
  return {
    helmet: helmet(securityConfig.helmet),
    rateLimiters: createRateLimiters(),
    
    // Input sanitization middleware
    sanitizeInput: (req, res, next) => {
      const sanitize = (obj) => {
        for (let key in obj) {
          if (typeof obj[key] === 'string') {
            // Remove potential XSS attempts
            obj[key] = obj[key]
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitize(obj[key]);
          }
        }
      };

      if (req.body) sanitize(req.body);
      if (req.query) sanitize(req.query);
      if (req.params) sanitize(req.params);
      
      next();
    },

    // Security headers middleware
    securityHeaders: (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      
      next();
    }
  };
};
