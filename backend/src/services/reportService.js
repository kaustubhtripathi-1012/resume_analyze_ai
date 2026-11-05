const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');

function buildHtmlReport(analysis, resume) {
  const candidateName = resume.parsed?.name || resume.fileName;
  const dateStr = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const breakdown = analysis.breakdown || {};
  const matchedSkills = analysis.matchedSkills || [];
  const missingSkills = analysis.missingSkills || [];
  const suggestions = analysis.suggestions || [];

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>ATS Resume Analysis Report</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0F172A;
        line-height: 1.5;
        padding: 40px;
        background: #FFFFFF;
      }
      .header {
        border-bottom: 2px solid #2563EB;
        padding-bottom: 20px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .title {
        font-size: 26px;
        font-weight: 700;
        color: #2563EB;
        margin: 0;
      }
      .meta {
        font-size: 14px;
        color: #64748B;
      }
      .score-box {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 24px;
        text-align: center;
      }
      .score-num {
        font-size: 48px;
        font-weight: 800;
        color: ${analysis.atsScore >= 70 ? '#10B981' : analysis.atsScore >= 45 ? '#F59E0B' : '#EF4444'};
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 16px;
      }
      .grid-item {
        background: #FFFFFF;
        padding: 12px;
        border-radius: 6px;
        border: 1px solid #CBD5E1;
      }
      .badge-matched {
        display: inline-block;
        background: #D1FAE5;
        color: #065F46;
        padding: 4px 8px;
        border-radius: 4px;
        margin: 3px;
        font-size: 13px;
      }
      .badge-missing {
        display: inline-block;
        background: #FEE2E2;
        color: #991B1B;
        padding: 4px 8px;
        border-radius: 4px;
        margin: 3px;
        font-size: 13px;
      }
      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin-top: 24px;
        margin-bottom: 12px;
        color: #1E293B;
      }
      ul {
        margin: 0;
        padding-left: 20px;
      }
      li {
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 class="title">ATS Resume Analysis Report</h1>
        <p class="meta">Candidate: <strong>${candidateName}</strong> | File: ${resume.fileName}</p>
      </div>
      <div class="meta">Generated: ${dateStr}</div>
    </div>

    <div class="score-box">
      <div>Overall ATS Compatibility Score</div>
      <div class="score-num">${analysis.atsScore}/100</div>
      <div class="grid">
        <div class="grid-item"><strong>Keywords:</strong> ${breakdown.keywords || 0}%</div>
        <div class="grid-item"><strong>Sections:</strong> ${breakdown.sections || 0}%</div>
        <div class="grid-item"><strong>Format:</strong> ${breakdown.format || 0}%</div>
        <div class="grid-item"><strong>Readability:</strong> ${breakdown.readability || 0}%</div>
        <div class="grid-item"><strong>Length:</strong> ${breakdown.length || 0}%</div>
        <div class="grid-item"><strong>Contact Info:</strong> ${breakdown.contactInfo || 0}%</div>
      </div>
    </div>

    ${analysis.matchPercent !== null && analysis.matchPercent !== undefined ? `
    <div class="score-box" style="margin-top: 20px;">
      <div>Target Job Match Compatibility</div>
      <div class="score-num" style="color: #2563EB;">${analysis.matchPercent}%</div>
    </div>
    ` : ''}

    ${matchedSkills.length ? `
    <div class="section-title">Matched Skills</div>
    <div>${matchedSkills.map(s => `<span class="badge-matched">${s}</span>`).join('')}</div>
    ` : ''}

    ${missingSkills.length ? `
    <div class="section-title">Missing Skills Required</div>
    <div>${missingSkills.map(s => `<span class="badge-missing">${s}</span>`).join('')}</div>
    ` : ''}

    <div class="section-title">Actionable Recommendations & Fixes</div>
    <ul>
      ${suggestions.map(s => `<li>${s}</li>`).join('')}
    </ul>
  </body>
  </html>
  `;
}

const reportService = {
  async generatePdfBuffer(analysisId, userId, role) {
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      const err = new Error('Analysis report not found.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    const resume = await Resume.findById(analysis.resumeId);
    if (!resume) {
      const err = new Error('Resume not found.');
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    if (role !== 'admin' && resume.userId.toString() !== userId.toString()) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const html = buildHtmlReport(analysis, resume);

    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      return pdfBuffer;
    } catch (err) {
      // Fallback: return raw HTML buffer if puppeteer executable is not installed on host
      return Buffer.from(html, 'utf-8');
    }
  }
};

module.exports = reportService;

