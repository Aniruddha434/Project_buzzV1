import mongoose from 'mongoose';

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  negotiation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Negotiation',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  metadata: {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Indexes
discountCodeSchema.index({ code: 1 }, { unique: true });
discountCodeSchema.index({ buyer: 1, project: 1 });
discountCodeSchema.index({ expiresAt: 1 });
discountCodeSchema.index({ isActive: 1, isUsed: 1 });

// Pre-save middleware to calculate discount details
discountCodeSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('originalPrice') || this.isModified('discountedPrice')) {
    this.discountAmount = this.originalPrice - this.discountedPrice;
    this.discountPercentage = Math.round((this.discountAmount / this.originalPrice) * 100);
  }
  next();
});

// Method to check if code is valid
discountCodeSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && !this.isUsed && now <= this.expiresAt;
};

// Method to use the code
discountCodeSchema.methods.use = function(paymentId) {
  if (!this.isValid()) {
    throw new Error('Discount code is not valid');
  }

  this.isUsed = true;
  this.usedAt = new Date();
  this.payment = paymentId;

  return this.save();
};

// Static method to generate unique code
discountCodeSchema.statics.generateUniqueCode = async function() {
  let code;
  let exists = true;

  while (exists) {
    code = 'NEGO-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    exists = await this.findOne({ code });
  }

  return code;
};

// Static method to validate code for specific buyer and project
discountCodeSchema.statics.validateForPurchase = async function(code, buyerId, projectId) {
  const discountCode = await this.findOne({
    code: code.toUpperCase(),
    buyer: buyerId,
    project: projectId,
    isActive: true,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('negotiation project');

  if (!discountCode) {
    return { valid: false, error: 'Invalid or expired discount code' };
  }

  return {
    valid: true,
    discountCode,
    discountAmount: discountCode.discountAmount,
    finalPrice: discountCode.discountedPrice
  };
};

export default mongoose.model('DiscountCode', discountCodeSchema);
