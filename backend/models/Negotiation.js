import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['template', 'price_offer', 'counter_offer', 'acceptance', 'rejection', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500 // Limit message length
  },
  templateId: {
    type: String,
    enum: [
      'interested',
      'lower_price',
      'best_offer',
      'custom_request',
      'timeline_question',
      'feature_question'
    ]
  },
  priceOffer: {
    type: Number,
    min: 0
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isFiltered: {
    type: Boolean,
    default: false
  },
  filteredReason: String
});

const negotiationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['active', 'accepted', 'rejected', 'expired', 'completed'],
    default: 'active'
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentOffer: {
    type: Number,
    min: 0
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  minimumPrice: {
    type: Number,
    min: 0
  },
  messages: [messageSchema],
  discountCode: {
    code: String,
    expiresAt: Date,
    isUsed: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from creation
    }
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: String,
  metadata: {
    buyerMessageCount: {
      type: Number,
      default: 0
    },
    sellerMessageCount: {
      type: Number,
      default: 0
    },
    lastBuyerMessage: Date,
    lastSellerMessage: Date,
    offerCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
negotiationSchema.index({ project: 1, buyer: 1 }, { unique: true });
negotiationSchema.index({ buyer: 1, status: 1 });
negotiationSchema.index({ seller: 1, status: 1 });
negotiationSchema.index({ status: 1, expiresAt: 1 });
negotiationSchema.index({ lastActivity: 1 });

// Pre-save middleware to calculate minimum price (70% of original)
negotiationSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('originalPrice')) {
    this.minimumPrice = Math.floor(this.originalPrice * 0.7);
  }
  next();
});

// Method to add message with filtering
negotiationSchema.methods.addMessage = function(messageData) {
  const { content, type, sender, templateId, priceOffer } = messageData;

  // Content filtering
  const filteredContent = this.filterContent(content);
  const isFiltered = filteredContent.isFiltered;

  const message = {
    type,
    content: isFiltered ? filteredContent.filtered : content,
    templateId,
    priceOffer,
    sender,
    isFiltered,
    filteredReason: isFiltered ? filteredContent.reason : undefined
  };

  this.messages.push(message);
  this.lastActivity = new Date();

  // Update metadata
  if (sender.toString() === this.buyer.toString()) {
    this.metadata.buyerMessageCount++;
    this.metadata.lastBuyerMessage = new Date();
  } else {
    this.metadata.sellerMessageCount++;
    this.metadata.lastSellerMessage = new Date();
  }

  if (type === 'price_offer' || type === 'counter_offer') {
    this.metadata.offerCount++;
    this.currentOffer = priceOffer;
  }

  return message;
};

// Content filtering method
negotiationSchema.methods.filterContent = function(content) {
  const suspiciousPatterns = [
    // Email patterns
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone patterns
    /(\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    // Social media
    /(?:whatsapp|telegram|discord|skype|instagram|facebook|twitter)/gi,
    // Payment methods
    /(?:paypal|venmo|cashapp|zelle|bitcoin|crypto|bank\s*transfer)/gi,
    // External platforms
    /(?:fiverr|upwork|freelancer|github\.com|gitlab\.com)/gi,
    // Contact attempts
    /(?:contact\s*me|reach\s*out|dm\s*me|message\s*me)/gi
  ];

  let isFiltered = false;
  let reason = '';
  let filtered = content;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      isFiltered = true;
      reason = 'Contains potentially prohibited content';
      filtered = content.replace(pattern, '[FILTERED]');
    }
  }

  return { isFiltered, reason, filtered };
};

// Method to generate discount code
negotiationSchema.methods.generateDiscountCode = function() {
  const code = 'NEGO-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  this.discountCode = {
    code,
    expiresAt,
    isUsed: false
  };

  return code;
};

// Method to check if negotiation is expired
negotiationSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to check rate limits
negotiationSchema.methods.checkRateLimit = function(userId) {
  const now = new Date();
  const oneHour = 60 * 60 * 1000;
  const recentMessages = this.messages.filter(msg =>
    msg.sender.toString() === userId.toString() &&
    (now - msg.timestamp) < oneHour
  );

  return recentMessages.length < 10; // Max 10 messages per hour per user
};

export default mongoose.model('Negotiation', negotiationSchema);
