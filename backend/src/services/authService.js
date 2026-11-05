const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES }
  );

  return { accessToken, refreshToken };
}

const authService = {
  async register({ name, email, password, role = 'candidate', visibleToRecruiters = false }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('A user with this email address already exists.');
      err.statusCode = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    // Hash password with bcrypt cost 12
    const passwordHash = await bcrypt.hash(password, 12);

    // Normal registration is restricted to candidate unless explicitly overridden
    const assignedRole = role === 'admin' ? 'candidate' : role;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      visibleToRecruiters
    });

    const tokens = generateTokens(user._id.toString(), user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        visibleToRecruiters: user.visibleToRecruiters
      },
      ...tokens
    };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Account has been deactivated. Please contact support.');
      err.statusCode = 403;
      err.code = 'ACCOUNT_DEACTIVATED';
      throw err;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const tokens = generateTokens(user._id.toString(), user.role);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        visibleToRecruiters: user.visibleToRecruiters
      },
      ...tokens
    };
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      const err = new Error('Refresh token is required.');
      err.statusCode = 401;
      err.code = 'REFRESH_TOKEN_REQUIRED';
      throw err;
    }

    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
      const user = await User.findById(payload.userId);
      if (!user || !user.isActive) {
        const err = new Error('User no longer exists or is deactivated.');
        err.statusCode = 401;
        err.code = 'USER_NOT_FOUND';
        throw err;
      }

      const { accessToken } = generateTokens(user._id.toString(), user.role);
      return { accessToken };
    } catch (err) {
      const error = new Error('Invalid or expired refresh token.');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }
  }
};

module.exports = authService;

