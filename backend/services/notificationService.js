import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

class NotificationService {
  constructor() {
    this.emailService = null;
    this.initializeEmailService();
  }

  async initializeEmailService() {
    try {
      // Dynamically import email service to ensure environment variables are loaded
      const { default: emailService } = await import('./emailService.js');
      this.emailService = emailService;

      // Verify email service is properly configured
      if (process.env.SMTP_USER && !emailService.transporter) {
        console.log('🔄 Email service needs reinitialization...');
        emailService.reinitialize();
      }

      console.log('📧 Email service initialized in notification service');
    } catch (error) {
      console.error('❌ Failed to initialize email service in notification service:', error.message);
    }
  }

  /**
   * Create and send a notification
   */
  async createNotification(options) {
    const {
      recipientId,
      title,
      message,
      type,
      category,
      priority = 'medium',
      relatedEntities = {},
      actionData = null,
      metadata = {},
      sendEmail = true,
      sendPush = false
    } = options;

    try {
      // Get recipient user
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        throw new Error('Recipient user not found');
      }

      // Check user notification preferences
      const emailEnabled = recipient.preferences?.notifications?.email !== false;
      const pushEnabled = recipient.preferences?.notifications?.push !== false;

      // Create notification document
      const notification = new Notification({
        recipient: recipientId,
        title,
        message,
        type,
        category,
        priority,
        relatedEntities,
        actionData,
        metadata: {
          source: 'system',
          ...metadata
        },
        channels: {
          inApp: {
            sent: true,
            sentAt: new Date()
          },
          email: {
            sent: false,
            deliveryStatus: 'pending'
          },
          push: {
            sent: false,
            deliveryStatus: 'pending'
          }
        }
      });

      // Save notification
      await notification.save();

      // Send email if enabled and user preferences allow
      if (sendEmail && emailEnabled) {
        console.log('📧 Sending email notification for:', notification.type);
        console.log('📧 Recipient:', recipient.email);
        await this.sendEmailNotification(notification, recipient);
        console.log('📧 Email notification sent for:', notification.type);
      } else {
        console.log('📧 Email not sent - sendEmail:', sendEmail, 'emailEnabled:', emailEnabled);
      }

      // Send push notification if enabled and user preferences allow
      if (sendPush && pushEnabled) {
        await this.sendPushNotification(notification, recipient);
      }

      console.log(`✅ Notification created for user ${recipient.email}: ${title}`);
      return notification;

    } catch (error) {
      console.error('❌ Failed to create notification:', error.message);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification, recipient) {
    try {
      // Ensure email service is initialized
      if (!this.emailService) {
        console.log('📧 Email service not initialized, attempting to initialize...');
        await this.initializeEmailService();
      }

      if (!this.emailService) {
        throw new Error('Email service is not available');
      }

      let emailResult;

      // Send specific email based on notification type
      switch (notification.type) {
        case 'PURCHASE_CONFIRMATION':
          emailResult = await this.sendPurchaseConfirmationEmail(notification, recipient);
          break;
        case 'PAYMENT_SUCCESS':
          emailResult = await this.sendPaymentSuccessEmail(notification, recipient);
          break;
        case 'PAYMENT_FAILED':
          emailResult = await this.sendPaymentFailedEmail(notification, recipient);
          break;
        case 'SALE_NOTIFICATION':
          emailResult = await this.sendSaleNotificationEmail(notification, recipient);
          break;
        case 'NEW_USER_REGISTRATION':
          emailResult = await this.sendNewUserRegistrationEmail(notification, recipient);
          break;
        case 'ADMIN_ALERT':
          emailResult = await this.sendAdminAlertEmail(notification, recipient);
          break;
        default:
          // Generic notification email
          emailResult = await this.sendGenericEmail(notification, recipient);
      }

      // Update notification with email status
      if (emailResult && emailResult.success) {
        await notification.updateEmailStatus('sent', emailResult.messageId);
        console.log('✅ Email notification sent successfully:', notification.type);
      } else {
        await notification.updateEmailStatus('failed', null, emailResult?.error || 'Unknown error');
        console.log('❌ Email notification failed:', notification.type, emailResult?.error);
      }

    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
      await notification.updateEmailStatus('failed', null, error.message);
    }
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  async sendPushNotification(notification, recipient) {
    // TODO: Implement push notification service (Firebase FCM, etc.)
    console.log(`📱 Push notification would be sent to ${recipient.email}: ${notification.title}`);

    // Update notification status
    notification.channels.push.sent = true;
    notification.channels.push.sentAt = new Date();
    notification.channels.push.deliveryStatus = 'sent';
    await notification.save();
  }

  /**
   * Specific email sending methods
   */
  async sendPurchaseConfirmationEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const { project, payment } = notification.relatedEntities;
    if (!project || !payment) {
      throw new Error('Missing project or payment data for purchase confirmation');
    }

    return await this.emailService.sendPurchaseConfirmation(
      recipient,
      project,
      payment
    );
  }

  async sendPaymentSuccessEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const { project, payment } = notification.relatedEntities;
    if (!project || !payment) {
      throw new Error('Missing project or payment data for payment success');
    }

    return await this.emailService.sendPaymentSuccess(
      recipient,
      payment,
      project
    );
  }

  async sendPaymentFailedEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const { project, payment } = notification.relatedEntities;
    if (!project || !payment) {
      throw new Error('Missing project or payment data for payment failed');
    }

    return await this.emailService.sendPaymentFailed(
      recipient,
      payment,
      project
    );
  }

  async sendSaleNotificationEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const { user: buyer, project, payment } = notification.relatedEntities;
    if (!buyer || !project || !payment) {
      throw new Error('Missing buyer, project, or payment data for sale notification');
    }

    return await this.emailService.sendSaleNotification(
      recipient, // seller
      buyer,
      project,
      payment
    );
  }

  async sendNewUserRegistrationEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const { user: newUserId } = notification.relatedEntities;
    if (!newUserId) {
      throw new Error('Missing new user data for registration notification');
    }

    // Fetch the full user object if we only have the ID
    let newUser;
    if (typeof newUserId === 'string' || newUserId instanceof mongoose.Types.ObjectId) {
      newUser = await User.findById(newUserId);
      if (!newUser) {
        throw new Error('New user not found in database');
      }
    } else {
      newUser = newUserId; // Already a full user object
    }

    return await this.emailService.sendNewUserRegistration(
      recipient, // admin
      newUser
    );
  }

  async sendAdminAlertEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    const alertData = notification.metadata.alertData || {};

    return await this.emailService.sendAdminAlert(
      recipient,
      notification.metadata.alertType || 'System Alert',
      alertData
    );
  }

  async sendGenericEmail(notification, recipient) {
    if (!this.emailService) {
      throw new Error('Email service not available');
    }

    return await this.emailService.sendEmail({
      to: recipient.email,
      subject: notification.title,
      template: 'generic-notification',
      data: {
        userName: recipient.displayName || recipient.email.split('@')[0],
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionData?.actionUrl,
        actionText: notification.actionData?.actionText
      }
    });
  }

  /**
   * Convenience methods for common notification types
   */
  async notifyPurchaseConfirmation(buyerId, projectId, paymentId) {
    console.log('📧 ===== NOTIFY PURCHASE CONFIRMATION =====');
    console.log('📧 Buyer ID:', buyerId);
    console.log('📧 Project ID:', projectId);
    console.log('📧 Payment ID:', paymentId);

    const result = await this.createNotification({
      recipientId: buyerId,
      title: 'Purchase Confirmed!',
      message: 'Your purchase has been confirmed. You can now download your project.',
      type: 'PURCHASE_CONFIRMATION',
      category: 'purchase',
      priority: 'high',
      relatedEntities: {
        project: projectId,
        payment: paymentId
      },
      actionData: {
        actionType: 'download',
        actionUrl: `/dashboard/purchases`,
        actionText: 'View Purchase'
      },
      sendEmail: true
    });

    console.log('📧 Purchase confirmation notification result:', result ? '✅ Success' : '❌ Failed');
    return result;
  }

  async notifyPaymentSuccess(buyerId, projectId, paymentId) {
    return await this.createNotification({
      recipientId: buyerId,
      title: 'Payment Successful',
      message: 'Your payment has been processed successfully.',
      type: 'PAYMENT_SUCCESS',
      category: 'payment',
      priority: 'high',
      relatedEntities: {
        project: projectId,
        payment: paymentId
      },
      sendEmail: true
    });
  }

  async notifyPaymentFailed(buyerId, projectId, paymentId) {
    return await this.createNotification({
      recipientId: buyerId,
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      type: 'PAYMENT_FAILED',
      category: 'payment',
      priority: 'high',
      relatedEntities: {
        project: projectId,
        payment: paymentId
      },
      actionData: {
        actionType: 'retry_payment',
        actionUrl: `/project/${projectId}`,
        actionText: 'Retry Payment'
      },
      sendEmail: true
    });
  }

  async notifySale(sellerId, buyerId, projectId, paymentId) {
    return await this.createNotification({
      recipientId: sellerId,
      title: 'New Sale!',
      message: 'Congratulations! You have a new sale.',
      type: 'SALE_NOTIFICATION',
      category: 'sale',
      priority: 'high',
      relatedEntities: {
        user: buyerId,
        project: projectId,
        payment: paymentId
      },
      actionData: {
        actionType: 'view_sale',
        actionUrl: `/dashboard/sales`,
        actionText: 'View Sales'
      },
      sendEmail: true
    });
  }

  /**
   * Notify admins about new user registration
   * NOTE: This method is currently disabled in the registration flow (auth.js)
   * Admin email notifications for new user registrations have been turned off
   */
  async notifyNewUserRegistration(newUserId) {
    try {
      // Get the new user details first
      const newUser = await User.findById(newUserId);
      if (!newUser) {
        throw new Error(`New user with ID ${newUserId} not found`);
      }

      console.log(`📧 Preparing new user registration notifications for: ${newUser.email} (${newUser.role})`);
      console.log('⚠️  Note: Admin email notifications for new registrations are currently disabled');

      // Get all admin users
      const admins = await User.find({ role: 'admin' });

      if (admins.length === 0) {
        console.warn('⚠️  No admin users found to notify about new registration');
        return [];
      }

      console.log(`📧 Found ${admins.length} admin(s) to notify:`, admins.map(a => a.email));

      const notifications = [];
      for (const admin of admins) {
        try {
          console.log(`📧 Creating notification for admin: ${admin.email}`);

          const notification = await this.createNotification({
            recipientId: admin._id,
            title: 'New User Registration',
            message: `A new ${newUser.role} has registered: ${newUser.email}`,
            type: 'NEW_USER_REGISTRATION',
            category: 'admin',
            priority: 'medium',
            relatedEntities: {
              user: newUserId
            },
            actionData: {
              actionType: 'view_user',
              actionUrl: `/admin/users`,
              actionText: 'Manage Users'
            },
            sendEmail: true
          });
          notifications.push(notification);
          console.log(`✅ Notification created successfully for admin: ${admin.email}`);
        } catch (adminNotificationError) {
          console.error(`❌ Failed to create notification for admin ${admin.email}:`, adminNotificationError.message);
          // Continue with other admins even if one fails
        }
      }

      console.log(`📧 Created ${notifications.length} admin notifications for new user registration`);
      return notifications;
    } catch (error) {
      console.error('❌ Failed to notify admins about new user registration:', error.message);
      throw error;
    }
  }

  /**
   * Notify admins about new seller registration
   */
  async notifyAdminNewSellerRegistration(newSellerId) {
    try {
      // Get the new seller details first
      const newSeller = await User.findById(newSellerId);
      if (!newSeller) {
        throw new Error(`New seller with ID ${newSellerId} not found`);
      }

      console.log(`📧 Preparing new seller registration notifications for: ${newSeller.email}`);

      // Get all admin users
      const admins = await User.find({ role: 'admin' });

      if (admins.length === 0) {
        console.warn('⚠️  No admin users found to notify about new seller registration');
        return [];
      }

      console.log(`📧 Found ${admins.length} admin(s) to notify about seller registration:`, admins.map(a => a.email));

      const notifications = [];
      for (const admin of admins) {
        try {
          console.log(`📧 Creating seller registration notification for admin: ${admin.email}`);

          const notification = await this.createNotification({
            recipientId: admin._id,
            title: 'New Seller Registration - Auto-Approved',
            message: `A new seller has registered and is now active: ${newSeller.email} (${newSeller.sellerVerification?.fullName || 'Name not provided'})`,
            type: 'SELLER_REGISTRATION',
            category: 'admin',
            priority: 'medium',
            relatedEntities: {
              user: newSellerId
            },
            actionData: {
              actionType: 'view_seller',
              actionUrl: `/admin/sellers`,
              actionText: 'View Seller Details'
            },
            metadata: {
              sellerInfo: {
                email: newSeller.email,
                fullName: newSeller.sellerVerification?.fullName,
                occupation: newSeller.sellerVerification?.occupation,
                experienceLevel: newSeller.sellerVerification?.experienceLevel,
                specializations: newSeller.sellerVerification?.specializations
              }
            },
            sendEmail: true
          });
          notifications.push(notification);
          console.log(`✅ Seller registration notification created successfully for admin: ${admin.email}`);
        } catch (adminNotificationError) {
          console.error(`❌ Failed to create seller registration notification for admin ${admin.email}:`, adminNotificationError.message);
          // Continue with other admins even if one fails
        }
      }

      console.log(`📧 Created ${notifications.length} admin notifications for new seller registration`);
      return notifications;
    } catch (error) {
      console.error('❌ Failed to notify admins about new seller registration:', error.message);
      throw error;
    }
  }

  async notifyAdminAlert(alertType, alertData, priority = 'medium') {
    // Get all admin users
    const admins = await User.find({ role: 'admin' });

    const notifications = [];
    for (const admin of admins) {
      const notification = await this.createNotification({
        recipientId: admin._id,
        title: `Admin Alert: ${alertType}`,
        message: `System alert requiring admin attention.`,
        type: 'ADMIN_ALERT',
        category: 'admin',
        priority,
        metadata: {
          alertType,
          alertData
        },
        actionData: {
          actionType: 'view_admin',
          actionUrl: `/admin`,
          actionText: 'Go to Admin Panel'
        },
        sendEmail: priority === 'high' || priority === 'urgent'
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, options = {}) {
    return await Notification.getByUser(userId, options);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return await Notification.getUnreadCount(userId);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return await notification.markAsRead();
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId, category = null) {
    return await Notification.markAllAsRead(userId, category);
  }

  // Payout-related notifications

  /**
   * Notify admin of new payout request
   */
  async notifyPayoutRequest(userId, payoutId, amount) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const admins = await User.find({ role: 'admin' });

      const notifications = [];
      for (const admin of admins) {
        const notification = await this.createNotification({
          recipientId: admin._id,
          title: 'New Payout Request',
          message: `${user.displayName || user.email} has requested a payout of ₹${amount}`,
          type: 'PAYOUT_REQUEST',
          category: 'admin',
          priority: 'high',
          relatedEntities: {
            user: userId,
            payout: payoutId
          },
          metadata: {
            amount: amount,
            userEmail: user.email
          },
          actionData: {
            actionType: 'review_payout',
            actionUrl: `/admin/payouts`,
            actionText: 'Review Payout'
          },
          sendEmail: true
        });
        notifications.push(notification);
      }
      return notifications;
    } catch (error) {
      console.error('Error notifying admin of payout request:', error);
      throw error;
    }
  }

  /**
   * Notify user of payout approval
   */
  async notifyPayoutApproved(userId, payoutId) {
    try {
      return await this.createNotification({
        recipientId: userId,
        title: 'Payout Approved',
        message: 'Your payout request has been approved and is being processed',
        type: 'PAYOUT_APPROVED',
        category: 'payment',
        priority: 'high',
        relatedEntities: {
          payout: payoutId
        },
        actionData: {
          actionType: 'view_payouts',
          actionUrl: `/dashboard/wallet`,
          actionText: 'View Wallet'
        },
        sendEmail: true
      });
    } catch (error) {
      console.error('Error notifying user of payout approval:', error);
      throw error;
    }
  }

  /**
   * Notify user of payout rejection
   */
  async notifyPayoutRejected(userId, payoutId, reason) {
    try {
      return await this.createNotification({
        recipientId: userId,
        title: 'Payout Rejected',
        message: `Your payout request has been rejected. Reason: ${reason}`,
        type: 'PAYOUT_REJECTED',
        category: 'payment',
        priority: 'high',
        relatedEntities: {
          payout: payoutId
        },
        metadata: {
          reason: reason
        },
        actionData: {
          actionType: 'view_payouts',
          actionUrl: `/dashboard/wallet`,
          actionText: 'View Wallet'
        },
        sendEmail: true
      });
    } catch (error) {
      console.error('Error notifying user of payout rejection:', error);
      throw error;
    }
  }

  /**
   * Notify user of payout completion
   */
  async notifyPayoutCompleted(userId, payoutId, amount) {
    try {
      return await this.createNotification({
        recipientId: userId,
        title: 'Payout Completed',
        message: `Your payout of ₹${amount} has been successfully transferred to your bank account`,
        type: 'PAYOUT_COMPLETED',
        category: 'payment',
        priority: 'medium',
        relatedEntities: {
          payout: payoutId
        },
        metadata: {
          amount: amount
        },
        actionData: {
          actionType: 'view_payouts',
          actionUrl: `/dashboard/wallet`,
          actionText: 'View Wallet'
        },
        sendEmail: true
      });
    } catch (error) {
      console.error('Error notifying user of payout completion:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
