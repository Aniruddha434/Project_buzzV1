import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Payment from '../models/Payment.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('displayName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Display name must be between 1 and 50 characters'),
  body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Role must be buyer, seller, or admin'),
  body('profile.bio').optional().trim().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('profile.location').optional().trim().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('profile.website').optional().isURL().withMessage('Website must be a valid URL'),
  body('profile.socialLinks.github').optional().isURL().withMessage('GitHub URL must be valid'),
  body('profile.socialLinks.linkedin').optional().isURL().withMessage('LinkedIn URL must be valid'),
  body('profile.socialLinks.twitter').optional().isURL().withMessage('Twitter URL must be valid')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
];

// GET /api/users/me - Get current user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    console.log('GET /api/users/me - User ID:', req.user._id);
    console.log('GET /api/users/me - User data:', {
      email: req.user.email,
      role: req.user.role,
      displayName: req.user.displayName
    });

    // User is already available from verifyToken middleware
    const user = req.user;

    // Debug: Log user stats
    console.log('📊 User stats from database:', user.stats);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

// PUT /api/users/me - Update current user profile
router.put('/me',
  verifyToken,
  updateProfileValidation,
  async (req, res) => {
    try {
      console.log('PUT /api/users/me - User ID:', req.user._id);
      console.log('PUT /api/users/me - Request body:', req.body);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const user = req.user;

      // Update allowed fields (including role)
      const allowedUpdates = ['displayName', 'profile', 'preferences', 'role'];
      let hasUpdates = false;
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          hasUpdates = true;
          if (field === 'profile') {
            // Merge nested objects for profile
            user[field] = { ...user[field], ...req.body[field] };
          } else if (field === 'preferences') {
            // Simple merge for preferences (simplified structure)
            user[field] = { ...user[field], ...req.body[field] };
          } else {
            user[field] = req.body[field];
          }
        }
      });

      console.log('Updating user role to:', req.body.role || 'no role change');
      console.log('Has updates:', hasUpdates);

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile'
      });
    }
  }
);

// PUT /api/users/me/password - Change user password
router.put('/me/password',
  verifyToken,
  changePasswordValidation,
  async (req, res) => {
    try {
      console.log('PUT /api/users/me/password - User ID:', req.user._id);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Error changing password'
      });
    }
  }
);

// GET /api/users/me/purchases - Get user's purchased projects
router.get('/me/purchases', verifyToken, async (req, res) => {
  try {
    const user = req.user;

    // Get projects where user is in buyers array
    const purchases = await Project.find({
      'buyers.user': user._id
    }).populate('seller', 'displayName photoURL');

    // Get actual purchase count from Payment collection for accuracy
    const actualPurchaseCount = await Payment.countDocuments({
      user: user._id,
      status: 'PAID'
    });

    console.log(`📊 Purchase data for user ${user._id}:`, {
      projectsWithUserInBuyers: purchases.length,
      actualPaidPayments: actualPurchaseCount,
      userStatsCount: user.stats?.projectsPurchased || 0
    });

    res.json({
      success: true,
      data: {
        purchases: purchases,
        count: actualPurchaseCount,
        metadata: {
          projectsFound: purchases.length,
          userStatsCount: user.stats?.projectsPurchased || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchases'
    });
  }
});

// GET /api/users/me/sales - Get user's sold projects (for sellers)
router.get('/me/sales',
  verifyToken,
  requireRole(['seller']),
  async (req, res) => {
    try {
      const projects = await Project.find({ seller: req.user._id })
        .populate('buyers.user', 'displayName email');

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error fetching user sales:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales'
      });
    }
  }
);

// GET /api/users/me/stats - Get user statistics
router.get('/me/stats', verifyToken, async (req, res) => {
  try {
    console.log('GET /api/users/me/stats - User ID:', req.user._id);
    const user = req.user;

    console.log('Found user for stats:', user._id);
    console.log('📊 User stats from /me/stats endpoint:', user.stats);

    // Get additional stats from projects
    const projectStats = await Project.aggregate([
      { $match: { seller: user._id } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          approvedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalViews: { $sum: '$stats.views' },
          totalDownloads: { $sum: '$stats.downloads' }
        }
      }
    ]);

    const stats = {
      ...user.stats,
      projects: projectStats[0] || {
        totalProjects: 0,
        approvedProjects: 0,
        pendingProjects: 0,
        totalViews: 0,
        totalDownloads: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// GET /api/users/debug/:id - Debug user stats (development only)
router.get('/debug/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`📊 Debug stats for user ${req.params.id}:`, user.stats);

      res.json({
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          role: user.role,
          stats: user.stats
        }
      });
    } catch (error) {
      console.error('Error fetching user debug info:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user debug info'
      });
    }
  }
);

// POST /api/users/debug/:id/fix-stats - Fix user stats (development only)
router.post('/debug/:id/fix-stats',
  param('id').isMongoId().withMessage('Invalid user ID'),
  async (req, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`📊 Before fixing stats for user ${req.params.id}:`, user.stats);

      // Count actual purchases from Payment collection
      const purchaseCount = await Payment.countDocuments({
        user: user._id,
        status: 'PAID'
      });

      // Calculate total spent
      const purchaseStats = await Payment.aggregate([
        { $match: { user: user._id, status: 'PAID' } },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
      ]);

      const totalSpent = purchaseStats[0]?.totalSpent || 0;

      // Count projects where user is in buyers array
      const projectsWithUserInBuyers = await Project.countDocuments({
        'buyers.user': user._id
      });

      // Store old stats for comparison
      const oldStats = { ...user.stats };

      // Update user stats
      user.stats.projectsPurchased = purchaseCount;
      user.stats.totalSpent = totalSpent;
      await user.save();

      console.log(`✅ Fixed stats for user ${req.params.id}: ${purchaseCount} purchases, ₹${totalSpent} spent`);
      console.log(`📊 After fixing stats for user ${req.params.id}:`, user.stats);

      res.json({
        success: true,
        data: {
          userId: user._id,
          email: user.email,
          role: user.role,
          oldStats: oldStats,
          newStats: {
            projectsPurchased: purchaseCount,
            totalSpent: totalSpent
          },
          analysis: {
            paidPayments: purchaseCount,
            projectsWithUserInBuyers: projectsWithUserInBuyers,
            discrepancy: Math.abs(purchaseCount - projectsWithUserInBuyers),
            wasFixed: oldStats.projectsPurchased !== purchaseCount
          },
          message: 'Stats fixed successfully'
        }
      });
    } catch (error) {
      console.error('Error fixing user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fixing user stats'
      });
    }
  }
);

// POST /api/users/me/fix-stats - Fix current user's stats
router.post('/me/fix-stats', verifyToken, async (req, res) => {
  try {
    const user = req.user;

    console.log(`📊 Before fixing stats for current user ${user._id}:`, user.stats);

    // Count actual purchases from Payment collection
    const purchaseCount = await Payment.countDocuments({
      user: user._id,
      status: 'PAID'
    });

    // Calculate total spent
    const purchaseStats = await Payment.aggregate([
      { $match: { user: user._id, status: 'PAID' } },
      { $group: { _id: null, totalSpent: { $sum: '$amount' } } }
    ]);

    const totalSpent = purchaseStats[0]?.totalSpent || 0;

    // Count projects where user is in buyers array
    const projectsWithUserInBuyers = await Project.countDocuments({
      'buyers.user': user._id
    });

    // Store old stats for comparison
    const oldStats = { ...user.stats };

    // Update user stats
    user.stats.projectsPurchased = purchaseCount;
    user.stats.totalSpent = totalSpent;
    await user.save();

    console.log(`✅ Fixed stats for current user ${user._id}: ${purchaseCount} purchases, ₹${totalSpent} spent`);

    res.json({
      success: true,
      data: {
        oldStats: oldStats,
        newStats: {
          projectsPurchased: purchaseCount,
          totalSpent: totalSpent
        },
        analysis: {
          paidPayments: purchaseCount,
          projectsWithUserInBuyers: projectsWithUserInBuyers,
          discrepancy: Math.abs(purchaseCount - projectsWithUserInBuyers),
          wasFixed: oldStats.projectsPurchased !== purchaseCount
        },
        message: 'Your purchase stats have been updated successfully'
      }
    });
  } catch (error) {
    console.error('Error fixing current user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing user stats'
    });
  }
});

// GET /api/users/:id - Get public user profile
router.get('/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: errors.array()
        });
      }

      const user = await User.findById(req.params.id).select('-preferences -stats.totalSpent -stats.totalEarned');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Public profiles are now always accessible (simplified)

      // Get user's approved projects if they're a seller
      let projects = [];
      if (user.role === 'seller') {
        projects = await Project.find({
          seller: user._id,
          status: 'approved'
        }).select('title description price category tags stats createdAt');
      }

      res.json({
        success: true,
        data: {
          user,
          projects
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile'
      });
    }
  }
);

// Admin routes
// GET /api/users - Get all users (admin only)
router.get('/',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, role, search } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (search) {
        filters.$or = [
          { displayName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const users = await User.find(filters)
        .select('-preferences')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(filters);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users'
      });
    }
  }
);

export default router;
