const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const nlpClient = require('../services/nlpClient');
const { getPaginationParams } = require('../utils/pagination');

const jobController = {
  async list(req, res, next) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query);
      const { q, skill, level } = req.query;

      const filter = { isActive: true };
      if (q) {
        filter.$text = { $search: q };
      }
      if (skill) {
        filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };
      }
      if (level) {
        filter.experienceLevel = level;
      }

      const [items, total] = await Promise.all([
        Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Job.countDocuments(filter)
      ]);

      res.status(200).json({ items, total, page, limit });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        const err = new Error('Job not found.');
        err.statusCode = 404;
        err.code = 'JOB_NOT_FOUND';
        throw err;
      }
      res.status(200).json({ job });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, company, description, requiredSkills, location, experienceLevel } = req.body;

      const job = await Job.create({
        postedBy: req.user.id,
        title,
        company,
        description,
        requiredSkills: requiredSkills || [],
        location: location || 'Remote',
        experienceLevel: experienceLevel || 'fresher'
      });

      res.status(201).json({ job });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        const err = new Error('Job not found.');
        err.statusCode = 404;
        err.code = 'JOB_NOT_FOUND';
        throw err;
      }

      if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
        const err = new Error('Access denied. You can only edit jobs you posted.');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      Object.assign(job, req.body);
      await job.save();

      res.status(200).json({ job });
    } catch (err) {
      next(err);
    }
  },

  async getCandidates(req, res, next) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        const err = new Error('Job not found.');
        err.statusCode = 404;
        err.code = 'JOB_NOT_FOUND';
        throw err;
      }

      if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
        const err = new Error('Access denied. Only the recruiter who posted this job or an admin can view candidates.');
        err.statusCode = 403;
        err.code = 'FORBIDDEN';
        throw err;
      }

      // Find candidates who have visibleToRecruiters = true
      const visibleUsers = await User.find({ visibleToRecruiters: true, isActive: true }).select('_id name');
      const userIds = visibleUsers.map((u) => u._id);

      // Find their latest parsed resumes
      const resumes = await Resume.find({
        userId: { $in: userIds },
        status: 'parsed'
      }).sort({ createdAt: -1 });

      const jobText = `${job.title} ${job.description}`;
      const candidates = [];

      for (const r of resumes) {
        const matchRes = await nlpClient.match(r.parsed, jobText, job.requiredSkills, job.experienceLevel);
        candidates.push({
          resumeId: r._id.toString(),
          candidateAlias: `Candidate #${r._id.toString().slice(-4).toUpperCase()}`,
          matchPercent: matchRes.matchPercent,
          topSkills: (r.parsed?.skills || []).slice(0, 6),
          matchedSkills: matchRes.matchedSkills,
          education: (r.parsed?.education || [])[0]?.degree || 'Degree not specified'
        });
      }

      candidates.sort((a, b) => b.matchPercent - a.matchPercent);

      const limit = parseInt(req.query.limit, 10) || 20;
      res.status(200).json({ items: candidates.slice(0, limit) });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = jobController;

