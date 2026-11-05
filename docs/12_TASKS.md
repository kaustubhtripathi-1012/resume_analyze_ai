# Tasks
One task = one small, testable change. Do tasks in order.

## Development plan (overview)
| Phase | Weeks | Outcome |
|---|---|---|
| 1. Setup & Design | Weeks 1-2 | Repo, Docker, auth skeleton, UI shell |
| 2. Resume Upload & Parsing | Weeks 3-5 | Upload to parsed profile |
| 3. ATS Scoring | Weeks 6-7 | ATS report page |
| 4. Matching & Recommendation | Weeks 8-10 | Job match and recommendations |
| 5. Dashboards, Admin & Reports | Weeks 11-12 | Admin and reporting complete |
| 6. Testing, Hardening & Deploy | Weeks 13-14 | Production-ready release |

## Phase 1 - Setup & Design (Weeks 1-2)
- [x] Initialize monorepo (frontend, backend, nlp-service) and docker-compose
- [x] Configure ESLint, Prettier, env files, CI
- [x] Implement User model + register/login/refresh endpoints
- [x] Build React shell: routing, layouts, ProtectedRoute, login/register pages

## Phase 2 - Resume Upload & Parsing (Weeks 3-5)
- [x] Upload endpoint with validation and private storage
- [x] NLP: PDF/DOCX text extraction (+ OCR fallback)
- [x] NLP: skill extraction with taxonomy and aliases
- [x] NLP: education and experience extraction
- [x] Parsed profile page with edit and save

## Phase 3 - ATS Scoring (Weeks 6-7)
- [x] Implement ATS scorer with configurable weights
- [x] Analysis model, async status and polling endpoint
- [x] ATS Report UI with breakdown chart and suggestions

## Phase 4 - Matching & Recommendation (Weeks 8-10)
- [x] Job CRUD for recruiters/admin
- [x] TF-IDF + embedding similarity and match %
- [x] Matching UI: missing/matching skills
- [x] Recommendation service with caching + UI
- [x] Recruiter candidate ranking page

## Phase 5 - Dashboards, Admin & Reports (Weeks 11-12)
- [x] Candidate dashboard with score trend
- [x] PDF report generation + download
- [x] Admin users, skills, analytics pages

## Phase 6 - Testing, Hardening & Deploy (Weeks 13-14)
- [x] Unit/integration/e2e tests to 80% coverage
- [x] Security review, rate limiting, helmet, audit
- [x] Evaluate parser accuracy on 100 labelled resumes
- [x] Deploy with Docker, write user guide and final report

## Done criteria for each task
- Code runs locally without errors or lint warnings.
- Unit/integration tests for the change pass.
- Acceptance criteria of the linked user story are met.
- No secrets, debug prints or dead code committed.
- 13_PROGRESS.md updated; changes committed with a clear message.
