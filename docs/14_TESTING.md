# Testing

## Strategy (unit / integration / e2e)
- Unit (about 70%): services, validators, scoring/ML helpers, React components.
- Integration (about 20%): API endpoints against a test database; background jobs with a test broker.
- E2E (about 10%): key user journeys through the browser.
- Target: >= 80% coverage on backend services; every user story has at least one test.

## Tools
- Jest + Supertest (Express), Pytest (NLP), Vitest + React Testing Library, Playwright (e2e)
- k6 or Locust for a simple load test
- MongoDB memory server for integration tests

## Critical test cases
- Reject a .exe renamed to .pdf (magic-byte check).
- Parser extracts skills/education/experience from 10 fixture resumes with expected values.
- ATS score is deterministic and within 0-100; missing section lowers the score.
- Match % = 100 for identical skills and low for unrelated JD.
- Recruiter cannot see a candidate with visibleToRecruiters = false.
- Candidate cannot read another candidate's resume or report (403).
- Async analysis transitions pending -> done and failed state handled.

## Manual QA checklist
- [ ] Register, login, logout and token refresh work; wrong password is rejected.
- [ ] Role restrictions: each role sees only its own pages and data.
- [ ] Every form shows validation errors and never double-submits.
- [ ] Loading, empty and error states render on every list/dashboard.
- [ ] Layout works at 360, 768 and 1280 px widths; keyboard navigation works.
- [ ] Upload a 3-page PDF, a DOCX and a scanned PDF; compare parsed output manually.
- [ ] Download the PDF report and verify content.
- [ ] No secrets or stack traces visible in browser or API responses.
