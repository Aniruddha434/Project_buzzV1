import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment Gateway Order Details
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  // Legacy Cashfree fields (for backward compatibility)
  cashfreeOrderId: {
    type: String,
    sparse: true
  },
  cashfreePaymentId: {
    type: String,
    sparse: true
  },

  // User and Project Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },

  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD']
  },

  // Payment Status
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'PAID', 'EXPIRED', 'CANCELLED', 'FAILED'],
    default: 'PENDING'
  },

  // Payment Gateway Details
  paymentDetails: {
    razorpayPaymentId: String,
    cashfreePaymentId: String, // Legacy field
    paymentMethod: String,
    bank: String,
    wallet: String,
    vpa: String,
    cardId: String,
    utr: String,
    gatewayResponse: String,
    acquirerData: mongoose.Schema.Types.Mixed,
    fee: Number,
    tax: Number
  },

  // Customer Information
  customerDetails: {
    customerId: {
      type: String,
      required: true
    },
    customerName: String,
    customerEmail: {
      type: String,
      required: true
    },
    customerPhone: String
  },

  // Timestamps
  paymentTime: Date,
  expiryTime: Date,

  // Webhook and Verification
  webhookReceived: {
    type: Boolean,
    default: false
  },
  webhookData: mongoose.Schema.Types.Mixed,

  // Refund Information
  refund: {
    refundId: String,
    refundAmount: Number,
    refundStatus: String,
    refundTime: Date,
    refundReason: String
  },

  // Discount Code Information
  discountCode: {
    code: String,
    discountAmount: Number,
    originalPrice: Number,
    finalPrice: Number
  },

  // Additional Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: {
      type: String,
      default: 'web'
    },
    hasDiscount: {
      type: Boolean,
      default: false
    }
  },

  // Tracking fields
  statsUpdated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance (removed duplicates)
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ project: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ createdAt: -1 });

// Methods
paymentSchema.methods.markAsPaid = function(paymentData) {
  this.status = 'PAID';
  this.paymentTime = new Date();
  this.paymentDetails = {
    ...this.paymentDetails,
    ...paymentData
  };
  return this.save();
};

paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'FAILED';
  this.paymentDetails.gatewayResponse = reason;
  return this.save();
};

paymentSchema.methods.isExpired = function() {
  return this.expiryTime && new Date() > this.expiryTime;
};

// Static methods
paymentSchema.statics.findByOrderId = function(orderId) {
  return this.findOne({ orderId });
};

// Razorpay static methods
paymentSchema.statics.findByRazorpayOrderId = function(razorpayOrderId) {
  return this.findOne({ razorpayOrderId });
};

paymentSchema.statics.findByRazorpayPaymentId = function(razorpayPaymentId) {
  return this.findOne({ razorpayPaymentId });
};

// Legacy Cashfree static methods (for backward compatibility)
paymentSchema.statics.findByCashfreeOrderId = function(cashfreeOrderId) {
  return this.findOne({ cashfreeOrderId });
};

paymentSchema.statics.findByCashfreePaymentId = function(cashfreePaymentId) {
  return this.findOne({ cashfreePaymentId });
};

paymentSchema.statics.getUserPayments = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query).populate('project', 'title price').sort({ createdAt: -1 });
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
