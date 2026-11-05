const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    aliases: [{
      type: String,
      trim: true
    }],
    category: {
      type: String,
      enum: ['language', 'framework', 'tool', 'soft'],
      default: 'tool'
    }
  },
  { timestamps: true }
);

skillSchema.index({ aliases: 1 });

module.exports = mongoose.model('Skill', skillSchema);

