import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  // Payout request details
  payoutId: {
    type: String,
    required: true,
    unique: true
  },

  // User requesting payout (seller)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Wallet reference
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  
  // Payout amount in paise
  amount: {
    type: Number,
    required: true,
    min: 25000 // Minimum ₹250
  },
  
  // Payout status
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  // Bank account details for this payout
  bankDetails: {
    accountNumber: {
      type: String,
      required: true
    },
    ifscCode: {
      type: String,
      required: true
    },
    accountHolderName: {
      type: String,
      required: true
    },
    bankName: String
  },
  
  // Razorpay payout details
  razorpayDetails: {
    payoutId: String,
    fundAccountId: String,
    contactId: String,
    utr: String,
    mode: String,
    purpose: {
      type: String,
      default: 'payout'
    },
    fees: Number,
    tax: Number,
    failureReason: String
  },
  
  // Admin review details
  adminReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    action: {
      type: String,
      enum: ['approved', 'rejected']
    },
    comments: String,
    rejectionReason: String
  },
  
  // Processing timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  approvedAt: Date,
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Fees and charges
  fees: {
    processingFee: {
      type: Number,
      default: 0
    },
    gst: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  
  // Net amount after fees
  netAmount: {
    type: Number,
    required: true
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      default: 'web'
    },
    retryCount: {
      type: Number,
      default: 0
    },
    notes: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert paise to rupees for display
      ret.amountInRupees = ret.amount / 100;
      ret.netAmountInRupees = ret.netAmount / 100;
      if (ret.fees) {
        ret.fees.processingFeeInRupees = ret.fees.processingFee / 100;
        ret.fees.gstInRupees = ret.fees.gst / 100;
        ret.fees.totalFeesInRupees = ret.fees.totalFees / 100;
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance (payoutId index is already created by unique: true)
payoutSchema.index({ user: 1, status: 1, createdAt: -1 });
payoutSchema.index({ wallet: 1, status: 1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ 'razorpayDetails.payoutId': 1 });
payoutSchema.index({ requestedAt: -1 });
payoutSchema.index({ approvedAt: -1 });

// Pre-save middleware to calculate net amount
payoutSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('fees')) {
    this.netAmount = this.amount - (this.fees.totalFees || 0);
  }
  next();
});

// Methods
payoutSchema.methods.approve = async function(adminUserId, comments = '') {
  if (this.status !== 'pending') {
    throw new Error('Only pending payouts can be approved');
  }
  
  this.status = 'approved';
  this.approvedAt = new Date();
  this.adminReview = {
    reviewedBy: adminUserId,
    reviewedAt: new Date(),
    action: 'approved',
    comments: comments
  };
  
  return this.save();
};

payoutSchema.methods.reject = async function(adminUserId, reason, comments = '') {
  if (this.status !== 'pending') {
    throw new Error('Only pending payouts can be rejected');
  }
  
  this.status = 'rejected';
  this.adminReview = {
    reviewedBy: adminUserId,
    reviewedAt: new Date(),
    action: 'rejected',
    rejectionReason: reason,
    comments: comments
  };
  
  return this.save();
};

payoutSchema.methods.markAsProcessing = function(razorpayPayoutId) {
  this.status = 'processing';
  this.processedAt = new Date();
  this.razorpayDetails.payoutId = razorpayPayoutId;
  return this.save();
};

payoutSchema.methods.markAsCompleted = function(utr, fees = 0, tax = 0) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.razorpayDetails.utr = utr;
  this.razorpayDetails.fees = fees;
  this.razorpayDetails.tax = tax;
  return this.save();
};

payoutSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.razorpayDetails.failureReason = reason;
  return this.save();
};

payoutSchema.methods.getAmountInRupees = function() {
  return this.amount / 100;
};

payoutSchema.methods.getNetAmountInRupees = function() {
  return this.netAmount / 100;
};

payoutSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.metadata.retryCount < 3;
};

// Static methods
payoutSchema.statics.generatePayoutId = function() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `PAYOUT_${timestamp}_${random}`.toUpperCase();
};

payoutSchema.statics.getPendingPayouts = function() {
  return this.find({ status: 'pending' })
    .populate('user', 'email displayName')
    .populate('wallet')
    .sort({ requestedAt: 1 });
};

payoutSchema.statics.getUserPayouts = function(userId, options = {}) {
  const {
    limit = 20,
    skip = 0,
    status = null,
    startDate = null,
    endDate = null
  } = options;
  
  const query = { user: userId };
  
  if (status) query.status = status;
  
  if (startDate || endDate) {
    query.requestedAt = {};
    if (startDate) query.requestedAt.$gte = new Date(startDate);
    if (endDate) query.requestedAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ requestedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('wallet');
};

payoutSchema.statics.getPayoutStats = async function(userId = null) {
  const matchStage = userId ? { user: mongoose.Types.ObjectId(userId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        completedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalRequests: 0,
    totalAmount: 0,
    pendingCount: 0,
    approvedCount: 0,
    completedCount: 0,
    rejectedCount: 0,
    completedAmount: 0
  };
};

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
