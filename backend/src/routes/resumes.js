const express = require('express');
const { z } = require('zod');
const resumeController = require('../controllers/resumeController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

const router = express.Router();

const updateParsedSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(z.object({
    institution: z.string().optional(),
    degree: z.string().optional(),
    year: z.string().optional()
  })).optional(),
  experience: z.array(z.object({
    company: z.string().optional(),
    role: z.string().optional(),
    duration: z.string().optional(),
    description: z.string().optional()
  })).optional(),
  projects: z.array(z.any()).optional()
});

const analyzeSchema = z.object({
  jobId: z.string().optional(),
  jobText: z.string().optional()
});

router.use(authenticateToken);

router.post('/', upload.single('file'), resumeController.upload);
router.get('/', resumeController.list);
router.get('/:id', resumeController.getOne);
router.patch('/:id/parsed', validate(updateParsedSchema), resumeController.updateParsed);
router.post('/:id/analyze', validate(analyzeSchema), resumeController.analyze);
router.get('/:id/recommendations', resumeController.getRecommendations);

module.exports = router;

