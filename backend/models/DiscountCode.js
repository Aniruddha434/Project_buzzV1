import mongoose from 'mongoose';

const discountCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },

  // Discount Type - either 'negotiation' or 'welcome'
  type: {
    type: String,
    enum: ['negotiation', 'welcome'],
    required: true,
    default: 'negotiation'
  },

  // For negotiation codes (existing functionality)
  negotiation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Negotiation',
    required: function() { return this.type === 'negotiation'; }
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: function() { return this.type === 'negotiation'; }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type === 'negotiation'; }
  },

  // For all discount codes
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalPrice: {
    type: Number,
    required: function() { return this.type === 'negotiation'; },
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: function() { return this.type === 'negotiation'; },
    min: 0
  },
  discountAmount: {
    type: Number,
    required: function() { return this.type === 'negotiation'; },
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // Welcome code specific fields
  maxDiscountAmount: {
    type: Number,
    required: function() { return this.type === 'welcome'; },
    min: 0
  },
  minPurchaseAmount: {
    type: Number,
    required: function() { return this.type === 'welcome'; },
    min: 0,
    default: 100
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

// Indexes (code index is already created by unique: true)
discountCodeSchema.index({ buyer: 1, project: 1 });
discountCodeSchema.index({ buyer: 1, type: 1 });
discountCodeSchema.index({ expiresAt: 1 });
discountCodeSchema.index({ isActive: 1, isUsed: 1 });
discountCodeSchema.index({ type: 1, isActive: 1, isUsed: 1 });

// Pre-save middleware to calculate discount details
discountCodeSchema.pre('save', function(next) {
  if (this.type === 'negotiation') {
    if (this.isNew || this.isModified('originalPrice') || this.isModified('discountedPrice')) {
      this.discountAmount = this.originalPrice - this.discountedPrice;
      this.discountPercentage = Math.round((this.discountAmount / this.originalPrice) * 100);
    }
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
  const upperCode = code.toUpperCase();

  // First try to find negotiation-specific code
  let discountCode = await this.findOne({
    code: upperCode,
    type: 'negotiation',
    buyer: buyerId,
    project: projectId,
    isActive: true,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('negotiation project');

  // If not found, try welcome code
  if (!discountCode && upperCode === 'WELCOME20') {
    discountCode = await this.findOne({
      code: upperCode,
      type: 'welcome',
      buyer: buyerId,
      isActive: true,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('buyer');

    if (discountCode) {
      // Get project details to calculate discount
      const Project = mongoose.model('Project');
      const project = await Project.findById(projectId);

      if (!project) {
        return { valid: false, error: 'Project not found' };
      }

      // Check minimum purchase amount
      if (project.price < discountCode.minPurchaseAmount) {
        return {
          valid: false,
          error: `Minimum purchase amount is ₹${discountCode.minPurchaseAmount}`
        };
      }

      // Calculate discount
      const discountAmount = Math.min(
        Math.round(project.price * (discountCode.discountPercentage / 100)),
        discountCode.maxDiscountAmount
      );
      const finalPrice = project.price - discountAmount;

      return {
        valid: true,
        discountCode,
        discountAmount,
        finalPrice,
        originalPrice: project.price
      };
    }
  }

  if (!discountCode) {
    return { valid: false, error: 'Invalid or expired discount code' };
  }

  // For negotiation codes
  return {
    valid: true,
    discountCode,
    discountAmount: discountCode.discountAmount,
    finalPrice: discountCode.discountedPrice,
    originalPrice: discountCode.originalPrice
  };
};

// Static method to create welcome discount code for new users
discountCodeSchema.statics.createWelcomeCode = async function(buyerId) {
  try {
    // Check if user already has a welcome code
    const existingCode = await this.findOne({
      buyer: buyerId,
      type: 'welcome',
      code: 'WELCOME20'
    });

    if (existingCode) {
      console.log('🎫 Welcome code already exists for user:', buyerId);
      return existingCode;
    }

    // Check if user has made any purchases (should be first-time buyer)
    const Payment = mongoose.model('Payment');
    const existingPurchase = await Payment.findOne({
      user: buyerId,
      status: 'PAID'
    });

    if (existingPurchase) {
      console.log('❌ User has already made purchases, not eligible for welcome code:', buyerId);
      return null;
    }

    // Create welcome code valid for 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const welcomeCode = new this({
      code: 'WELCOME20',
      type: 'welcome',
      buyer: buyerId,
      discountPercentage: 20,
      maxDiscountAmount: 500,
      minPurchaseAmount: 100,
      isActive: true,
      isUsed: false,
      expiresAt: expiryDate
    });

    await welcomeCode.save();
    console.log('✅ Welcome code created for user:', buyerId);
    return welcomeCode;

  } catch (error) {
    console.error('❌ Error creating welcome code:', error);
    return null;
  }
};

// Static method to check if user is eligible for welcome code
discountCodeSchema.statics.isEligibleForWelcomeCode = async function(buyerId) {
  try {
    // Check if user already has a welcome code
    const existingCode = await this.findOne({
      buyer: buyerId,
      type: 'welcome',
      code: 'WELCOME20'
    });

    if (existingCode) {
      return { eligible: false, reason: 'already_has_code', code: existingCode };
    }

    // Check if user has made any purchases
    const Payment = mongoose.model('Payment');
    const existingPurchase = await Payment.findOne({
      user: buyerId,
      status: 'PAID'
    });

    if (existingPurchase) {
      return { eligible: false, reason: 'already_purchased' };
    }

    return { eligible: true };

  } catch (error) {
    console.error('❌ Error checking welcome code eligibility:', error);
    return { eligible: false, reason: 'error' };
  }
};

export default mongoose.model('DiscountCode', discountCodeSchema);
