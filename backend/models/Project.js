import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    // Price is stored in INR (Indian Rupees)
    // For precision, consider storing in paise (multiply by 100)
    // but for simplicity, we'll store in rupees with decimal support
  },
  // Project images/screenshots (up to 5 images)
  images: [{
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  // Backward compatibility - main image
  image: {
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  // GitHub repository (optional)
  githubRepo: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        // Only validate if value is provided
        return !v || /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/.test(v);
      },
      message: 'Invalid GitHub repository URL'
    }
  },
  demoUrl: String,
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'ai-ml', 'blockchain', 'game', 'other'],
    default: 'other'
  },
  // New enhanced project information fields
  completionStatus: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Completion status must be between 0 and 100'
    }
  },
  // Documentation files
  documentationFiles: [{
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    fileType: {
      type: String,
      enum: ['readme', 'technical', 'specification'],
      required: true
    },
    description: String
  }],
  // Project ZIP file containing source code
  projectZipFile: {
    url: String,
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date,
    description: String
  },
  // Additional project details
  projectDetails: {
    timeline: {
      type: String,
      maxlength: 500,
      trim: true
    },
    techStack: {
      type: String,
      maxlength: 1000,
      trim: true
    },
    complexityLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    installationInstructions: {
      type: String,
      maxlength: 2000,
      trim: true
    },
    usageInstructions: {
      type: String,
      maxlength: 2000,
      trim: true
    },
    prerequisites: {
      type: String,
      maxlength: 1000,
      trim: true
    }
  },
  // Seller information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Buyers who purchased this project
  buyers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    paymentId: String,
    downloadCount: {
      type: Number,
      default: 0
    }
  }],
  // Project status
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  // Admin review
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    comments: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    sales: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  // SEO and search
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Timestamps
  publishedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
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

// Indexes for better query performance
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ seller: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ price: 1 });
projectSchema.index({ 'stats.sales': -1 });
projectSchema.index({ 'stats.rating.average': -1 });
projectSchema.index({ featured: 1, status: 1 });

// Text search index
projectSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for buyer count
projectSchema.virtual('buyerCount').get(function() {
  return this.buyers ? this.buyers.length : 0;
});

// Virtual for is sold
projectSchema.virtual('isSold').get(function() {
  return this.buyers && this.buyers.length > 0;
});

// Virtual for primary image
projectSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return this.image;
});

// Methods for image management
projectSchema.methods.addImage = function(imageData, isPrimary = false) {
  if (this.images.length >= 5) {
    throw new Error('Maximum 5 images allowed per project');
  }

  const newImage = {
    ...imageData,
    isPrimary: isPrimary || this.images.length === 0,
    order: this.images.length,
    uploadedAt: new Date()
  };

  // If this is set as primary, unset other primary images
  if (isPrimary) {
    this.images.forEach(img => img.isPrimary = false);
  }

  this.images.push(newImage);

  // Set as main image for backward compatibility if it's primary or first image
  if (isPrimary || this.images.length === 1) {
    this.image = {
      url: imageData.url,
      filename: imageData.filename,
      originalName: imageData.originalName,
      mimetype: imageData.mimetype,
      size: imageData.size,
      uploadedAt: new Date()
    };
  }

  return this.save();
};

projectSchema.methods.removeImage = function(imageId) {
  const imageIndex = this.images.findIndex(img => img._id.toString() === imageId.toString());

  if (imageIndex === -1) {
    throw new Error('Image not found');
  }

  const removedImage = this.images[imageIndex];
  this.images.splice(imageIndex, 1);

  // If removed image was primary, set first remaining image as primary
  if (removedImage.isPrimary && this.images.length > 0) {
    this.images[0].isPrimary = true;
    this.image = {
      url: this.images[0].url,
      filename: this.images[0].filename,
      originalName: this.images[0].originalName,
      mimetype: this.images[0].mimetype,
      size: this.images[0].size,
      uploadedAt: this.images[0].uploadedAt
    };
  } else if (this.images.length === 0) {
    this.image = undefined;
  }

  return this.save();
};

projectSchema.methods.setPrimaryImage = function(imageId) {
  const targetImage = this.images.find(img => img._id.toString() === imageId.toString());

  if (!targetImage) {
    throw new Error('Image not found');
  }

  // Unset all primary flags
  this.images.forEach(img => img.isPrimary = false);

  // Set target as primary
  targetImage.isPrimary = true;

  // Update main image for backward compatibility
  this.image = {
    url: targetImage.url,
    filename: targetImage.filename,
    originalName: targetImage.originalName,
    mimetype: targetImage.mimetype,
    size: targetImage.size,
    uploadedAt: targetImage.uploadedAt
  };

  return this.save();
};

projectSchema.methods.reorderImages = function(imageOrders) {
  imageOrders.forEach(({ imageId, order }) => {
    const image = this.images.find(img => img._id.toString() === imageId.toString());
    if (image) {
      image.order = order;
    }
  });

  // Sort images by order
  this.images.sort((a, b) => a.order - b.order);

  return this.save();
};

// Method to add a buyer
projectSchema.methods.addBuyer = function(userId, paymentId) {
  if (!this.buyers.some(buyer => buyer.user.toString() === userId.toString())) {
    this.buyers.push({
      user: userId,
      paymentId: paymentId,
      purchasedAt: new Date()
    });
    this.stats.sales += 1;
    this.stats.revenue += this.price;
  }
  return this.save();
};

// Method to increment view count
projectSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Method to increment download count
projectSchema.methods.incrementDownloads = function(userId) {
  this.stats.downloads += 1;

  // Also increment user's download count
  const buyer = this.buyers.find(b => b.user.toString() === userId.toString());
  if (buyer) {
    buyer.downloadCount += 1;
  }

  return this.save();
};

// Static method to find projects by seller
projectSchema.statics.findBySeller = function(sellerId, status = null) {
  const query = { seller: sellerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('seller', 'displayName email');
};

// Static method to find approved projects for buyers
projectSchema.statics.findApproved = function(filters = {}) {
  const query = { status: 'approved', ...filters };
  return this.find(query)
    .populate('seller', 'displayName')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to generate slug
projectSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  if (this.isModified('status') && this.status === 'approved' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  this.lastModified = new Date();
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
