const mongoose = require('mongoose');

const recommendationItemSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    matchPercent: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
      unique: true
    },
    items: [recommendationItemSchema],
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);

