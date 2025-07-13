import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Wallet reference
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },

  // User reference (for easier queries)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Transaction type
  type: {
    type: String,
    enum: ['credit', 'debit', 'platform_commission'],
    required: true
  },

  // Amount in paise
  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Transaction description
  description: {
    type: String,
    required: true,
    maxlength: 500
  },

  // External transaction ID (payment ID, payout ID, etc.)
  transactionId: {
    type: String
  },

  // Related entities
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },

  relatedPayout: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payout'
  },

  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

  // Balance after this transaction
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },

  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },

  // Transaction category
  category: {
    type: String,
    enum: ['sale', 'payout', 'refund', 'adjustment', 'bonus', 'penalty'],
    default: 'sale'
  },

  // Additional metadata
  metadata: {
    source: {
      type: String,
      enum: ['razorpay', 'manual', 'system'],
      default: 'system'
    },
    ipAddress: String,
    userAgent: String,
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert paise to rupees for display
      ret.amountInRupees = ret.amount / 100;
      ret.balanceAfterInRupees = ret.balanceAfter / 100;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
transactionSchema.index({ wallet: 1, createdAt: -1 });
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ relatedPayment: 1 });
transactionSchema.index({ relatedPayout: 1 });

// Compound indexes
transactionSchema.index({ user: 1, type: 1, createdAt: -1 });
transactionSchema.index({ wallet: 1, status: 1, createdAt: -1 });

// Methods
transactionSchema.methods.getAmountInRupees = function() {
  return this.amount / 100;
};

transactionSchema.methods.getBalanceAfterInRupees = function() {
  return this.balanceAfter / 100;
};

transactionSchema.methods.isCredit = function() {
  return this.type === 'credit';
};

transactionSchema.methods.isDebit = function() {
  return this.type === 'debit';
};

// Static methods
transactionSchema.statics.getWalletTransactions = function(walletId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type = null,
    category = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { wallet: walletId };

  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('relatedPayment relatedPayout relatedProject');
};

transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type = null,
    category = null,
    status = null,
    startDate = null,
    endDate = null
  } = options;

  const query = { user: userId };

  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('wallet relatedPayment relatedPayout relatedProject');
};

transactionSchema.statics.createSaleTransaction = async function(walletId, userId, amount, paymentId, projectId) {
  return this.create({
    wallet: walletId,
    user: userId,
    type: 'credit',
    amount: amount,
    description: `Sale commission from project purchase`,
    transactionId: paymentId,
    relatedPayment: paymentId,
    relatedProject: projectId,
    category: 'sale',
    metadata: {
      source: 'razorpay'
    }
  });
};

transactionSchema.statics.createPayoutTransaction = async function(walletId, userId, amount, payoutId) {
  return this.create({
    wallet: walletId,
    user: userId,
    type: 'debit',
    amount: amount,
    description: `Payout withdrawal`,
    transactionId: payoutId,
    relatedPayout: payoutId,
    category: 'payout',
    metadata: {
      source: 'razorpay'
    }
  });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
