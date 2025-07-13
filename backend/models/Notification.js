import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Recipient information
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification content
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Notification type and category
  type: {
    type: String,
    required: true,
    enum: [
      'PURCHASE_CONFIRMATION',
      'PAYMENT_SUCCESS',
      'PAYMENT_FAILED',
      'SALE_NOTIFICATION',
      'NEW_USER_REGISTRATION',
      'SELLER_REGISTRATION',
      'ADMIN_ALERT',
      'SYSTEM_NOTIFICATION',
      'PROJECT_UPDATE',
      'ACCOUNT_UPDATE'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: ['payment', 'purchase', 'sale', 'admin', 'system', 'account']
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Status tracking
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },

  // Related entities
  relatedEntities: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment' // Using Payment model as order reference
    }
  },

  // Delivery channels
  channels: {
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      emailId: String, // For tracking email delivery
      deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
        default: 'pending'
      },
      error: String
    },
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      pushId: String,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      error: String
    }
  },

  // Action data (for actionable notifications)
  actionData: {
    actionType: String, // 'download', 'view_order', 'manage_project', etc.
    actionUrl: String,
    actionText: String,
    expiresAt: Date
  },

  // Metadata
  metadata: {
    source: {
      type: String,
      default: 'system'
    },
    templateId: String,
    templateData: mongoose.Schema.Types.Mixed,
    retryCount: {
      type: Number,
      default: 0
    },
    lastRetryAt: Date
  },

  // Timestamps
  readAt: Date,
  archivedAt: Date,
  expiresAt: Date // For auto-cleanup of old notifications
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ recipient: 1, category: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsArchived = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

notificationSchema.methods.updateEmailStatus = function(status, emailId, error = null) {
  this.channels.email.deliveryStatus = status;
  this.channels.email.sentAt = new Date();
  if (emailId) this.channels.email.emailId = emailId;
  if (error) this.channels.email.error = error;
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: 'unread'
  });
};

notificationSchema.statics.getByUser = function(userId, options = {}) {
  const {
    status = null,
    category = null,
    limit = 20,
    skip = 0,
    sort = { createdAt: -1 }
  } = options;

  const query = { recipient: userId };
  if (status) query.status = status;
  if (category) query.category = category;

  return this.find(query)
    .populate('relatedEntities.user', 'displayName email')
    .populate('relatedEntities.project', 'title price')
    .populate('relatedEntities.payment', 'orderId amount status')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

notificationSchema.statics.markAllAsRead = function(userId, category = null) {
  const query = {
    recipient: userId,
    status: 'unread'
  };
  if (category) query.category = category;

  return this.updateMany(query, {
    status: 'read',
    readAt: new Date()
  });
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set expiration date if not set (default: 30 days)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
