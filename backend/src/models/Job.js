const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    requiredSkills: [{
      type: String,
      trim: true
    }],
    location: {
      type: String,
      default: 'Remote'
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior'],
      default: 'fresher'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ requiredSkills: 1 });

module.exports = mongoose.model('Job', jobSchema);

