const express = require('express');
const analysisController = require('../controllers/analysisController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/:id', analysisController.getOne);
router.get('/:id/report.pdf', analysisController.downloadReport);
router.get('/resume/:resumeId', analysisController.getResumeHistory);

module.exports = router;

