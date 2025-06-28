import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import AdminManagementService from '../services/adminManagementService.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /api/admin-management/create-admin
 * Create a new admin account (requires admin privileges)
 */
router.post('/create-admin',
  verifyToken,
  requireRole(['admin']),
  AdminManagementService.getAdminCreationValidation(),
  AdminManagementService.validateAdminData,
  async (req, res) => {
    try {
      console.log('\n🔍 ===== ADMIN CREATION REQUEST RECEIVED =====');
      console.log('📝 Request by admin:', req.user.id);
      console.log('📝 Request body keys:', Object.keys(req.body));

      // Check if the requesting admin has permission to create admins
      const hasPermission = await AdminManagementService.checkAdminCreationPermission(req.user.id);
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create admin accounts'
        });
      }

      const result = await AdminManagementService.createAdmin(req.body, req.user.id);

      res.status(201).json(result);

    } catch (error) {
      console.error('\n❌ ===== ADMIN CREATION ERROR =====');
      console.error('Error message:', error.message);

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
        message: 'Internal server error during admin creation'
      });
    }
  }
);

/**
 * POST /api/admin-management/invite-admin
 * Generate admin invitation (requires super admin privileges)
 */
router.post('/invite-admin',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      console.log('\n🔍 ===== ADMIN INVITATION REQUEST RECEIVED =====');

      const { email, adminLevel } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if the requesting admin has permission
      const requestingAdmin = await User.findById(req.user.id);
      if (requestingAdmin.adminInfo?.adminLevel !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can send admin invitations'
        });
      }

      const result = await AdminManagementService.generateInvitationToken(
        email,
        req.user.id,
        adminLevel || 'admin'
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('\n❌ ===== ADMIN INVITATION ERROR =====');
      console.error('Error message:', error.message);

      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during admin invitation'
      });
    }
  }
);

/**
 * GET /api/admin-management/admins
 * Get all admin users (requires admin privileges)
 */
router.get('/admins',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const result = await AdminManagementService.getAllAdmins();
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error getting admins:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving admin users'
      });
    }
  }
);

/**
 * PUT /api/admin-management/admin/:id/permissions
 * Update admin permissions (requires super admin privileges)
 */
router.put('/admin/:id/permissions',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { permissions } = req.body;
      const adminId = req.params.id;

      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions array is required'
        });
      }

      // Check if the requesting admin has permission
      const requestingAdmin = await User.findById(req.user.id);
      if (requestingAdmin.adminInfo?.adminLevel !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can update admin permissions'
        });
      }

      const result = await AdminManagementService.updateAdminPermissions(
        adminId,
        permissions,
        req.user.id
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('❌ Error updating admin permissions:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating admin permissions'
      });
    }
  }
);

/**
 * PUT /api/admin-management/admin/:id/deactivate
 * Deactivate admin account (requires super admin privileges)
 */
router.put('/admin/:id/deactivate',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { reason } = req.body;
      const adminId = req.params.id;

      // Check if the requesting admin has permission
      const requestingAdmin = await User.findById(req.user.id);
      if (requestingAdmin.adminInfo?.adminLevel !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can deactivate admin accounts'
        });
      }

      // Prevent self-deactivation
      if (adminId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own admin account'
        });
      }

      const result = await AdminManagementService.deactivateAdmin(
        adminId,
        req.user.id,
        reason || 'No reason provided'
      );

      res.status(200).json(result);

    } catch (error) {
      console.error('❌ Error deactivating admin:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error deactivating admin account'
      });
    }
  }
);

/**
 * GET /api/admin-management/permissions
 * Get available admin permissions list
 */
router.get('/permissions',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const permissions = [
        { id: 'view_users', name: 'View Users', category: 'Users' },
        { id: 'manage_users', name: 'Manage Users', category: 'Users' },
        { id: 'delete_users', name: 'Delete Users', category: 'Users' },
        { id: 'view_projects', name: 'View Projects', category: 'Projects' },
        { id: 'manage_projects', name: 'Manage Projects', category: 'Projects' },
        { id: 'delete_projects', name: 'Delete Projects', category: 'Projects' },
        { id: 'view_payments', name: 'View Payments', category: 'Payments' },
        { id: 'manage_payments', name: 'Manage Payments', category: 'Payments' },
        { id: 'process_refunds', name: 'Process Refunds', category: 'Payments' },
        { id: 'view_analytics', name: 'View Analytics', category: 'Analytics' },
        { id: 'view_reports', name: 'View Reports', category: 'Analytics' },
        { id: 'export_data', name: 'Export Data', category: 'Analytics' },
        { id: 'manage_admins', name: 'Manage Admins', category: 'Administration' },
        { id: 'create_admin', name: 'Create Admin', category: 'Administration' },
        { id: 'deactivate_admin', name: 'Deactivate Admin', category: 'Administration' },
        { id: 'system_settings', name: 'System Settings', category: 'System' },
        { id: 'email_notifications', name: 'Email Notifications', category: 'System' },
        { id: 'platform_settings', name: 'Platform Settings', category: 'System' }
      ];

      res.status(200).json({
        success: true,
        permissions
      });
    } catch (error) {
      console.error('❌ Error getting permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving permissions'
      });
    }
  }
);

export default router;
