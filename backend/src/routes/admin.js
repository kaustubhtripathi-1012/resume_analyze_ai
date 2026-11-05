const express = require('express');
const { z } = require('zod');
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('admin'));

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional()
});

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  aliases: z.array(z.string()).optional(),
  category: z.enum(['language', 'framework', 'tool', 'soft']).optional()
});

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id', validate(updateUserSchema), adminController.updateUser);

// Skills
router.get('/skills', adminController.getSkills);
router.post('/skills', validate(skillSchema), adminController.createSkill);
router.patch('/skills/:id', validate(skillSchema.partial()), adminController.updateSkill);
router.delete('/skills/:id', adminController.deleteSkill);

// Analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

