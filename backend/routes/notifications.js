import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { verifyToken, requireRole } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications - Get user notifications
router.get('/',
  verifyToken,
  [
    query('status').optional().isIn(['unread', 'read', 'archived']),
    query('category').optional().isIn(['payment', 'purchase', 'sale', 'admin', 'system', 'account']),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('skip').optional().isInt({ min: 0 }).toInt(),
    query('sort').optional().isIn(['createdAt', '-createdAt', 'priority', '-priority'])
  ],
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

      const {
        status,
        category,
        limit = 20,
        skip = 0,
        sort = '-createdAt'
      } = req.query;

      const sortObj = {};
      if (sort.startsWith('-')) {
        sortObj[sort.substring(1)] = -1;
      } else {
        sortObj[sort] = 1;
      }

      const notifications = await notificationService.getUserNotifications(req.user.id, {
        status,
        category,
        limit,
        skip,
        sort: sortObj
      });

      const unreadCount = await notificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            limit,
            skip,
            hasMore: notifications.length === limit
          }
        }
      });

    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }
);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count',
  verifyToken,
  async (req, res) => {
    try {
      const unreadCount = await notificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: { unreadCount }
      });

    } catch (error) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count'
      });
    }
  }
);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
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

      const notification = await notificationService.markAsRead(req.params.id, req.user.id);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      if (error.message === 'Notification not found') {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }
);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read',
  verifyToken,
  [
    body('category').optional().isIn(['payment', 'purchase', 'sale', 'admin', 'system', 'account'])
  ],
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

      const { category } = req.body;
      const result = await notificationService.markAllAsRead(req.user.id, category);

      res.json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`,
        data: { modifiedCount: result.modifiedCount }
      });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }
);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id',
  verifyToken,
  [
    param('id').isMongoId().withMessage('Invalid notification ID')
  ],
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

      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user.id
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
);

// POST /api/notifications/test - Send test notification (admin only)
router.post('/test',
  verifyToken,
  requireRole(['admin']),
  [
    body('recipientId').isMongoId().withMessage('Invalid recipient ID'),
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
    body('type').isIn([
      'PURCHASE_CONFIRMATION',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'SALE_NOTIFICATION',
      'NEW_USER_REGISTRATION',
      'ADMIN_ALERT',
      'SYSTEM_NOTIFICATION',
      'PROJECT_UPDATE',
      'ACCOUNT_UPDATE'
    ]).withMessage('Invalid notification type'),
    body('category').isIn(['payment', 'purchase', 'sale', 'admin', 'system', 'account']).withMessage('Invalid category'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('sendEmail').optional().isBoolean().withMessage('sendEmail must be boolean')
  ],
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

      const {
        recipientId,
        title,
        message,
        type,
        category,
        priority = 'medium',
        sendEmail = false
      } = req.body;

      const notification = await notificationService.createNotification({
        recipientId,
        title,
        message,
        type,
        category,
        priority,
        metadata: {
          source: 'admin_test',
          createdBy: req.user.id
        },
        sendEmail
      });

      res.json({
        success: true,
        message: 'Test notification sent successfully',
        data: notification
      });

    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification'
      });
    }
  }
);

// GET /api/notifications/admin/stats - Get notification statistics (admin only)
router.get('/admin/stats',
  verifyToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: {
              type: '$type',
              status: '$status'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.type',
            statuses: {
              $push: {
                status: '$_id.status',
                count: '$count'
              }
            },
            total: { $sum: '$count' }
          }
        }
      ]);

      const emailStats = await Notification.aggregate([
        {
          $group: {
            _id: '$channels.email.deliveryStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          notificationStats: stats,
          emailStats,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error fetching notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notification statistics'
      });
    }
  }
);

export default router;
