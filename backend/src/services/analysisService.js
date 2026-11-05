const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const nlpClient = require('./nlpClient');
const logger = require('../utils/logger');

const analysisService = {
  async createAnalysis(resumeId, userId, { jobId, jobText }) {
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

    let job = null;
    let effectiveJobText = jobText || '';
    let jobSkills = [];
    let jobLevel = 'fresher';

    if (jobId) {
      job = await Job.findById(jobId);
      if (job) {
        effectiveJobText = `${job.title} ${job.description} ${(job.requiredSkills || []).join(' ')}`;
        jobSkills = job.requiredSkills || [];
        jobLevel = job.experienceLevel || 'fresher';
      }
    }

    const analysis = await Analysis.create({
      resumeId: resume._id,
      jobId: job ? job._id : null,
      status: 'pending'
    });

    // Run scoring & matching asynchronously
    this.runAnalysisAsync(analysis._id, resume, effectiveJobText, jobSkills, jobLevel);

    return {
      analysisId: analysis._id.toString(),
      status: 'pending'
    };
  },

  async runAnalysisAsync(analysisId, resume, jobText, jobSkills, jobLevel) {
    try {
      // 1. ATS Scoring
      const scoreResult = await nlpClient.score(resume.parsed, resume.rawText || '');

      let matchResult = null;
      if (jobText) {
        // 2. Job Matching
        matchResult = await nlpClient.match(resume.parsed, jobText, jobSkills, jobLevel);
      }

      await Analysis.findByIdAndUpdate(analysisId, {
        atsScore: scoreResult.atsScore || 0,
        breakdown: scoreResult.breakdown || {},
        suggestions: scoreResult.suggestions || [],
        matchPercent: matchResult ? matchResult.matchPercent : null,
        matchedSkills: matchResult ? matchResult.matchedSkills : [],
        missingSkills: matchResult ? matchResult.missingSkills : [],
        status: 'done'
      });

      logger.info(`Analysis ${analysisId} completed successfully.`);
    } catch (err) {
      logger.error(`Analysis ${analysisId} failed: ${err.message}`);
      await Analysis.findByIdAndUpdate(analysisId, {
        status: 'failed',
        suggestions: ['Analysis could not complete at this time. Please retry.']
      });
    }
  },

  async getAnalysisById(analysisId, userId, role) {
    const analysis = await Analysis.findById(analysisId).populate('jobId', 'title company location');
    if (!analysis) {
      const err = new Error('Analysis report not found.');
      err.statusCode = 404;
      err.code = 'ANALYSIS_NOT_FOUND';
      throw err;
    }

    const resume = await Resume.findById(analysis.resumeId);
    if (!resume) {
      const err = new Error('Associated resume not found.');
      err.statusCode = 404;
      err.code = 'RESUME_NOT_FOUND';
      throw err;
    }

    if (role !== 'admin' && resume.userId.toString() !== userId.toString()) {
      const err = new Error('Access denied. You do not own this analysis report.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return {
      id: analysis._id.toString(),
      resumeId: analysis.resumeId.toString(),
      job: analysis.jobId,
      status: analysis.status,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      matchPercent: analysis.matchPercent,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      suggestions: analysis.suggestions,
      createdAt: analysis.createdAt
    };
  },

  async getResumeAnalyses(resumeId, userId, role) {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      const err = new Error('Resume not found.');
      err.statusCode = 404;
      err.code = 'RESUME_NOT_FOUND';
      throw err;
    }

    if (role !== 'admin' && resume.userId.toString() !== userId.toString()) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    return Analysis.find({ resumeId }).sort({ createdAt: -1 });
  }
};

module.exports = analysisService;

