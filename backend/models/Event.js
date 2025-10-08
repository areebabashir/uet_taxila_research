import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  
  // Event Details
  eventType: {
    type: String,
    required: true,
    enum: ['Seminar', 'Workshop', 'Conference', 'Symposium', 'Training', 'Webinar', 'Other']
  },
  category: {
    type: String,
    enum: ['Academic', 'Research', 'Professional Development', 'Industry', 'Community', 'Other']
  },
  
  // Organizer Information
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coOrganizers: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    role: String
  }],
  
  // External Organizers
  externalOrganizers: [{
    name: {
      type: String,
      required: true
    },
    affiliation: String,
    email: String,
    phone: String,
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
  
  // Event Details
  eventFormat: {
    type: String,
    required: true,
    enum: ['Physical', 'Online', 'Hybrid']
  },
  venue: {
    name: String,
    address: String,
    city: String,
    country: String,
    capacity: Number
  },
  onlinePlatform: {
    name: String,
    url: String,
    meetingId: String,
    password: String
  },
  
  // Date and Time
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Registration
  registration: {
    isRequired: {
      type: Boolean,
      default: false
    },
    registrationDeadline: Date,
    maxParticipants: Number,
    registrationFee: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    },
    registrationUrl: String
  },
  
  // Speakers and Presenters
  speakers: [{
    name: {
      type: String,
      required: true
    },
    affiliation: String,
    email: String,
    phone: String,
    designation: String,
    bio: String,
    photo: String,
    isKeynote: {
      type: Boolean,
      default: false
    },
    sessionTitle: String,
    sessionTime: String
  }],
  
  // Participants
  participants: [{
    name: String,
    email: String,
    affiliation: String,
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attendanceStatus: {
      type: String,
      enum: ['Registered', 'Attended', 'Absent'],
      default: 'Registered'
    }
  }],
  
  // Event Status
  status: {
    type: String,
    enum: ['Planned', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Postponed', 'Proposed', 'Approved', 'Rejected'],
    default: 'Planned'
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
  
  // Evidence and Documentation
  evidence: {
    attendanceSheet: String,
    photos: [String],
    videos: [String],
    presentations: [{
      title: String,
      speaker: String,
      url: String,
      uploadedDate: {
        type: Date,
        default: Date.now
      }
    }],
    certificates: [String],
    feedback: [{
      participant: String,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
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
  eventWebsite: String,
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
eventSchema.index({ title: 'text', description: 'text', abstract: 'text' });
eventSchema.index({ organizer: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ startDate: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'registration.isRequired': 1 });

// Virtual for event duration in hours
eventSchema.virtual('durationInHours').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for total participants
eventSchema.virtual('totalParticipants').get(function() {
  return this.participants.length;
});

// Virtual for attendance rate
eventSchema.virtual('attendanceRate').get(function() {
  if (this.participants.length === 0) return 0;
  const attended = this.participants.filter(p => p.attendanceStatus === 'Attended').length;
  return (attended / this.participants.length) * 100;
});

// Virtual for organizer name
eventSchema.virtual('organizerName').get(function() {
  if (!this.organizer) return '';
  // When populated, organizer is a User document; otherwise it's an ObjectId
  const org = this.organizer;
  const firstName = org.firstName || '';
  const lastName = org.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Method to check if faculty is organizer
eventSchema.methods.isFacultyOrganizer = function(facultyId) {
  return (
    this.organizer.toString() === facultyId.toString() ||
    this.coOrganizers.some(coOrg => coOrg.faculty && coOrg.faculty.toString() === facultyId.toString())
  );
};

// Method to get faculty role in event
eventSchema.methods.getFacultyRole = function(facultyId) {
  if (this.organizer.toString() === facultyId.toString()) {
    return 'Organizer';
  }
  
  const coOrganizer = this.coOrganizers.find(coOrg => 
    coOrg.faculty && coOrg.faculty.toString() === facultyId.toString()
  );
  if (coOrganizer) {
    return coOrganizer.role || 'Co-Organizer';
  }
  
  return null;
};

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
