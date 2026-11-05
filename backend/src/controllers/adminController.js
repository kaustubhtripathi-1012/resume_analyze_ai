const adminService = require('../services/adminService');

const adminController = {
  async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const q = req.query.q || '';
      const result = await adminService.getUsers(page, limit, q);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { isActive, role } = req.body;
      const user = await adminService.updateUser(req.params.id, { isActive, role }, req.user.id);
      res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  },

  async getSkills(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const q = req.query.q || '';
      const category = req.query.category || '';
      const result = await adminService.getSkills(page, limit, q, category);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async createSkill(req, res, next) {
    try {
      const { name, aliases, category } = req.body;
      const skill = await adminService.createSkill({ name, aliases, category }, req.user.id);
      res.status(201).json({ skill });
    } catch (err) {
      next(err);
    }
  },

  async updateSkill(req, res, next) {
    try {
      const skill = await adminService.updateSkill(req.params.id, req.body, req.user.id);
      res.status(200).json({ skill });
    } catch (err) {
      next(err);
    }
  },

  async deleteSkill(req, res, next) {
    try {
      await adminService.deleteSkill(req.params.id, req.user.id);
      res.status(200).json({ message: 'Skill deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req, res, next) {
    try {
      const stats = await adminService.getAnalytics();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = adminController;

