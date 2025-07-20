import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { body, validationResult, param, query } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import imageOptimizationService from '../services/imageOptimizationService.js';
import { projectCacheMiddleware, invalidateCache, imageCacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Ensure uploads directory exists (with error handling for cloud platforms)
const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
let canWriteToFileSystem = true;

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  // Test write permissions
  const testFile = path.join(uploadsDir, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ File system write permissions confirmed');
} catch (error) {
  console.log('⚠️ File system write permissions denied, using memory storage');
  console.log('Error:', error.message);
  canWriteToFileSystem = false;
}

// Configure multer for image uploads only
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `${timestamp}_${req.user?._id || 'user'}_${Math.random().toString(36).substring(7)}${ext}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files (JPEG, PNG, GIF, WebP) are allowed.'));
    }
  }
});

// Configure multer for documentation file uploads
const uploadDocs = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const docsDir = path.join(uploadsDir, 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      cb(null, docsDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `${timestamp}_${req.user?._id || 'user'}_${Math.random().toString(36).substring(7)}${ext}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documentation files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Markdown, and text files are allowed for documentation.'));
    }
  }
});

// Combined upload for images, documentation, and ZIP files
// Create storage configuration based on file system permissions
const createStorageConfig = () => {
  if (canWriteToFileSystem) {
    console.log('📁 Using disk storage for file uploads');
    return multer.diskStorage({
      destination: (req, file, cb) => {
        try {
          if (file.fieldname === 'images') {
            cb(null, uploadsDir);
          } else if (file.fieldname === 'documentationFiles') {
            const docsDir = path.join(uploadsDir, 'docs');
            if (!fs.existsSync(docsDir)) {
              fs.mkdirSync(docsDir, { recursive: true });
            }
            cb(null, docsDir);
          } else if (file.fieldname === 'projectZipFile') {
            const zipDir = path.join(uploadsDir, 'projects');
            if (!fs.existsSync(zipDir)) {
              fs.mkdirSync(zipDir, { recursive: true });
            }
            cb(null, zipDir);
          } else {
            cb(new Error('Invalid field name'));
          }
        } catch (error) {
          console.log('❌ Disk storage error, falling back to memory storage');
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const filename = `${timestamp}_${req.user?._id || 'user'}_${Math.random().toString(36).substring(7)}${ext}`;
        cb(null, filename);
      }
    });
  } else {
    console.log('💾 Using memory storage for file uploads (cloud platform)');
    return multer.memoryStorage();
  }
};

const uploadCombined = multer({
  storage: createStorageConfig(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit (will be checked per field in validation)
    files: 16 // Max total files
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid image file type. Only JPEG, PNG, GIF, WebP are allowed.'));
      }
    } else if (file.fieldname === 'documentationFiles') {
      const allowedDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/markdown',
        'text/plain'
      ];
      if (allowedDocTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid documentation file type. Only PDF, Word, Markdown, and text files are allowed.'));
      }
    } else if (file.fieldname === 'projectZipFile') {
      const allowedZipTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-zip'
      ];
      if (allowedZipTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.zip')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only ZIP files are allowed for project source code.'));
      }
    } else {
      cb(new Error(`Invalid field name: ${file.fieldname}`));
    }
  }
});

// Custom validation for tags (can be array or JSON string)
const validateTags = (value) => {
  if (!value) return true; // Optional field

  if (Array.isArray(value)) return true;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed);
    } catch {
      // If not JSON, check if it's a comma-separated string
      return typeof value === 'string';
    }
  }

  return false;
};

// Validation rules
const createProjectValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 10, max: 10000 }).withMessage('Description must be 10-10000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('githubRepo').optional({ checkFalsy: true }).isURL().withMessage('GitHub repository URL must be valid if provided'),
  body('demoUrl').custom((value) => {
    // Skip validation if value is empty, null, or undefined
    if (!value || value.trim() === '') {
      return true;
    }
    // Validate as URL if value is provided
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(value)) {
      throw new Error('Demo URL must be a valid URL if provided');
    }
    return true;
  }),
  body('category').optional().isIn(['web', 'mobile', 'desktop', 'ai-ml', 'blockchain', 'game', 'other']),
  body('tags').optional().custom(validateTags).withMessage('Tags must be an array or valid JSON array string'),
  // New enhanced project information validation
  body('completionStatus').optional().isInt({ min: 0, max: 100 }).withMessage('Completion status must be between 0 and 100'),
  body('projectDetails.timeline').optional().trim().isLength({ max: 500 }).withMessage('Timeline must be less than 500 characters'),
  body('projectDetails.techStack').optional().trim().isLength({ max: 1000 }).withMessage('Tech stack must be less than 1000 characters'),
  body('projectDetails.complexityLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Complexity level must be beginner, intermediate, or advanced'),
  body('projectDetails.installationInstructions').optional().trim().isLength({ max: 2000 }).withMessage('Installation instructions must be less than 2000 characters'),
  body('projectDetails.usageInstructions').optional().trim().isLength({ max: 2000 }).withMessage('Usage instructions must be less than 2000 characters'),
  body('projectDetails.prerequisites').optional().trim().isLength({ max: 1000 }).withMessage('Prerequisites must be less than 1000 characters')
];

const updateProjectValidation = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 10000 }).withMessage('Description must be 10-10000 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('githubRepo').optional({ checkFalsy: true }).isURL().withMessage('GitHub repo must be a valid URL'),
  body('category').optional().isIn(['web', 'mobile', 'desktop', 'ai-ml', 'blockchain', 'game', 'other']),
  body('tags').optional().custom(validateTags).withMessage('Tags must be an array or valid JSON array string'),
  // New enhanced project information validation for updates
  body('completionStatus').optional().isInt({ min: 0, max: 100 }).withMessage('Completion status must be between 0 and 100'),
  body('projectDetails.timeline').optional().trim().isLength({ max: 500 }).withMessage('Timeline must be less than 500 characters'),
  body('projectDetails.techStack').optional().trim().isLength({ max: 1000 }).withMessage('Tech stack must be less than 1000 characters'),
  body('projectDetails.complexityLevel').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Complexity level must be beginner, intermediate, or advanced'),
  body('projectDetails.installationInstructions').optional().trim().isLength({ max: 2000 }).withMessage('Installation instructions must be less than 2000 characters'),
  body('projectDetails.usageInstructions').optional().trim().isLength({ max: 2000 }).withMessage('Usage instructions must be less than 2000 characters'),
  body('projectDetails.prerequisites').optional().trim().isLength({ max: 1000 }).withMessage('Prerequisites must be less than 1000 characters')
];

// Helper function to get image URL for serving
const getImageUrl = (filename) => {
  // Use relative URLs so they work with Vite proxy in development
  // and can be configured for production
  return `/api/projects/images/${filename}`;
};

// Handle preflight requests for images
// Enhanced CORS preflight handler for images
router.options('/images/:filename', (req, res) => {
  const origin = req.get('Origin');
  const filename = req.params.filename;

  console.log(`🔄 CORS preflight for image: ${filename} from origin: ${origin || 'no-origin'}`);

  // Set comprehensive CORS headers for preflight
  if (origin) {
    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // Check against allowed origins or allow all in development
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ];

      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
    }
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours cache
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Last-Modified, ETag');

  console.log(`✅ CORS preflight response sent for ${filename}`);
  res.sendStatus(200);
});

// Enhanced image serving with comprehensive CORS support
router.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(uploadsDir, filename);
  const origin = req.get('Origin');

  console.log(`🖼️  Image request: ${filename} from origin: ${origin || 'no-origin'}`);

  // Check if file exists first
  if (!fs.existsSync(imagePath)) {
    console.log(`❌ Image not found: ${imagePath}`);

    // Set CORS headers even for 404 responses
    if (origin) {
      if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        res.header('Access-Control-Allow-Origin', origin);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
      }
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Set aggressive CORS headers for image serving - always allow in development
  if (process.env.NODE_ENV !== 'production') {
    // In development, be very permissive
    res.header('Access-Control-Allow-Origin', '*');
    console.log(`✅ CORS: Using wildcard for development image serving`);
  } else {
    // Production - be more selective
    if (origin) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174'
      ];

      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`✅ CORS: Allowing whitelisted origin: ${origin}`);
      } else {
        res.header('Access-Control-Allow-Origin', '*');
        console.log(`⚠️  CORS: Using wildcard for unknown origin: ${origin}`);
      }
    } else {
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`✅ CORS: No origin header, using wildcard`);
    }
  }

  // Set comprehensive CORS headers for images
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Pragma, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Last-Modified, ETag, Cache-Control');
  res.header('Access-Control-Max-Age', '86400');

  // Additional headers to prevent CORS issues with browser image loading
  res.header('Vary', 'Origin');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');

  // Remove problematic security headers for images
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Cross-Origin-Opener-Policy');

  // Set proper content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon'
  };

  if (contentTypes[ext]) {
    res.setHeader('Content-Type', contentTypes[ext]);
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
  }

  // Set caching headers for better performance
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // 24 hours with immutable
  res.setHeader('ETag', `"${filename}-${Date.now()}"`);

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');

  console.log(`✅ Serving image with CORS headers: ${filename}`);
  res.sendFile(imagePath);
});

// Serve optimized images with caching
router.get('/images/optimized/:filename', imageCacheMiddleware(86400), (req, res) => {
  const filename = req.params.filename;
  const optimizedPath = path.join(process.cwd(), 'uploads', 'optimized', filename);
  const origin = req.get('Origin');

  console.log(`🖼️  Optimized image request: ${filename} from origin: ${origin || 'no-origin'}`);

  // Check if optimized file exists
  if (!fs.existsSync(optimizedPath)) {
    console.log(`❌ Optimized image not found: ${filename}`);
    return res.status(404).json({
      success: false,
      message: 'Optimized image not found'
    });
  }

  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Last-Modified, ETag');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');

  // Set content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
  };

  if (contentTypes[ext]) {
    res.setHeader('Content-Type', contentTypes[ext]);
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
  }

  // Set aggressive caching headers for optimized images
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year cache
  res.setHeader('ETag', `"optimized-${filename}-${Date.now()}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  console.log(`✅ Serving optimized image: ${filename}`);
  res.sendFile(optimizedPath);
});

// Serve documentation files with proper CORS headers and purchase verification
router.get('/docs/:filename', verifyToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const userId = req.user._id;
    const docPath = path.join(uploadsDir, 'docs', filename);

    console.log(`📄 Documentation download request: ${filename} by user ${userId}`);

    // Check if file exists
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({
        success: false,
        message: 'Documentation file not found'
      });
    }

    // Find the project that contains this documentation file
    const project = await Project.findOne({
      'documentationFiles.filename': filename
    }).populate('seller', 'displayName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found for this documentation file'
      });
    }

    console.log(`📚 Found project: ${project.title} by ${project.seller?.email}`);

    // Check if user is the seller (always allowed)
    if (project.seller._id.toString() === userId.toString()) {
      console.log('✅ Access granted: User is the seller');
    } else {
      // Check if user has purchased this project
      const hasPurchased = project.buyers && project.buyers.some(buyer =>
        buyer.user.toString() === userId.toString()
      );

      if (!hasPurchased) {
        console.log('❌ Access denied: User has not purchased this project');
        return res.status(403).json({
          success: false,
          message: 'You must purchase this project to download documentation files'
        });
      }

      console.log('✅ Access granted: User has purchased this project');
    }

    // Find the specific documentation file to get original name
    const docFile = project.documentationFiles.find(doc => doc.filename === filename);
    const originalName = docFile ? docFile.originalName : path.basename(filename);

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'false');

    // Set proper content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.md': 'text/markdown',
      '.txt': 'text/plain'
    };

    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }

    // Set content disposition to trigger download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);

    console.log('📁 Serving documentation file:', docPath);
    res.sendFile(docPath);

  } catch (error) {
    console.error('Error serving documentation file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving documentation file'
    });
  }
});

// GET /api/projects/download/:filename - Secure ZIP file download (requires purchase)
router.get('/download/:filename', verifyToken, async (req, res) => {
  try {
    const filename = req.params.filename;
    const userId = req.user._id;

    console.log(`🔐 ZIP download request: ${filename} by user ${userId}`);

    // Find the project that contains this ZIP file
    const project = await Project.findOne({
      'projectZipFile.filename': filename
    }).populate('seller', 'displayName email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project file not found'
      });
    }

    console.log(`📦 Found project: ${project.title} by ${project.seller?.email}`);

    // Check if user is the seller (always allowed)
    if (project.seller._id.toString() === userId.toString()) {
      console.log('✅ Access granted: User is the seller');
    } else {
      // Check if user has purchased this project
      const hasPurchased = project.buyers && project.buyers.some(buyer =>
        buyer.user.toString() === userId.toString()
      );

      if (!hasPurchased) {
        console.log('❌ Access denied: User has not purchased this project');
        return res.status(403).json({
          success: false,
          message: 'You must purchase this project to download the source code'
        });
      }

      console.log('✅ Access granted: User has purchased this project');
    }

    // Construct file path
    const filePath = path.join(uploadsDir, 'projects', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found on disk:', filePath);
      return res.status(404).json({
        success: false,
        message: 'Project file not found on server'
      });
    }

    console.log('📁 Serving file:', filePath);

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${project.projectZipFile.originalName}"`);
    res.setHeader('Content-Type', 'application/zip');

    // Serve the file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error serving ZIP file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving project file'
    });
  }
});

// GET /api/projects/debug - Debug endpoint to test authentication
router.get('/debug', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      displayName: req.user.displayName
    }
  });
});

// GET /api/projects - Get all approved projects (public) with caching
router.get('/', projectCacheMiddleware(1800), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const filters = { status: 'approved' };

    if (category) filters.category = category;
    if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
    if (featured === 'true') filters.featured = true;

    let query = Project.find(filters).populate('seller', 'displayName photoURL');

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    const projects = await query.exec();
    const total = await Project.countDocuments(filters);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects'
    });
  }
});

// GET /api/projects/my - Get current user's projects
router.get('/my', verifyToken, async (req, res) => {
  try {
    const projects = await Project.findBySeller(req.user._id);

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your projects'
    });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid project ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
          errors: errors.array()
        });
      }

      const project = await Project.findById(req.params.id)
        .populate('seller', 'displayName email photoURL')
        .populate('buyers.user', 'displayName');

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Log project ZIP file info for debugging
      console.log(`📦 Project ${project.title} ZIP file info:`, {
        hasZipFile: !!project.projectZipFile,
        zipFile: project.projectZipFile
      });

      // Increment view count
      await project.incrementViews();

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching project'
      });
    }
  }
);

// Conditional multer middleware - only apply for multipart requests with error handling
const conditionalUpload = (req, res, next) => {
  const contentType = req.get('Content-Type') || '';

  // Only apply multer for multipart/form-data requests
  if (contentType.includes('multipart/form-data')) {
    console.log('🔄 Applying multer middleware for multipart request');

    // Wrap multer in error handling
    const multerMiddleware = uploadCombined.fields([
      { name: 'images', maxCount: 5 },
      { name: 'documentationFiles', maxCount: 10 },
      { name: 'projectZipFile', maxCount: 1 }
    ]);

    return multerMiddleware(req, res, (err) => {
      if (err) {
        console.log('❌ Multer middleware error:', err.message);
        // If multer fails, continue without files but log the error
        console.log('⚠️ Continuing without file upload support');
        req.files = {}; // Ensure req.files exists but is empty
        next();
      } else {
        console.log('✅ Multer middleware completed successfully');
        next();
      }
    });
  }

  // For JSON requests, skip multer
  console.log('⏭️ Skipping multer middleware for JSON request');
  next();
};

// POST /api/projects - Create new project with cache invalidation
router.post('/',
  verifyToken,
  requireRole(['seller']),
  conditionalUpload,
  createProjectValidation,
  invalidateCache(['projectbuzz:projects:*', 'projectbuzz:featured:*', 'projectbuzz:stats:*']),
  async (req, res) => {
    try {
      console.log('=== POST /api/projects - CREATE PROJECT ===');
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      console.log('User ID:', req.user?._id);
      console.log('User role:', req.user?.role);
      console.log('User email:', req.user?.email);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Validate file sizes after upload
      if (req.files) {
        // Check image file sizes
        if (req.files.images) {
          for (const file of req.files.images) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
              return res.status(400).json({
                success: false,
                message: `Image file "${file.originalname}" is too large. Maximum size is 5MB.`
              });
            }
          }
        }

        // Check documentation file sizes
        if (req.files.documentationFiles) {
          for (const file of req.files.documentationFiles) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
              return res.status(400).json({
                success: false,
                message: `Documentation file "${file.originalname}" is too large. Maximum size is 10MB.`
              });
            }
          }
        }

        // Check ZIP file size
        if (req.files.projectZipFile) {
          for (const file of req.files.projectZipFile) {
            if (file.size > 100 * 1024 * 1024) { // 100MB
              return res.status(400).json({
                success: false,
                message: `ZIP file "${file.originalname}" is too large. Maximum size is 100MB.`
              });
            }
          }
        }
      }

      // User is already available from verifyToken middleware
      const user = req.user;

      // Handle tags array properly (could come as tags[] from FormData)
      let tags = [];
      if (req.body.tags) {
        if (Array.isArray(req.body.tags)) {
          tags = req.body.tags;
        } else if (typeof req.body.tags === 'string') {
          try {
            // Try to parse as JSON first
            tags = JSON.parse(req.body.tags);
          } catch {
            // If not JSON, treat as comma-separated string
            tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }
        }
      }

      // Create project data
      const projectData = {
        title: req.body.title,
        description: req.body.description,
        price: parseFloat(req.body.price),
        githubRepo: req.body.githubRepo && req.body.githubRepo.trim() ? req.body.githubRepo.trim() : undefined,
        demoUrl: req.body.demoUrl && req.body.demoUrl.trim() ? req.body.demoUrl.trim() : undefined,
        category: req.body.category || 'other',
        tags: tags,
        seller: user._id,
        status: 'pending',
        // New enhanced project information fields
        completionStatus: req.body.completionStatus ? parseInt(req.body.completionStatus) : 100,
        projectDetails: {
          timeline: req.body['projectDetails.timeline'] || req.body.timeline || '',
          techStack: req.body['projectDetails.techStack'] || req.body.techStack || '',
          complexityLevel: req.body['projectDetails.complexityLevel'] || req.body.complexityLevel || 'intermediate',
          installationInstructions: req.body['projectDetails.installationInstructions'] || req.body.installationInstructions || '',
          usageInstructions: req.body['projectDetails.usageInstructions'] || req.body.usageInstructions || '',
          prerequisites: req.body['projectDetails.prerequisites'] || req.body.prerequisites || ''
        }
      };

      // Add images data if uploaded
      if (req.files && req.files.images && req.files.images.length > 0) {
        // Process and optimize images
        const optimizedImages = [];

        for (const [index, file] of req.files.images.entries()) {
          try {
            // Optimize image if it's large enough
            let optimizationResults = null;
            if (file.path && imageOptimizationService.needsOptimization(file.path)) {
              console.log(`🔄 Optimizing image: ${file.originalname}`);
              optimizationResults = await imageOptimizationService.optimizeImage(file.path, file.filename);
            }

            const imageData = {
              filename: file.filename,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: getImageUrl(file.filename),
              uploadedAt: new Date(),
              isPrimary: index === 0, // First image is primary
              order: index,
              optimized: optimizationResults ? {
                available: true,
                formats: Object.keys(optimizationResults.optimized),
                sources: imageOptimizationService.getResponsiveImageSources(file.filename)
              } : { available: false }
            };

            optimizedImages.push(imageData);
          } catch (optimizationError) {
            console.error(`❌ Image optimization failed for ${file.originalname}:`, optimizationError.message);

            // Continue with unoptimized image
            optimizedImages.push({
              filename: file.filename,
              originalName: file.originalname,
              mimetype: file.mimetype,
              size: file.size,
              url: getImageUrl(file.filename),
              uploadedAt: new Date(),
              isPrimary: index === 0,
              order: index,
              optimized: { available: false }
            });
          }
        }

        projectData.images = optimizedImages;

        // Set first image as main image for backward compatibility
        projectData.image = {
          filename: req.files.images[0].filename,
          originalName: req.files.images[0].originalname,
          mimetype: req.files.images[0].mimetype,
          size: req.files.images[0].size,
          url: getImageUrl(req.files.images[0].filename),
          uploadedAt: new Date()
        };
      }

      // Add documentation files if uploaded
      if (req.files && req.files.documentationFiles && req.files.documentationFiles.length > 0) {
        projectData.documentationFiles = req.files.documentationFiles.map((file, index) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/api/projects/docs/${file.filename}`,
          uploadedAt: new Date(),
          fileType: req.body[`docType_${index}`] || 'technical', // Default to technical documentation
          description: req.body[`docDescription_${index}`] || ''
        }));
      }

      // Add project ZIP file if uploaded
      if (req.files && req.files.projectZipFile && req.files.projectZipFile.length > 0) {
        const zipFile = req.files.projectZipFile[0];

        // Handle zipDescription - it might come as an array from FormData
        let zipDescription = 'Project source code and assets';
        if (req.body.zipDescription) {
          if (Array.isArray(req.body.zipDescription)) {
            zipDescription = req.body.zipDescription[0] || zipDescription;
          } else {
            zipDescription = req.body.zipDescription;
          }
        }

        projectData.projectZipFile = {
          filename: zipFile.filename,
          originalName: zipFile.originalname,
          mimetype: zipFile.mimetype,
          size: zipFile.size,
          url: `/api/projects/download/${zipFile.filename}`,
          uploadedAt: new Date(),
          description: String(zipDescription) // Ensure it's a string
        };
        console.log('📦 ZIP file uploaded:', projectData.projectZipFile);
      }

      const project = new Project(projectData);
      await project.save();

      await project.populate('seller', 'displayName email');

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('=== ERROR CREATING PROJECT ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error code:', error.code);
      console.error('User:', req.user?.email);
      console.error('Request body keys:', Object.keys(req.body || {}));
      console.error('Request body:', req.body);
      console.error('Request files:', req.files);
      console.error('Full error:', error);

      // Log specific validation errors
      if (error.name === 'ValidationError') {
        console.error('Mongoose validation errors:', error.errors);
      }

      // Check if it's a multer error
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Please check file size limits.',
          error: 'FILE_TOO_LARGE'
        });
      }

      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please check your file uploads.',
          error: 'UNEXPECTED_FILE'
        });
      }

      // Check if it's a validation error
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        });
      }

      // Check if it's a MongoDB error
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: 'DATABASE_ERROR'
        });
      }

      // Check if it's a cast error (invalid ObjectId, etc.)
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Invalid data format',
          error: 'CAST_ERROR',
          details: `Invalid ${error.kind} for field ${error.path}`
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creating project',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

// PUT /api/projects/:id - Update project
router.put('/:id',
  verifyToken,
  requireRole(['seller']),
  updateProjectValidation,
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

      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own projects'
        });
      }

      // Update allowed fields
      const allowedUpdates = ['title', 'description', 'price', 'githubRepo', 'category', 'tags', 'completionStatus'];
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          project[field] = req.body[field];
        }
      });

      // Update project details if provided
      if (req.body.projectDetails || req.body.timeline || req.body.techStack || req.body.complexityLevel ||
          req.body.installationInstructions || req.body.usageInstructions || req.body.prerequisites) {
        project.projectDetails = {
          ...project.projectDetails,
          timeline: req.body['projectDetails.timeline'] || req.body.timeline || project.projectDetails?.timeline || '',
          techStack: req.body['projectDetails.techStack'] || req.body.techStack || project.projectDetails?.techStack || '',
          complexityLevel: req.body['projectDetails.complexityLevel'] || req.body.complexityLevel || project.projectDetails?.complexityLevel || 'intermediate',
          installationInstructions: req.body['projectDetails.installationInstructions'] || req.body.installationInstructions || project.projectDetails?.installationInstructions || '',
          usageInstructions: req.body['projectDetails.usageInstructions'] || req.body.usageInstructions || project.projectDetails?.usageInstructions || '',
          prerequisites: req.body['projectDetails.prerequisites'] || req.body.prerequisites || project.projectDetails?.prerequisites || ''
        };
      }

      await project.save();
      await project.populate('seller', 'displayName email');

      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating project'
      });
    }
  }
);

// DELETE /api/projects/:id - Delete project
router.delete('/:id',
  verifyToken,
  requireRole(['seller']),
  param('id').isMongoId().withMessage('Invalid project ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
          errors: errors.array()
        });
      }

      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own projects'
        });
      }

      // Delete image file if exists
      if (project.image && project.image.filename) {
        try {
          const imagePath = path.join(uploadsDir, project.image.filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.warn('Could not delete image file:', error.message);
        }
      }

      await Project.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting project'
      });
    }
  }
);

// POST /api/projects/:id/purchase - Purchase a project (DEPRECATED - Use payment flow)
router.post('/:id/purchase',
  verifyToken,
  requireRole(['buyer']),
  param('id').isMongoId().withMessage('Invalid project ID'),
  async (req, res) => {
    try {
      // This endpoint is deprecated in favor of the payment flow
      // Redirect users to use the payment API
      res.status(400).json({
        success: false,
        message: 'Direct purchase is no longer supported. Please use the payment flow.',
        redirectTo: '/api/payments/create-order',
        data: {
          projectId: req.params.id,
          instructions: 'Use POST /api/payments/create-order with projectId in the body'
        }
      });
    } catch (error) {
      console.error('Error in deprecated purchase endpoint:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing request'
      });
    }
  }
);

// GET /api/projects/:id/access - Get GitHub access for purchased project
router.get('/:id/access',
  verifyToken,
  param('id').isMongoId().withMessage('Invalid project ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID',
          errors: errors.array()
        });
      }

      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user purchased this project or is the seller
      const user = req.user;
      const isPurchaser = project.buyers.some(
        buyer => buyer.user.toString() === user._id.toString()
      );
      const isSeller = project.seller.toString() === user._id.toString();

      if (!isPurchaser && !isSeller) {
        return res.status(403).json({
          success: false,
          message: 'You must purchase this project to access it'
        });
      }

      // Increment access count
      await project.incrementDownloads(user._id);

      res.json({
        success: true,
        data: {
          githubRepo: project.githubRepo,
          demoUrl: project.demoUrl,
          message: 'You now have access to this project. The seller will provide you access to the private GitHub repository.',
          instructions: 'Contact the seller with your GitHub username to get repository access.'
        }
      });
    } catch (error) {
      console.error('Error accessing project:', error);
      res.status(500).json({
        success: false,
        message: 'Error accessing project'
      });
    }
  }
);

// POST /api/projects/:id/images - Add images to existing project
router.post('/:id/images',
  verifyToken,
  requireRole(['seller']),
  upload.array('images', 5),
  param('id').isMongoId().withMessage('Invalid project ID'),
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

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only add images to your own projects'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No images provided'
        });
      }

      // Check if adding these images would exceed the limit
      if (project.images.length + req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${req.files.length} images. Maximum 5 images allowed per project. Current: ${project.images.length}`
        });
      }

      // Add each image
      const addedImages = [];
      for (const file of req.files) {
        const imageData = {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: getImageUrl(file.filename)
        };

        await project.addImage(imageData, false);
        addedImages.push(imageData);
      }

      await project.populate('seller', 'displayName email');

      res.json({
        success: true,
        message: `${addedImages.length} image(s) added successfully`,
        data: {
          project,
          addedImages
        }
      });

    } catch (error) {
      console.error('Error adding images to project:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error adding images to project'
      });
    }
  }
);

// DELETE /api/projects/:id/images/:imageId - Remove image from project
router.delete('/:id/images/:imageId',
  verifyToken,
  requireRole(['seller']),
  param('id').isMongoId().withMessage('Invalid project ID'),
  param('imageId').isMongoId().withMessage('Invalid image ID'),
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

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only remove images from your own projects'
        });
      }

      await project.removeImage(req.params.imageId);
      await project.populate('seller', 'displayName email');

      res.json({
        success: true,
        message: 'Image removed successfully',
        data: project
      });

    } catch (error) {
      console.error('Error removing image from project:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error removing image from project'
      });
    }
  }
);

// PUT /api/projects/:id/images/:imageId/primary - Set image as primary
router.put('/:id/images/:imageId/primary',
  verifyToken,
  requireRole(['seller']),
  param('id').isMongoId().withMessage('Invalid project ID'),
  param('imageId').isMongoId().withMessage('Invalid image ID'),
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

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own projects'
        });
      }

      await project.setPrimaryImage(req.params.imageId);
      await project.populate('seller', 'displayName email');

      res.json({
        success: true,
        message: 'Primary image updated successfully',
        data: project
      });

    } catch (error) {
      console.error('Error setting primary image:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error setting primary image'
      });
    }
  }
);

// PUT /api/projects/:id/images/reorder - Reorder project images
router.put('/:id/images/reorder',
  verifyToken,
  requireRole(['seller']),
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('imageOrders').isArray().withMessage('Image orders must be an array'),
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

      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      // Check if user owns this project
      if (project.seller.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own projects'
        });
      }

      await project.reorderImages(req.body.imageOrders);
      await project.populate('seller', 'displayName email');

      res.json({
        success: true,
        message: 'Images reordered successfully',
        data: project
      });

    } catch (error) {
      console.error('Error reordering images:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error reordering images'
      });
    }
  }
);

export default router;