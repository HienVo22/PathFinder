import mongoose from 'mongoose';
import path from 'path';

const trackedJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    trim: true
  },
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  location: { type: String, trim: true },
  locationType: { type: String, trim: true },
  salary: { type: String, trim: true },
  type: { type: String, trim: true },
  jobLink: { type: String, trim: true },
  applyLink: { type: String, trim: true },
  companyLogo: { type: String, trim: true },
  postedDisplay: { type: String, trim: true },
  matchPercentage: { type: Number, default: null },
  status: {
    type: String,
    enum: ['saved', 'applied'],
    default: 'saved'
  },
  savedAt: { type: Date, default: Date.now },
  appliedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.isOAuthUser; // Password only required for non-OAuth users
    }
  },
  isOAuthUser: {
    type: Boolean,
    default: false
  },
  // Resume fields
  resumePath: {
    type: String,
    default: null
  },
  resumeOriginalName: {
    type: String,
    default: null
  },
  resumeUploadedAt: {
    type: Date,
    default: null
  },
  // DB-stored copy of the resume (keeps a copy in MongoDB in addition to disk)
  resumeFilename: {
    type: String,
    default: null
  },
  resumeContentType: {
    type: String,
    default: null
  },
  resumeData: {
    type: Buffer,
    default: null
  },
  
  // Profile fields for future ML features
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  
  // AI-parsed resume data
  parsedResumeData: {
    extractedSkills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      trim: true
    },
    education: {
      type: String,
      trim: true
    },
    jobTitles: [{
      type: String,
      trim: true
    }],
    companies: [{
      type: String,
      trim: true
    }],
    yearsOfExperience: {
      type: Number,
      default: 0
    },
    parsedAt: {
      type: Date,
      default: null
    },
    parsingMethod: {
      type: String,
      enum: ['ollama', 'fallback', 'failed'],
      default: 'ollama'
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  jobPreferences: {
    // Legacy/simple fields (kept for backward compatibility)
    location: String,
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time'
    },
    remotePreference: {
      type: String,
      enum: ['remote', 'hybrid', 'on-site', 'any'],
      default: 'any'
    },
    salaryRange: {
      min: Number,
      max: Number
    }
  },
  trackedJobs: {
    type: [trackedJobSchema],
    default: []
  }
}, {
  timestamps: true
});

// LinkedIn OAuth fields
userSchema.add({
  linkedinId: { type: String, index: true, unique: false, sparse: true },
  linkedinAccessToken: { type: String, default: null },
  linkedinProfileUrl: { type: String, default: null },
  linkedinProfilePicture: { type: String, default: null }
});

// Index for email lookups
userSchema.index({ email: 1 });

// Virtual for resume URL
userSchema.virtual('resumeUrl').get(function() {
  if (this.resumePath) {
    const filename = path.basename(this.resumePath);
    return `/api/upload/resume?file=${filename}`;
  }
  return null;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);

