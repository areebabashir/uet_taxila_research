import mongoose from 'mongoose';

const travelGrantSchema = new mongoose.Schema({
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
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  
  // Event Information
  event: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Conference', 'Workshop', 'Seminar', 'Training', 'Research Visit', 'Collaboration', 'Other']
    },
    venue: {
      name: String,
      address: String,
      city: String,
      country: String
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    website: String,
    organizer: String
  },
  
  // Applicant Information
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
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
  
  // Travel Details
  travelDetails: {
    departureDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      required: true
    },
    departureCity: {
      type: String,
      required: true
    },
    destinationCity: {
      type: String,
      required: true
    },
    destinationCountry: {
      type: String,
      required: true
    },
    transportMode: {
      type: String,
      enum: ['Air', 'Rail', 'Road', 'Sea', 'Train', 'Bus', 'Car', 'Other']
    },
    travelMode: {
      type: String,
      enum: ['Air', 'Train', 'Bus', 'Car', 'Other']
    },
    accommodation: {
      name: String,
      address: String,
      cost: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    }
  },
  
  // Funding Information
  funding: {
    fundingAgency: {
      name: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['University', 'External', 'Industry', 'Government', 'NGO', 'International']
      },
      country: String,
      website: String,
      contactPerson: {
        name: String,
        email: String,
        phone: String
      }
    },
    grantNumber: String,
    totalAmount: {
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
    externalShare: {
      type: Number,
      default: 0
    }
  },
  
  // Budget Breakdown
  budgetBreakdown: {
    airfare: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    accommodation: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    meals: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    localTransport: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    registrationFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    visaFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      }
    },
    other: {
      amount: Number,
      currency: {
        type: String,
        default: 'PKR'
      },
      description: String
    }
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  
  // Approval Process
  submittedDate: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: String,
  reviewDate: Date,
  approvedDate: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Evidence and Documentation
  evidence: {
    invitationLetter: String,
    acceptanceLetter: String,
    conferenceProgram: String,
    travelItinerary: String,
    boardingPasses: [String],
    hotelReceipts: [String],
    mealReceipts: [String],
    transportReceipts: [String],
    registrationReceipt: String,
    visaDocuments: [String],
    passportCopy: String,
    otherDocuments: [{
      title: String,
      url: String,
      uploadedDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Post-Travel Information
  postTravel: {
    completionDate: Date,
    reportSubmitted: {
      type: Boolean,
      default: false
    },
    reportUrl: String,
    reportDate: Date,
    outcomes: [{
      type: String,
      trim: true
    }],
    publications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Publication'
    }],
    collaborations: [{
      name: String,
      affiliation: String,
      email: String,
      country: String
    }],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      date: Date
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
travelGrantSchema.index({ title: 'text', description: 'text', purpose: 'text' });
travelGrantSchema.index({ applicant: 1 });
travelGrantSchema.index({ 'event.name': 1 });
travelGrantSchema.index({ 'event.startDate': -1 });
travelGrantSchema.index({ status: 1 });
travelGrantSchema.index({ 'funding.fundingAgency.name': 1 });

// Virtual for total travel duration in days
travelGrantSchema.virtual('travelDurationInDays').get(function() {
  if (this.travelDetails.departureDate && this.travelDetails.returnDate) {
    const diffTime = Math.abs(this.travelDetails.returnDate - this.travelDetails.departureDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for total budget
travelGrantSchema.virtual('totalBudget').get(function() {
  const breakdown = this.budgetBreakdown;
  return (
    (breakdown.airfare?.amount || 0) +
    (breakdown.accommodation?.amount || 0) +
    (breakdown.meals?.amount || 0) +
    (breakdown.localTransport?.amount || 0) +
    (breakdown.registrationFee?.amount || 0) +
    (breakdown.visaFee?.amount || 0) +
    (breakdown.other?.amount || 0)
  );
});

// Virtual for applicant name
travelGrantSchema.virtual('applicantName').get(function() {
  if (!this.applicant) return '';
  const a = this.applicant;
  const firstName = a.firstName || '';
  const lastName = a.lastName || '';
  return `${firstName} ${lastName}`.trim();
});

// Method to check if faculty is applicant
travelGrantSchema.methods.isFacultyApplicant = function(facultyId) {
  return this.applicant.toString() === facultyId.toString();
};

// Method to get faculty role in travel grant
travelGrantSchema.methods.getFacultyRole = function(facultyId) {
  if (this.applicant.toString() === facultyId.toString()) {
    return 'Applicant';
  }
  if (this.reviewedBy && this.reviewedBy.toString() === facultyId.toString()) {
    return 'Reviewer';
  }
  if (this.approvedBy && this.approvedBy.toString() === facultyId.toString()) {
    return 'Approver';
  }
  return null;
};

// Ensure virtual fields are serialized
travelGrantSchema.set('toJSON', { virtuals: true });

const TravelGrant = mongoose.model('TravelGrant', travelGrantSchema);

export default TravelGrant;
