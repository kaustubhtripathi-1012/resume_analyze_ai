const User = require('../models/User');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const Skill = require('../models/Skill');
const AuditLog = require('../models/AuditLog');

const adminService = {
  async getUsers(page = 1, limit = 10, q = '') {
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    return { items, total, page, limit };
  },

  async updateUser(targetUserId, { isActive, role }, adminId) {
    if (targetUserId.toString() === adminId.toString() && role && role !== 'admin') {
      const err = new Error('Admin cannot remove their own admin privileges.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN_SELF_DEMOTION';
      throw err;
    }

    const updateFields = {};
    if (typeof isActive === 'boolean') updateFields.isActive = isActive;
    if (role) updateFields.role = role;

    const user = await User.findByIdAndUpdate(targetUserId, updateFields, { new: true }).select('-passwordHash');
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    await AuditLog.create({
      actorId: adminId,
      action: 'UPDATE_USER',
      target: targetUserId,
      meta: updateFields
    });

    return user;
  },

  async getSkills(page = 1, limit = 50, q = '', category = '') {
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { aliases: { $regex: q, $options: 'i' } }
      ];
    }
    if (category) {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Skill.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Skill.countDocuments(filter)
    ]);

    return { items, total, page, limit };
  },

  async createSkill({ name, aliases = [], category = 'tool' }, adminId) {
    const existing = await Skill.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      const err = new Error('A skill with this name already exists.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_SKILL';
      throw err;
    }

    const skill = await Skill.create({
      name: name.trim(),
      aliases: aliases.map((a) => a.trim()).filter(Boolean),
      category
    });

    await AuditLog.create({
      actorId: adminId,
      action: 'CREATE_SKILL',
      target: skill._id.toString(),
      meta: { name: skill.name }
    });

    return skill;
  },

  async updateSkill(id, data, adminId) {
    const skill = await Skill.findByIdAndUpdate(id, data, { new: true });
    if (!skill) {
      const err = new Error('Skill not found.');
      err.statusCode = 404;
      err.code = 'SKILL_NOT_FOUND';
      throw err;
    }

    await AuditLog.create({
      actorId: adminId,
      action: 'UPDATE_SKILL',
      target: id,
      meta: data
    });

    return skill;
  },

  async deleteSkill(id, adminId) {
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      const err = new Error('Skill not found.');
      err.statusCode = 404;
      err.code = 'SKILL_NOT_FOUND';
      throw err;
    }

    await AuditLog.create({
      actorId: adminId,
      action: 'DELETE_SKILL',
      target: id,
      meta: { name: skill.name }
    });

    return { success: true };
  },

  async getAnalytics() {
    const [totalUsers, totalResumes, avgAtsAgg, topSkillsAgg] = await Promise.all([
      User.countDocuments(),
      Resume.countDocuments(),
      Analysis.aggregate([
        { $match: { status: 'done', atsScore: { $gt: 0 } } },
        { $group: { _id: null, avgScore: { $avg: '$atsScore' } } }
      ]),
      Resume.aggregate([
        { $unwind: '$parsed.skills' },
        { $group: { _id: '$parsed.skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, skill: '$_id', count: 1 } }
      ])
    ]);

    const avgAtsScore = avgAtsAgg.length > 0 ? Math.round(avgAtsAgg[0].avgScore) : 0;

    return {
      users: totalUsers,
      resumes: totalResumes,
      avgAtsScore,
      topSkills: topSkillsAgg
    };
  }
};

module.exports = adminService;

