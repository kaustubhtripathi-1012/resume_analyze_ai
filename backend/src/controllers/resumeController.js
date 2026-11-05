const resumeService = require('../services/resumeService');
const analysisService = require('../services/analysisService');
const recommendationService = require('../services/recommendationService');

const resumeController = {
  async upload(req, res, next) {
    try {
      const result = await resumeService.uploadResume(req.user.id, req.file);
      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const resumes = await resumeService.getUserResumes(req.user.id);
      res.status(200).json({ items: resumes });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const resume = await resumeService.getResumeById(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        resume: {
          id: resume._id.toString(),
          fileName: resume.fileName,
          fileType: resume.fileType,
          createdAt: resume.createdAt
        },
        parsed: resume.parsed,
        status: resume.status
      });
    } catch (err) {
      next(err);
    }
  },

  async updateParsed(req, res, next) {
    try {
      const updated = await resumeService.updateParsedProfile(req.params.id, req.user.id, req.body);
      res.status(200).json({
        resume: updated
      });
    } catch (err) {
      next(err);
    }
  },

  async analyze(req, res, next) {
    try {
      const { jobId, jobText } = req.body || {};
      const result = await analysisService.createAnalysis(req.params.id, req.user.id, { jobId, jobText });
      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getRecommendations(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const result = await recommendationService.getRecommendations(req.params.id, req.user.id, limit);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = resumeController;

