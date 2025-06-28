import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

/**
 * Admin Management Service
 * Handles admin account creation, invitations, and management
 */

class AdminManagementService {

  /**
   * Validation rules for admin creation
   */
  static getAdminCreationValidation() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),

      body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),

      body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Display name must be between 2-50 characters'),

      body('adminLevel')
        .isIn(['admin', 'super_admin'])
        .withMessage('Admin level must be admin or super_admin'),

      body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array'),

      body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department must be less than 100 characters'),

      body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters')
    ];
  }

  /**
   * Create a new admin account (by existing admin)
   */
  static async createAdmin(adminData, createdBy) {
    try {
      console.log('🔐 Starting admin creation process...');
      console.log('👤 Created by admin:', createdBy);

      // Check if user already exists
      const existingUser = await User.findOne({ email: adminData.email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate required admin fields
      const requiredFields = ['email', 'password', 'displayName', 'adminLevel'];
      for (const field of requiredFields) {
        if (!adminData[field]) {
          throw new Error(`${field} is required for admin creation`);
        }
      }

      // Create admin user
      const newAdmin = new User({
        email: adminData.email.toLowerCase(),
        password: adminData.password,
        displayName: adminData.displayName,
        role: 'admin',
        adminInfo: {
          adminLevel: adminData.adminLevel,
          permissions: adminData.permissions || [
            'view_users', 'view_projects', 'view_payments', 'view_analytics'
          ],
          department: adminData.department || 'General',
          createdBy: createdBy,
          createdAt: new Date(),
          isActive: true,
          notes: adminData.notes || '',
          lastLogin: null,
          loginCount: 0
        },
        emailVerified: true,
        stats: {
          projectsPurchased: 0,
          projectsSold: 0,
          totalSpent: 0,
          totalEarned: 0
        }
      });

      await newAdmin.save();
      console.log('✅ Admin creation successful:', newAdmin._id);

      // Remove password from response
      const adminResponse = newAdmin.toJSON();
      delete adminResponse.password;

      return {
        success: true,
        admin: adminResponse,
        message: 'Admin account created successfully'
      };

    } catch (error) {
      console.error('❌ Admin creation error:', error);
      throw error;
    }
  }

  /**
   * Generate admin invitation token
   */
  static async generateInvitationToken(email, invitedBy, adminLevel = 'admin') {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store invitation in database (you might want to create a separate Invitation model)
      const invitation = {
        email: email.toLowerCase(),
        token,
        adminLevel,
        invitedBy,
        expiresAt,
        used: false,
        createdAt: new Date()
      };

      // For now, we'll store this in the User model as a temporary solution
      // In production, you should create a separate AdminInvitation model
      console.log('📧 Admin invitation generated:', { email, token, expiresAt });

      return {
        success: true,
        invitation,
        invitationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/accept-invitation?token=${token}`,
        message: 'Admin invitation generated successfully'
      };

    } catch (error) {
      console.error('❌ Admin invitation error:', error);
      throw error;
    }
  }

  /**
   * Get all admin users
   */
  static async getAllAdmins() {
    try {
      const admins = await User.find({ role: 'admin' })
        .select('-password')
        .populate('adminInfo.createdBy', 'displayName email')
        .sort({ createdAt: -1 });

      return {
        success: true,
        admins,
        count: admins.length
      };
    } catch (error) {
      console.error('❌ Error getting admins:', error);
      throw error;
    }
  }

  /**
   * Update admin permissions
   */
  static async updateAdminPermissions(adminId, permissions, updatedBy) {
    try {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Admin not found');
      }

      admin.adminInfo.permissions = permissions;
      admin.adminInfo.lastUpdatedBy = updatedBy;
      admin.adminInfo.lastUpdatedAt = new Date();

      await admin.save();

      console.log(`✅ Admin permissions updated: ${adminId}`);

      return {
        success: true,
        admin: admin.toJSON(),
        message: 'Admin permissions updated successfully'
      };

    } catch (error) {
      console.error('❌ Error updating admin permissions:', error);
      throw error;
    }
  }

  /**
   * Deactivate admin account
   */
  static async deactivateAdmin(adminId, deactivatedBy, reason = '') {
    try {
      const admin = await User.findById(adminId);
      if (!admin || admin.role !== 'admin') {
        throw new Error('Admin not found');
      }

      admin.adminInfo.isActive = false;
      admin.adminInfo.deactivatedBy = deactivatedBy;
      admin.adminInfo.deactivatedAt = new Date();
      admin.adminInfo.deactivationReason = reason;
      admin.isActive = false;

      await admin.save();

      console.log(`✅ Admin deactivated: ${adminId}`);

      return {
        success: true,
        message: 'Admin account deactivated successfully'
      };

    } catch (error) {
      console.error('❌ Error deactivating admin:', error);
      throw error;
    }
  }

  /**
   * Validate admin creation data
   */
  static validateAdminData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }

  /**
   * Check if user has admin creation permissions
   */
  static async checkAdminCreationPermission(userId) {
    try {
      console.log('🔍 Checking admin creation permissions for user:', userId);
      const user = await User.findById(userId);

      if (!user || user.role !== 'admin') {
        console.log('❌ User not found or not admin:', { found: !!user, role: user?.role });
        return false;
      }

      console.log('👤 Admin user found:', {
        email: user.email,
        adminLevel: user.adminInfo?.adminLevel,
        permissions: user.adminInfo?.permissions
      });

      // Super admins can always create admins
      if (user.adminInfo?.adminLevel === 'super_admin') {
        console.log('✅ User is super_admin - permission granted');
        return true;
      }

      // Regular admins need specific permission
      const hasPermission = user.adminInfo?.permissions?.includes('create_admin') || false;
      console.log('🔍 Regular admin permission check:', { hasCreateAdminPermission: hasPermission });
      return hasPermission;

    } catch (error) {
      console.error('❌ Error checking admin permissions:', error);
      return false;
    }
  }
}

export default AdminManagementService;
