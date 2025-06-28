import express from 'express';
import { body, validationResult, param, query } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Create admin route (no auth required for first admin creation)
router.post('/create-admin',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').notEmpty().withMessage('Display name is required'),
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

      // Check if any admin users already exist
      const existingAdmins = await User.countDocuments({ role: 'admin' });
      if (existingAdmins > 0) {
        return res.status(403).json({
          success: false,
          message: 'Admin users already exist. Contact existing admin for access.'
        });
      }

      const { email, password, displayName } = req.body;

      // Create user in Firebase Auth first
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true // Admin users are pre-verified
      });

      // Set custom claims for admin role
      await auth.setCustomUserClaims(firebaseUser.uid, {
        role: 'admin',
        isAdmin: true
      });

      // Create admin user in database with real Firebase UID
      const adminUser = new User({
        firebaseUid: firebaseUser.uid,
        email,
        displayName,
        role: 'admin',
        emailVerified: true,
        stats: {
          totalSpent: 0,
          totalEarned: 0,
          projectsPurchased: 0,
          projectsSold: 0
        }
      });

      await adminUser.save();

      // Also create user document in Firestore for consistency
      await firestore.collection('users').doc(firebaseUser.uid).set({
        email,
        displayName,
        role: 'admin',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully. You can now login with these credentials.',
        data: {
          id: adminUser._id,
          firebaseUid: firebaseUser.uid,
          email: adminUser.email,
          displayName: adminUser.displayName,
          role: adminUser.role
        }
      });
    } catch (error) {
      console.error('Error creating admin user:', error);

      // Handle specific Firebase errors
      let message = 'Error creating admin user';
      if (error.code === 'auth/email-already-exists') {
        message = 'An account with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      }

      res.status(500).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// All other admin routes require admin role
router.use(verifyToken);
router.use(requireRole(['admin']));

// GET /api/admin/stats - Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const [userStats, projectStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalBuyers: { $sum: { $cond: [{ $eq: ['$role', 'buyer'] }, 1, 0] } },
            totalSellers: { $sum: { $cond: [{ $eq: ['$role', 'seller'] }, 1, 0] } },
            totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            totalRevenue: { $sum: '$stats.totalSpent' },
            newUsersThisMonth: {
              $sum: {
                $cond: [
                  {
                    $gte: [
                      '$createdAt',
                      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      Project.aggregate([
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            pendingProjects: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            approvedProjects: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejectedProjects: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            totalSales: { $sum: { $size: { $ifNull: ['$buyers', []] } } },
            totalViews: { $sum: '$stats.views' },
            totalDownloads: { $sum: '$stats.downloads' },
            totalRevenue: {
              $sum: {
                $multiply: [
                  { $size: { $ifNull: ['$buyers', []] } },
                  '$price'
                ]
              }
            }
          }
        }
      ])
    ]);

    const stats = {
      users: userStats[0] || {
        totalUsers: 0,
        totalBuyers: 0,
        totalSellers: 0,
        totalAdmins: 0,
        newUsersThisMonth: 0
      },
      projects: projectStats[0] || {
        totalProjects: 0,
        pendingProjects: 0,
        approvedProjects: 0,
        rejectedProjects: 0,
        totalSales: 0,
        totalViews: 0,
        totalDownloads: 0,
        totalRevenue: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics'
    });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {};
    if (role && role !== 'all') filters.role = role;
    if (search) {
      filters.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-preferences');

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
});

// GET /api/admin/projects - Get all projects
router.get('/projects', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {};
    if (status && status !== 'all') filters.status = status;
    if (category && category !== 'all') filters.category = category;
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(filters)
      .populate('seller', 'displayName email photoURL')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

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

// PUT /api/admin/users/:id/role - Update user role
router.put('/users/:id/role',
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role'),
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

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.role = req.body.role;
      await user.save();

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user role'
      });
    }
  }
);

// PUT /api/admin/projects/:id/status - Update project status
router.put('/projects/:id/status',
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('status').isIn(['draft', 'pending', 'approved', 'rejected', 'suspended']).withMessage('Invalid status'),
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

      project.status = req.body.status;
      project.updatedAt = new Date();
      await project.save();

      res.json({
        success: true,
        message: 'Project status updated successfully',
        data: project
      });
    } catch (error) {
      console.error('Error updating project status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating project status'
      });
    }
  }
);

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id',
  param('id').isMongoId().withMessage('Invalid user ID'),
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

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Don't allow deleting other admins
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete admin users'
        });
      }

      await User.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting user'
      });
    }
  }
);

// DELETE /api/admin/projects/:id - Delete project (admin only)
router.delete('/projects/:id',
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

      // Admin can delete any project
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

// Email testing routes
// POST /api/admin/test-email - Test email functionality
router.post('/test-email',
  body('email').isEmail().withMessage('Valid email is required'),
  body('type').optional().isIn(['test', 'purchase', 'payment-success', 'sale', 'admin-alert']).withMessage('Invalid email type'),
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

      const { email, type = 'test' } = req.body;

      let result;

      switch (type) {
        case 'test':
          result = await emailService.sendTestEmail(email);
          break;

        case 'purchase':
          const mockUser = { email, displayName: 'Test User' };
          const mockProject = { title: 'Test Project', _id: 'test-project-id' };
          const mockPayment = { orderId: 'TEST-ORDER-123', amount: 999, _id: 'test-payment-id' };
          result = await emailService.sendPurchaseConfirmation(mockUser, mockProject, mockPayment);
          break;

        case 'payment-success':
          const mockUser2 = { email, displayName: 'Test User' };
          const mockProject2 = { title: 'Test Project', _id: 'test-project-id' };
          const mockPayment2 = { orderId: 'TEST-ORDER-123', amount: 999, _id: 'test-payment-id' };
          result = await emailService.sendPaymentSuccess(mockUser2, mockPayment2, mockProject2);
          break;

        case 'sale':
          const seller = { email, displayName: 'Test Seller' };
          const buyer = { email: 'buyer@test.com', displayName: 'Test Buyer' };
          const project = { title: 'Test Project', _id: 'test-project-id' };
          const payment = { orderId: 'TEST-ORDER-123', amount: 999, _id: 'test-payment-id' };
          result = await emailService.sendSaleNotification(seller, buyer, project, payment);
          break;

        case 'admin-alert':
          const admin = { email, displayName: 'Test Admin' };
          result = await emailService.sendAdminAlert(admin, 'Test Alert', { message: 'This is a test admin alert' });
          break;

        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid email type'
          });
      }

      if (result.success) {
        res.json({
          success: true,
          message: `${type} email sent successfully`,
          data: {
            messageId: result.messageId,
            response: result.response
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: `Failed to send ${type} email`,
          error: result.error
        });
      }

    } catch (error) {
      console.error('Error sending test email:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending test email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/admin/email-status - Check email service status
router.get('/email-status', async (req, res) => {
  try {
    const connectionResult = await emailService.verifyConnection();

    res.json({
      success: true,
      data: {
        emailServiceStatus: connectionResult.success ? 'connected' : 'disconnected',
        error: connectionResult.error || null,
        configuration: {
          smtpHost: process.env.SMTP_HOST,
          smtpPort: process.env.SMTP_PORT,
          smtpUser: process.env.SMTP_USER,
          fromEmail: process.env.FROM_EMAIL,
          fromName: process.env.FROM_NAME
        }
      }
    });

  } catch (error) {
    console.error('Error checking email status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
