const analysisService = require('../services/analysisService');
const reportService = require('../services/reportService');

const analysisController = {
  async getOne(req, res, next) {
    try {
      const result = await analysisService.getAnalysisById(req.params.id, req.user.id, req.user.role);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async downloadReport(req, res, next) {
    try {
      const pdfBuffer = await reportService.generatePdfBuffer(req.params.id, req.user.id, req.user.role);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="analysis-report-${req.params.id}.pdf"`);
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  },

  async getResumeHistory(req, res, next) {
    try {
      const history = await analysisService.getResumeAnalyses(req.params.resumeId, req.user.id, req.user.role);
      res.status(200).json({ items: history });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = analysisController;

