const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication token required.'
      }
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: 'USER_INACTIVE_OR_NOT_FOUND',
          message: 'User account not found or deactivated.'
        }
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token.'
      }
    });
  }
}

module.exports = { authenticateToken };

