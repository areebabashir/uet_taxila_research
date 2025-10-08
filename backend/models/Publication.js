import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema({
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
  
  // Publication Details
  publicationType: {
    type: String,
    required: true,
    enum: ['Journal Article', 'Conference Paper', 'Book Chapter', 'Book', 'Patent', 'Technical Report', 'Other']
  },
  
  // DOI and External IDs
  doi: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  isbn: {
    type: String,
    trim: true
  },
  issn: {
    type: String,
    trim: true
  },
  arxivId: {
    type: String,
    trim: true
  },
  
  // Journal/Conference Information
  journalName: {
    type: String,
    trim: true
  },
  conferenceName: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  volume: {
    type: String,
    trim: true
  },
  issue: {
    type: String,
    trim: true
  },
  pages: {
    type: String,
    trim: true
  },
  
  // Publication Dates
  publicationDate: {
    type: Date,
    required: true
  },
  acceptanceDate: {
    type: Date
  },
  submissionDate: {
    type: Date
  },
  
  // Authors Information
  authors: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: String,
    affiliation: String,
    isCorrespondingAuthor: {
      type: Boolean,
      default: false
    },
    authorOrder: {
      type: Number,
      required: true
    }
  }],
  
  // External Authors (non-faculty)
  externalAuthors: [{
    name: {
      type: String,
      required: true
    },
    email: String,
    affiliation: String,
    isCorrespondingAuthor: {
      type: Boolean,
      default: false
    },
    authorOrder: {
      type: Number,
      required: true
    }
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
  
  // Metrics and Impact
  citationCount: {
    type: Number,
    default: 0
  },
  impactFactor: {
    type: Number
  },
  hIndex: {
    type: Number
  },
  quartile: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4']
  },
  
  // Keywords and Categories
  keywords: [{
    type: String,
    trim: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  
  // Links and Files
  url: {
    type: String,
    trim: true
  },
  pdfUrl: {
    type: String,
    trim: true
  },
  supplementaryFiles: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  
  // Funding Information
  fundingAgencies: [{
    name: String,
    grantNumber: String,
    amount: Number
  }],
  
  // Approval Workflow
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Published'],
    default: 'Draft'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewComments: {
    type: String,
    trim: true
  },
  reviewDate: {
    type: Date
  },
  
  // Visibility and Access
  isPublic: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Additional Information
  language: {
    type: String,
    default: 'English'
  },
  country: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
publicationSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
publicationSchema.index({ doi: 1 });
publicationSchema.index({ publicationType: 1 });
publicationSchema.index({ publicationDate: -1 });
publicationSchema.index({ status: 1 });
publicationSchema.index({ 'authors.faculty': 1 });

// Virtual for total authors count
publicationSchema.virtual('totalAuthors').get(function() {
  return this.authors.length + this.externalAuthors.length;
});

// Virtual for faculty authors only
publicationSchema.virtual('facultyAuthors').get(function() {
  return this.authors.filter(author => author.faculty);
});

// Virtual for corresponding authors
publicationSchema.virtual('correspondingAuthors').get(function() {
  const facultyCorresponding = this.authors.filter(author => author.isCorrespondingAuthor);
  const externalCorresponding = this.externalAuthors.filter(author => author.isCorrespondingAuthor);
  return [...facultyCorresponding, ...externalCorresponding];
});

// Method to get all authors sorted by order
publicationSchema.methods.getAllAuthorsSorted = function() {
  const allAuthors = [...this.authors, ...this.externalAuthors];
  return allAuthors.sort((a, b) => a.authorOrder - b.authorOrder);
};

// Method to check if faculty is author
publicationSchema.methods.isFacultyAuthor = function(facultyId) {
  return this.authors.some(author => author.faculty && author.faculty.toString() === facultyId.toString());
};

// Ensure virtual fields are serialized
publicationSchema.set('toJSON', { virtuals: true });

const Publication = mongoose.model('Publication', publicationSchema);

export default Publication;
