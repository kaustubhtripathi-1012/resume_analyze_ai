const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    year: { type: String, default: '' }
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    duration: { type: String, default: '' },
    description: { type: String, default: '' }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: [{ type: String }]
  },
  { _id: false }
);

const parsedSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    links: [{ type: String }],
    skills: [{ type: String }],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema]
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true
    },
    rawText: {
      type: String,
      default: ''
    },
    parsed: {
      type: parsedSchema,
      default: () => ({})
    },
    status: {
      type: String,
      enum: ['uploaded', 'parsing', 'parsed', 'failed'],
      default: 'uploaded'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);

