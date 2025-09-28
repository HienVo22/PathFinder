import mongoose from 'mongoose';
import path from 'path';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
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
  // Profile fields for future ML features
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    trim: true
  },
  jobPreferences: {
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
  }
}, {
  timestamps: true
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

