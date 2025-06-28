import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Additional profile information
  profile: {
    bio: String,
    location: String,
    website: String,
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String
    }
  },
  // Seller-specific verification information
  sellerVerification: {
    // Personal Information
    fullName: String,
    phoneNumber: String,
    phoneVerified: {
      type: Boolean,
      default: false
    },

    // Professional Information
    occupation: String,
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    },
    yearsOfExperience: Number,

    // Portfolio and Work Examples
    portfolioUrl: String,
    githubProfile: String,
    workExamples: [{
      title: String,
      description: String,
      url: String,
      technologies: [String],
      completedDate: Date
    }],

    // Business Information (Optional)
    businessName: String,
    businessType: {
      type: String,
      enum: ['individual', 'freelancer', 'company', 'startup']
    },
    businessRegistrationNumber: String,

    // Verification Status
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationDate: Date,
    rejectionReason: String,
    autoApproved: {
      type: Boolean,
      default: false
    },

    // Identity Verification
    identityVerified: {
      type: Boolean,
      default: false
    },
    identityDocuments: [{
      type: String,
      url: String,
      uploadedAt: Date
    }],

    // Terms and Conditions
    sellerTermsAccepted: {
      type: Boolean,
      default: false
    },
    sellerTermsAcceptedDate: Date,

    // Additional Requirements
    motivation: String, // Why they want to become a seller
    expectedMonthlyRevenue: Number,
    specializations: [String], // Areas of expertise

    // Admin Notes
    adminNotes: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },

  // Admin Information (for admin users only)
  adminInfo: {
    adminLevel: {
      type: String,
      enum: ['admin', 'super_admin'],
      default: 'admin'
    },
    permissions: [{
      type: String,
      enum: [
        'view_users', 'manage_users', 'delete_users',
        'view_projects', 'manage_projects', 'delete_projects',
        'view_payments', 'manage_payments', 'process_refunds',
        'view_analytics', 'view_reports', 'export_data',
        'manage_admins', 'create_admin', 'deactivate_admin',
        'system_settings', 'email_notifications', 'platform_settings'
      ]
    }],
    department: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date,
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastUpdatedAt: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    deactivatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deactivatedAt: Date,
    deactivationReason: String,
    notes: String,
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    }
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  // Statistics
  stats: {
    projectsPurchased: {
      type: Number,
      default: 0
    },
    projectsSold: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    }
  },
  // Preferences (simplified)
  preferences: {
    // Reserved for future essential preferences only
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

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update user stats
userSchema.methods.updateStats = function(type, amount = 0) {
  console.log(`📊 updateStats called: type=${type}, amount=${amount}, userId=${this._id}`);
  console.log('📊 Current stats before update:', this.stats);

  switch(type) {
    case 'purchase':
      this.stats.projectsPurchased += 1;
      this.stats.totalSpent += amount;
      break;
    case 'sale':
      this.stats.projectsSold += 1;
      this.stats.totalEarned += amount;
      break;
  }

  console.log('📊 Stats after update:', this.stats);
  return this.save();
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.projectsSold': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.displayName || this.email.split('@')[0];
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
