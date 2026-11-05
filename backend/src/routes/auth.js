const express = require('express');
const { z } = require('zod');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['candidate', 'recruiter']).optional(),
  visibleToRecruiters: z.boolean().optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticateToken, authController.me);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;

