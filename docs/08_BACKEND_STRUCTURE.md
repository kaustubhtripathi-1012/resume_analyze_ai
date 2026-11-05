# Backend Structure

## Folder layout
```
backend/
  src/
    config/        # env, db connection
    middleware/    # auth, roles, validate, errorHandler, upload
    models/        # User, Resume, Analysis, Job, Skill, Recommendation
    routes/        # auth, resumes, analyses, jobs, admin
    controllers/
    services/      # nlpClient, reportService, recommendationService
    utils/         # logger, pagination
    app.js  server.js
  tests/
nlp-service/
  app/
    main.py        # FastAPI app + routers
    parsers/       # pdf_text.py, docx_text.py, ocr.py
    extractors/    # entities.py, skills.py, education.py, experience.py
    scoring/       # ats.py
    matching/      # similarity.py, recommend.py
    data/          # skills.json, section_keywords.json
  tests/
```

## Services / modules
- authService - register/login/refresh, password hashing.
- resumeService - validate/store files, trigger parsing, save parsed data.
- nlpClient - typed HTTP client to FastAPI with timeout/retry.
- analysisService - create analysis, store results, handle async status.
- recommendationService - rank active jobs, cache results.
- reportService - render PDF report.
- adminService - users, taxonomy, analytics.

## Business logic rules
- Max file size 5 MB; only PDF/DOCX verified by extension AND magic bytes.
- ATS score = 25% keywords + 20% sections + 20% format + 15% readability + 10% length + 10% contact info (weights configurable).
- Match % = 0.6 x skill-overlap + 0.3 x semantic similarity + 0.1 x experience-level fit.
- Candidates are shown to recruiters only if visibleToRecruiters = true and contact info is hidden until consent.
- Recommendation cache refreshes when resume is edited or a new job is posted.
- Skill names normalized via taxonomy aliases before comparison.

## Error handling and logging
- Central Express error handler returns the standard error JSON; never leak stack traces.
- pino structured logs with requestId; FastAPI logging in JSON.
- Log auth failures, file rejections, NLP timeouts, admin actions (audit).
- NLP failures mark analysis status failed with a user-safe message.
