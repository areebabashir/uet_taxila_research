import mongoose from 'mongoose';

const thesisSupervisionSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  abstract: {
    type: String,
    trim: true
  },
  
  // Thesis Details
  thesisType: {
    type: String,
    required: true,
    enum: ['MS', 'MSc', 'MPhil', 'PhD', 'Post Doc']
  },
  degree: {
    type: String,
    required: true,
    enum: ['MS', 'MSc', 'MPhil', 'PhD', 'Post Doc']
  },
  
  // Student Information
  student: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    rollNumber: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    phone: String,
    batch: {
      type: String,
      required: true
    },
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
    cgpa: Number,
    admissionDate: Date
  },
  
  // Supervisor Information
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coSupervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // External Supervisor (if any)
  externalSupervisor: {
    name: String,
    affiliation: String,
    email: String,
    phone: String,
    designation: String,
    country: String
  },
  
  // Thesis Timeline
  startDate: {
    type: Date,
    required: true
  },
  expectedCompletionDate: {
    type: Date,
    required: true
  },
  actualCompletionDate: {
    type: Date
  },
  submissionDate: {
    type: Date
  },
  defenseDate: {
    type: Date
  },
  
  // Thesis Status
  status: {
    type: String,
    enum: ['Proposed', 'Approved', 'Course Work', 'Research Proposal', 'Data Collection', 'Analysis', 'Writing', 'Submitted', 'Under Review', 'Defended', 'Completed', 'Graduated', 'Withdrawn', 'Rejected'],
    default: 'Proposed'
  },

  // Approval Workflow
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String,
    trim: true
  },
  approvedDate: {
    type: Date
  },
  rejectedDate: {
    type: Date
  },
  
  // Research Information
  researchArea: {
    type: String,
    required: true,
    trim: true
  },
  researchMethodology: {
    type: String,
    trim: true
  },
  objectives: [{
    type: String,
    trim: true
  }],
  researchQuestions: [{
    type: String,
    trim: true
  }],
  
  // Progress Tracking
  progressReports: [{
    title: String,
    period: String,
    dueDate: Date,
    submittedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    supervisorComments: String,
    fileUrl: String
  }],
  
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed', 'Delayed'],
      default: 'Pending'
    }
  }],
  
  // Committee Information
  supervisoryCommittee: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    designation: String,
    affiliation: String,
    role: {
      type: String,
      enum: ['Chair', 'Member', 'External Examiner', 'Internal Examiner']
    },
    email: String
  }],
  
  // Defense Information
  defense: {
    date: Date,
    time: String,
    venue: String,
    examiners: [{
      name: String,
      designation: String,
      affiliation: String,
      email: String,
      role: {
        type: String,
        enum: ['External Examiner', 'Internal Examiner', 'Chair']
      }
    }],
    result: {
      type: String,
      enum: ['Pass', 'Pass with Minor Revisions', 'Pass with Major Revisions', 'Fail', 'Pending']
    },
    comments: String,
    recommendations: [{
      type: String,
      trim: true
    }]
  },
  
  // Evaluation
  evaluation: {
    supervisorEvaluation: {
      marks: Number,
      comments: String,
      date: Date
    },
    committeeEvaluation: {
      marks: Number,
      comments: String,
      date: Date
    },
    defenseEvaluation: {
      marks: Number,
      comments: String,
      date: Date
    },
    finalGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    }
  },
  
  // Publications and Outcomes
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication'
  }],
  conferencePresentations: [{
    title: String,
    conference: String,
    date: Date,
    venue: String,
    type: {
      type: String,
      enum: ['Oral', 'Poster', 'Keynote']
    }
  }],
  
  // Funding Information
  funding: {
    isFunded: {
      type: Boolean,
      default: false
    },
    fundingAgency: String,
    grantNumber: String,
    amount: Number,
    currency: {
      type: String,
      default: 'PKR'
    },
    fundingType: {
      type: String,
      enum: ['University', 'External', 'Industry', 'Government', 'NGO']
    }
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
  thesisRepository: String,
  documents: [{
    title: String,
    type: String,
    url: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
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
thesisSupervisionSchema.index({ title: 'text', abstract: 'text' });
thesisSupervisionSchema.index({ 'student.rollNumber': 1 });
thesisSupervisionSchema.index({ 'student.email': 1 });
thesisSupervisionSchema.index({ supervisor: 1 });
thesisSupervisionSchema.index({ status: 1 });
thesisSupervisionSchema.index({ startDate: -1 });
thesisSupervisionSchema.index({ thesisType: 1 });

// Virtual for thesis duration in months
thesisSupervisionSchema.virtual('durationInMonths').get(function() {
  if (this.startDate && this.actualCompletionDate) {
    const diffTime = Math.abs(this.actualCompletionDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  }
  if (this.startDate && this.expectedCompletionDate) {
    const diffTime = Math.abs(this.expectedCompletionDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  }
  return null;
});

// Virtual for completion percentage
thesisSupervisionSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'Completed' || this.status === 'Graduated') {
    return 100;
  }
  
  const statusProgress = {
    'Proposed': 5,
    'Approved': 10,
    'Course Work': 20,
    'Research Proposal': 30,
    'Data Collection': 50,
    'Analysis': 70,
    'Writing': 85,
    'Submitted': 90,
    'Under Review': 95,
    'Defended': 98
  };
  
  return statusProgress[this.status] || 0;
});

// Virtual for supervisor name
thesisSupervisionSchema.virtual('supervisorName').get(function() {
  if (!this.supervisor) return '';
  const firstName = this.supervisor.firstName || '';
  const lastName = this.supervisor.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Method to check if faculty is supervisor
thesisSupervisionSchema.methods.isFacultySupervisor = function(facultyId) {
  return (
    this.supervisor.toString() === facultyId.toString() ||
    (this.coSupervisor && this.coSupervisor.toString() === facultyId.toString()) ||
    this.supervisoryCommittee.some(member => member.member && member.member.toString() === facultyId.toString())
  );
};

// Method to get faculty role in thesis
thesisSupervisionSchema.methods.getFacultyRole = function(facultyId) {
  if (this.supervisor.toString() === facultyId.toString()) {
    return 'Supervisor';
  }
  if (this.coSupervisor && this.coSupervisor.toString() === facultyId.toString()) {
    return 'Co-Supervisor';
  }
  
  const committeeMember = this.supervisoryCommittee.find(member => 
    member.member && member.member.toString() === facultyId.toString()
  );
  if (committeeMember) {
    return committeeMember.role;
  }
  
  return null;
};

// Ensure virtual fields are serialized
thesisSupervisionSchema.set('toJSON', { virtuals: true });

const ThesisSupervision = mongoose.model('ThesisSupervision', thesisSupervisionSchema);

export default ThesisSupervision;
