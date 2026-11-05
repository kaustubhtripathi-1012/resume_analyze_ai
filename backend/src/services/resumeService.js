const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const nlpClient = require('./nlpClient');
const { verifyMagicBytes } = require('../middleware/upload');
const logger = require('../utils/logger');

const resumeService = {
  async uploadResume(userId, file) {
    if (!file) {
      const err = new Error('No resume file provided.');
      err.statusCode = 400;
      err.code = 'NO_FILE';
      throw err;
    }

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : 'docx';

    // Verify magic bytes
    const isValidMagic = verifyMagicBytes(file.path, fileType);
    if (!isValidMagic) {
      // Delete corrupted or disguised file
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      const err = new Error(`File content does not match extension .${fileType} (corrupted or invalid magic bytes).`);
      err.statusCode = 400;
      err.code = 'INVALID_FILE_CONTENT';
      throw err;
    }

    const resume = await Resume.create({
      userId,
      fileName: file.originalname,
      filePath: file.path,
      fileType,
      status: 'parsing'
    });

    // Trigger async parsing
    this.parseResumeAsync(resume._id, file.path, fileType);

    return {
      resumeId: resume._id.toString(),
      status: 'parsing'
    };
  },

  async parseResumeAsync(resumeId, filePath, fileType) {
    try {
      const result = await nlpClient.parse(filePath, fileType);
      await Resume.findByIdAndUpdate(resumeId, {
        rawText: result.rawText || '',
        parsed: result.parsed || {},
        status: 'parsed'
      });
      logger.info(`Resume ${resumeId} successfully parsed.`);
    } catch (err) {
      logger.error(`Resume ${resumeId} parsing failed: ${err.message}`);
      await Resume.findByIdAndUpdate(resumeId, {
        status: 'failed'
      });
    }
  },

  async getResumeById(resumeId, userId, role) {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      const err = new Error('Resume not found.');
      err.statusCode = 404;
      err.code = 'RESUME_NOT_FOUND';
      throw err;
    }

    if (role !== 'admin' && resume.userId.toString() !== userId.toString()) {
      const err = new Error('Access denied. You do not own this resume.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return resume;
  },

  async getUserResumes(userId) {
    return Resume.find({ userId }).sort({ createdAt: -1 });
  },

  async updateParsedProfile(resumeId, userId, parsedData) {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      const err = new Error('Resume not found.');
      err.statusCode = 404;
      err.code = 'RESUME_NOT_FOUND';
      throw err;
    }

    if (resume.userId.toString() !== userId.toString()) {
      const err = new Error('Access denied. You do not own this resume.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    // Merge/update parsed profile
    resume.parsed = {
      ...resume.parsed.toObject(),
      ...parsedData
    };
    await resume.save();

    return resume;
  }
};

module.exports = resumeService;

