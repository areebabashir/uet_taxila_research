import mongoose from 'mongoose';

const fundedProjectSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  abstract: {
    type: String,
    trim: true
  },
  
  // Project Details
  projectType: {
    type: String,
    required: true,
    enum: ['Research', 'Development', 'Consultancy', 'Training', 'Infrastructure', 'Other']
  },
  category: {
    type: String,
    enum: ['National', 'International', 'Industry', 'Government', 'NGO', 'Other']
  },
  
  // Funding Information
  fundingAgency: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['Government', 'Private', 'International', 'NGO', 'Industry']
    },
    country: String,
    website: String,
    contactPerson: {
      name: String,
      email: String,
      phone: String
    }
  },
  
  // Financial Information
  totalBudget: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  universityShare: {
    type: Number,
    default: 0
  },
  facultyShare: {
    type: Number,
    default: 0
  },
  
  // Project Team
  principalInvestigator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coPrincipalInvestigators: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    share: {
      type: Number,
      default: 0
    }
  }],
  teamMembers: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    role: String,
    share: {
      type: Number,
      default: 0
    }
  }],
  
  // External Collaborators
  externalCollaborators: [{
    name: {
      type: String,
      required: true
    },
    affiliation: String,
    email: String,
    country: String,
    role: String
  }],
  
  // Department Information
  department: {
    type: String,
    required: true,
    enum: [
      'Civil Engineering',
      'Environmental Engineering',
      'Electrical Engineering',
      'Electronics Engineering',
      'Biomedical Engineering Technology',
      'Mechanical Engineering',
      'Metallurgy & Material Engineering',
      'Energy Engineering',
      'Mechatronics Engineering',
      'Computer Science',
      'Computer Engineering',
      'Software Engineering',
      'Telecommunication Engineering',
      'Industrial Engineering',
      'Humanities & Social Sciences',
      'Mathematical Sciences',
      'Physical Sciences'
    ]
  },
  
  // Timeline
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in months
    required: true
  },
  
  // Project Status
  status: {
    type: String,
    enum: ['Proposed', 'Submitted', 'Under Review', 'Approved', 'Active', 'Completed', 'Terminated', 'Suspended'],
    default: 'Proposed'
  },
  
  // Approval and Review
  submittedDate: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: String,
  
  // Deliverables and Milestones
  deliverables: [{
    title: String,
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending'
    },
    submittedDate: Date
  }],
  
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending'
    },
    completedDate: Date
  }],
  
  // Reports and Documentation
  progressReports: [{
    title: String,
    period: String,
    dueDate: Date,
    submittedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Approved'],
      default: 'Pending'
    },
    fileUrl: String
  }],
  
  finalReport: {
    title: String,
    submittedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Approved'],
      default: 'Pending'
    },
    fileUrl: String
  },
  
  // Keywords and Categories
  keywords: [{
    type: String,
    trim: true
  }],
  researchAreas: [{
    type: String,
    trim: true
  }],
  
  // Links and Files
  projectWebsite: String,
  documents: [{
    title: String,
    type: String,
    url: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Impact and Outcomes
  expectedOutcomes: [{
    type: String,
    trim: true
  }],
  actualOutcomes: [{
    type: String,
    trim: true
  }],
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication'
  }],
  
  // Additional Information
  notes: String,
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
fundedProjectSchema.index({ title: 'text', description: 'text', abstract: 'text' });
fundedProjectSchema.index({ 'fundingAgency.name': 1 });
fundedProjectSchema.index({ principalInvestigator: 1 });
fundedProjectSchema.index({ status: 1 });
fundedProjectSchema.index({ startDate: -1 });
fundedProjectSchema.index({ totalBudget: -1 });

// Virtual for project duration in months
fundedProjectSchema.virtual('durationInMonths').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  }
  return this.duration;
});

// Virtual for total team members
fundedProjectSchema.virtual('totalTeamMembers').get(function() {
  return 1 + this.coPrincipalInvestigators.length + this.teamMembers.length; // +1 for PI
});

// Virtual for completion percentage
fundedProjectSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'Completed') return 100;
  if (this.status === 'Active' && this.startDate && this.endDate) {
    const now = new Date();
    const totalDuration = this.endDate - this.startDate;
    const elapsed = now - this.startDate;
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }
  return 0;
});

// Method to check if faculty is involved in project
fundedProjectSchema.methods.isFacultyInvolved = function(facultyId) {
  return (
    this.principalInvestigator.toString() === facultyId.toString() ||
    this.coPrincipalInvestigators.some(coPI => coPI.faculty && coPI.faculty.toString() === facultyId.toString()) ||
    this.teamMembers.some(member => member.faculty && member.faculty.toString() === facultyId.toString())
  );
};

// Method to get faculty role in project
fundedProjectSchema.methods.getFacultyRole = function(facultyId) {
  if (this.principalInvestigator.toString() === facultyId.toString()) {
    return 'Principal Investigator';
  }
  
  const coPI = this.coPrincipalInvestigators.find(coPI => coPI.faculty && coPI.faculty.toString() === facultyId.toString());
  if (coPI) {
    return 'Co-Principal Investigator';
  }
  
  const member = this.teamMembers.find(member => member.faculty && member.faculty.toString() === facultyId.toString());
  if (member) {
    return member.role || 'Team Member';
  }
  
  return null;
};

// Ensure virtual fields are serialized
fundedProjectSchema.set('toJSON', { virtuals: true });

const FundedProject = mongoose.model('FundedProject', fundedProjectSchema);

export default FundedProject;
