const authService = require('../services/authService');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, role, visibleToRecruiters } = req.body;
      const result = await authService.register({ name, email, password, role, visibleToRecruiters });

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await authService.refresh(token);

      res.status(200).json({
        accessToken: result.accessToken
      });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res) {
    res.status(200).json({
      user: req.user
    });
  },

  async logout(req, res) {
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logged out successfully.' });
  }
};

module.exports = authController;

