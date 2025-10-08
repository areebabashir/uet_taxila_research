import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[0-9][\d\s\-\(\)\.]{7,20}$/, 'Please enter a valid phone number']
  },
  
  // Contact Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Contact Type and Category
  contactType: {
    type: String,
    enum: ['general', 'research', 'admission', 'collaboration', 'media', 'complaint', 'suggestion', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Organization Information (optional)
  organization: {
    type: String,
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Status and Response
  status: {
    type: String,
    enum: ['new', 'in-progress', 'responded', 'resolved', 'closed'],
    default: 'new'
  },
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: [2000, 'Response message cannot exceed 2000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  
  // Additional Information
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'social-media', 'referral', 'other'],
    default: 'website'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Metadata
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for days since creation
contactSchema.virtual('daysSinceCreation').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Index for better query performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ contactType: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });

// Pre-save middleware to update updatedAt and clean phone number
contactSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Clean phone number format if provided
  if (this.phone) {
    // Remove all non-digit characters except + at the beginning
    this.phone = this.phone.replace(/[^\d\+]/g, '');
    // Ensure it starts with + if it has a country code
    if (this.phone.length > 10 && !this.phone.startsWith('+')) {
      this.phone = '+' + this.phone;
    }
  }
  
  next();
});

// Static method to get contact statistics
contactSchema.statics.getContactStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalContacts: { $sum: 1 },
        newContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        inProgressContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        respondedContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'responded'] }, 1, 0] }
        },
        resolvedContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        closedContacts: {
          $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
        },
        highPriorityContacts: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        urgentContacts: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$contactType',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const monthlyStats = await this.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  return {
    overview: stats[0] || {
      totalContacts: 0,
      newContacts: 0,
      inProgressContacts: 0,
      respondedContacts: 0,
      resolvedContacts: 0,
      closedContacts: 0,
      highPriorityContacts: 0,
      urgentContacts: 0
    },
    byType: typeStats,
    monthly: monthlyStats
  };
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
