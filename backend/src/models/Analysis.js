const mongoose = require('mongoose');

const breakdownSchema = new mongoose.Schema(
  {
    format: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    sections: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
    length: { type: Number, default: 0 },
    contactInfo: { type: Number, default: 0 }
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      index: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null
    },
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    breakdown: {
      type: breakdownSchema,
      default: () => ({})
    },
    matchPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    suggestions: [{ type: String }],
    status: {
      type: String,
      enum: ['pending', 'done', 'failed'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

analysisSchema.index({ resumeId: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);

