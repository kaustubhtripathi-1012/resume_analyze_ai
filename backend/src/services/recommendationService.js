const Recommendation = require('../models/Recommendation');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const nlpClient = require('./nlpClient');

const CACHE_TTL_HOURS = 24;

const recommendationService = {
  async getRecommendations(resumeId, userId, limit = 10) {
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

    // Check existing cached recommendation
    const cached = await Recommendation.findOne({ resumeId }).populate('items.jobId');
    const isStale = cached && ((Date.now() - new Date(cached.generatedAt).getTime()) > CACHE_TTL_HOURS * 60 * 60 * 1000);

    if (cached && !isStale && cached.items.length > 0) {
      return {
        items: cached.items.slice(0, limit).map((it) => ({
          job: it.jobId,
          matchPercent: it.matchPercent,
          reason: it.reason
        }))
      };
    }

    // Fetch active jobs from DB
    const activeJobs = await Job.find({ isActive: true }).limit(50);
    if (!activeJobs.length) {
      return { items: [] };
    }

    const nlpJobsPayload = activeJobs.map((j) => ({
      _id: j._id.toString(),
      title: j.title,
      company: j.company,
      description: j.description,
      requiredSkills: j.requiredSkills,
      experienceLevel: j.experienceLevel
    }));

    // Call NLP recommend endpoint
    const recResult = await nlpClient.recommend(resume.parsed, nlpJobsPayload, limit);
    const recItems = recResult.items || [];

    const dbItems = recItems.map((r) => ({
      jobId: r.jobId,
      matchPercent: r.matchPercent,
      reason: r.reason
    }));

    // Upsert cached recommendations
    await Recommendation.findOneAndUpdate(
      { resumeId },
      {
        resumeId,
        items: dbItems,
        generatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Populate job data for response
    const jobMap = new Map(activeJobs.map((j) => [j._id.toString(), j]));
    const formatted = recItems.map((r) => ({
      job: jobMap.get(r.jobId) || { _id: r.jobId, title: r.title, company: r.company },
      matchPercent: r.matchPercent,
      reason: r.reason
    }));

    return { items: formatted };
  }
};

module.exports = recommendationService;

