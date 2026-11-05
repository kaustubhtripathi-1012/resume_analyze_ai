const express = require('express');
const { z } = require('zod');
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validate } = require('../middleware/validate');

const router = express.Router();

const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  description: z.string().min(10, 'Detailed description is required'),
  requiredSkills: z.array(z.string()).min(1, 'At least one required skill must be specified'),
  location: z.string().optional(),
  experienceLevel: z.enum(['fresher', 'junior', 'mid', 'senior']).optional()
});

const updateJobSchema = createJobSchema.partial().extend({
  isActive: z.boolean().optional()
});

router.use(authenticateToken);

router.get('/', jobController.list);
router.post('/', requireRole('recruiter', 'admin'), validate(createJobSchema), jobController.create);
router.get('/:id', jobController.getOne);
router.patch('/:id', requireRole('recruiter', 'admin'), validate(updateJobSchema), jobController.update);
router.get('/:id/candidates', requireRole('recruiter', 'admin'), jobController.getCandidates);

module.exports = router;

