import mongoose from 'mongoose';

const finalYearProjectSchema = new mongoose.Schema({
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
    enum: ['FYP', 'Capstone', 'Thesis', 'Research Project', 'Design Project']
  },
  category: {
    type: String,
    enum: ['Software', 'Hardware', 'Research', 'Design', 'Analysis', 'Implementation', 'Other']
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
    degree: {
      type: String,
      required: true,
      enum: ['BS', 'BE', 'BSc', 'MS', 'MSc', 'ME', 'MPhil', 'PhD']
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
    cgpa: Number
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
    designation: String
  },
  
  // Project Timeline
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  submissionDate: {
    type: Date
  },
  defenseDate: {
    type: Date
  },
  
  // Project Status
  status: {
    type: String,
    enum: ['Proposed', 'Approved', 'In Progress', 'Completed', 'Defended', 'Graded', 'Rejected'],
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
  
  // Project Requirements
  requirements: [{
    type: String,
    trim: true
  }],
  objectives: [{
    type: String,
    trim: true
  }],
  methodology: {
    type: String,
    trim: true
  },
  
  // Deliverables
  deliverables: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['Report', 'Software', 'Hardware', 'Presentation', 'Demo', 'Other']
    },
    dueDate: Date,
    submittedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    fileUrl: String
  }],
  
  // Evaluation
  evaluation: {
    supervisorMarks: {
      type: Number,
      min: 0,
      max: 100
    },
    externalMarks: {
      type: Number,
      min: 0,
      max: 100
    },
    defenseMarks: {
      type: Number,
      min: 0,
      max: 100
    },
    totalMarks: {
      type: Number,
      min: 0,
      max: 100
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
    },
    evaluators: [{
      name: String,
      designation: String,
      affiliation: String,
      email: String
    }]
  },
  
  // Technical Details
  technologies: [{
    type: String,
    trim: true
  }],
  tools: [{
    type: String,
    trim: true
  }],
  programmingLanguages: [{
    type: String,
    trim: true
  }],
  
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
  projectRepository: String,
  demoUrl: String,
  documents: [{
    title: String,
    type: String,
    url: String,
    uploadedDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publications and Outcomes
  publications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication'
  }],
  outcomes: [{
    type: String,
    trim: true
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
finalYearProjectSchema.index({ title: 'text', description: 'text', abstract: 'text' });
finalYearProjectSchema.index({ 'student.rollNumber': 1 });
finalYearProjectSchema.index({ 'student.email': 1 });
finalYearProjectSchema.index({ supervisor: 1 });
finalYearProjectSchema.index({ status: 1 });
finalYearProjectSchema.index({ startDate: -1 });
finalYearProjectSchema.index({ 'student.batch': 1 });

// Virtual for project duration in months
finalYearProjectSchema.virtual('durationInMonths').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  }
  return null;
});

// Virtual for completion percentage
finalYearProjectSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'Completed' || this.status === 'Defended' || this.status === 'Graded') {
    return 100;
  }
  if (this.status === 'In Progress' && this.startDate && this.endDate) {
    const now = new Date();
    const totalDuration = this.endDate - this.startDate;
    const elapsed = now - this.startDate;
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }
  return 0;
});

// Virtual for supervisor name
finalYearProjectSchema.virtual('supervisorName').get(function() {
  if (!this.supervisor) return '';
  const firstName = this.supervisor.firstName || '';
  const lastName = this.supervisor.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Method to check if faculty is supervisor
finalYearProjectSchema.methods.isFacultySupervisor = function(facultyId) {
  return (
    this.supervisor.toString() === facultyId.toString() ||
    (this.coSupervisor && this.coSupervisor.toString() === facultyId.toString())
  );
};

// Method to get faculty role in project
finalYearProjectSchema.methods.getFacultyRole = function(facultyId) {
  if (this.supervisor.toString() === facultyId.toString()) {
    return 'Supervisor';
  }
  if (this.coSupervisor && this.coSupervisor.toString() === facultyId.toString()) {
    return 'Co-Supervisor';
  }
  return null;
};

// Ensure virtual fields are serialized
finalYearProjectSchema.set('toJSON', { virtuals: true });

const FinalYearProject = mongoose.model('FinalYearProject', finalYearProjectSchema);

export default FinalYearProject;
