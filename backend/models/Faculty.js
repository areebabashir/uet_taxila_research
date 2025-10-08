import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Details
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Research Associate', 'Post Doc']
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  campus: {
    type: String,
    trim: true
  },
  
  // Contact Information
  officeLocation: {
    type: String,
    trim: true
  },
  officePhone: {
    type: String,
    trim: true
  },
  personalPhone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  
  // Academic Information
  qualification: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  }],
  
  // Research Information
  researchInterests: [{
    type: String,
    trim: true
  }],
  researchAreas: [{
    type: String,
    trim: true
  }],
  
  // External Profile Integration
  orcidId: {
    type: String,
    trim: true,
    match: [/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/, 'Invalid ORCID ID format']
  },
  scopusId: {
    type: String,
    trim: true
  },
  googleScholarId: {
    type: String,
    trim: true
  },
  researchGateId: {
    type: String,
    trim: true
  },
  linkedinId: {
    type: String,
    trim: true
  },
  
  // Professional Information
  specialization: [{
    type: String,
    trim: true
  }],
  teachingExperience: {
    type: Number,
    default: 0
  },
  industryExperience: {
    type: Number,
    default: 0
  },
  
  // Administrative Roles
  administrativeRoles: [{
    role: {
      type: String,
      enum: ['HoD', 'Dean', 'Director', 'Coordinator', 'Chairman']
    },
    department: String,
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Visibility Settings
  visibilitySettings: {
    profilePublic: {
      type: Boolean,
      default: true
    },
    researchInterestsPublic: {
      type: Boolean,
      default: true
    },
    publicationsPublic: {
      type: Boolean,
      default: true
    },
    projectsPublic: {
      type: Boolean,
      default: true
    },
    contactInfoPublic: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
facultySchema.index({ employeeId: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ designation: 1 });
facultySchema.index({ orcidId: 1 });
facultySchema.index({ researchInterests: 1 });

// Virtual for full name
facultySchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for current administrative role
facultySchema.virtual('currentAdminRole').get(function() {
  const activeRole = this.administrativeRoles.find(role => role.isActive);
  return activeRole ? activeRole.role : null;
});

// Ensure virtual fields are serialized
facultySchema.set('toJSON', { virtuals: true });

const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;
