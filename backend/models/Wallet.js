import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  // Owner of the wallet (seller)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Wallet balance in INR (stored in paise for precision)
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Total amount earned (lifetime)
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },

  // Total amount withdrawn (lifetime)
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },

  // Wallet status
  status: {
    type: String,
    enum: ['active', 'suspended', 'frozen'],
    default: 'active'
  },

  // Bank account details for payouts
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },

  // Wallet settings
  settings: {
    autoWithdraw: {
      type: Boolean,
      default: false
    },
    minimumBalance: {
      type: Number,
      default: 25000 // ₹250 in paise
    }
  },

  // Last transaction timestamp
  lastTransactionAt: Date,

  // Metadata
  metadata: {
    createdBy: {
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
      ret.balanceInRupees = ret.balance / 100;
      ret.totalEarnedInRupees = ret.totalEarned / 100;
      ret.totalWithdrawnInRupees = ret.totalWithdrawn / 100;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
walletSchema.index({ user: 1 });
walletSchema.index({ status: 1 });
walletSchema.index({ createdAt: -1 });
walletSchema.index({ lastTransactionAt: -1 });

// Virtual for available balance (balance that can be withdrawn)
walletSchema.virtual('availableBalance').get(function() {
  return Math.max(0, this.balance - this.settings.minimumBalance);
});

// Methods
walletSchema.methods.credit = async function(amount, transactionId, description = 'Credit', category = 'sale', relatedPayment = null, relatedProject = null) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  this.balance += amount;
  this.totalEarned += amount;
  this.lastTransactionAt = new Date();

  await this.save();

  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    wallet: this._id,
    user: this.user,
    type: 'credit',
    amount: amount,
    description: description,
    transactionId: transactionId,
    balanceAfter: this.balance,
    category: category,
    relatedPayment: relatedPayment,
    relatedProject: relatedProject,
    status: 'completed'
  });

  return this;
};

walletSchema.methods.debit = async function(amount, transactionId, description = 'Debit', category = 'payout', relatedPayout = null) {
  if (amount <= 0) {
    throw new Error('Debit amount must be positive');
  }

  if (this.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  this.balance -= amount;
  this.totalWithdrawn += amount;
  this.lastTransactionAt = new Date();

  await this.save();

  // Create transaction record
  const Transaction = mongoose.model('Transaction');
  await Transaction.create({
    wallet: this._id,
    user: this.user,
    type: 'debit',
    amount: amount,
    description: description,
    transactionId: transactionId,
    balanceAfter: this.balance,
    category: category,
    relatedPayout: relatedPayout,
    status: 'completed'
  });

  return this;
};

walletSchema.methods.canWithdraw = function(amount) {
  return this.balance >= amount && amount >= this.settings.minimumBalance;
};

walletSchema.methods.getBalanceInRupees = function() {
  return this.balance / 100;
};

// Static methods
walletSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId });
};

walletSchema.statics.createForUser = async function(userId) {
  const existingWallet = await this.findByUser(userId);
  if (existingWallet) {
    return existingWallet;
  }

  return this.create({
    user: userId,
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0
  });
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
