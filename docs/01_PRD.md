# PRD

## Product name
AI-Powered Resume Analyzer & Job Recommendation System

_Upload a resume, get structured skills, an ATS score, job-match percentages and tailored job recommendations._

## Problem
Job seekers do not know why their resumes get rejected by Applicant Tracking Systems (ATS), and recruiters spend hours screening unstructured resumes. There is no simple tool that parses a resume, scores it against a job description, explains the gaps and recommends better-fit jobs.

## Target users
- Job seekers / students who upload resumes and want feedback and job suggestions.
- Recruiters who post job descriptions and see ranked candidate matches.
- Admin who manages users, job listings, the skills taxonomy and system health.

## Goals / success metrics
- Parse PDF/DOCX resumes with >= 90% accuracy on skills and >= 85% on education/experience fields (measured on 100 labelled resumes).
- ATS score and job match returned in < 10 seconds for a 3-page resume.
- Top-5 job recommendations judged relevant by testers in >= 80% of cases.
- 80%+ backend test coverage; page load < 3 s on a normal connection.

## Modules
| # | Module | Responsibility |
|---|---|---|
| M1 | Authentication & Roles | Register, login, JWT, roles: candidate, recruiter, admin. |
| M2 | Resume Upload & Parsing | File validation, text extraction (PDF/DOCX/OCR fallback), storage. |
| M3 | NLP Extraction Engine | Extract name, contacts, skills, education, experience, projects using spaCy + skills taxonomy. |
| M4 | ATS Scoring Engine | Rule-based and keyword scoring: format, sections, keywords, readability, length. |
| M5 | Resume-JD Matching | TF-IDF + sentence-embedding similarity, missing/matching skills, match %. |
| M6 | Job Recommendation | Content-based ranking of jobs per resume profile. |
| M7 | Job Management | Recruiters/admin create, edit, close job postings. |
| M8 | Dashboards & Reports | Candidate history, score trends, recruiter ranking, PDF report download. |
| M9 | Admin Panel | User management, skills taxonomy, analytics, audit log. |

## Core features (MVP)
- Upload resume (PDF/DOCX, <= 5 MB) and view parsed profile; edit extracted data.
- ATS compatibility score (0-100) with category breakdown and fix suggestions.
- Paste/select a job description and get match %, matching and missing skills.
- Personalized top-N job recommendations with reasons.
- Recruiter view: rank uploaded candidates against a job.
- Downloadable analysis report (PDF).
- Analysis history and score-improvement chart.
- Admin dashboard with usage analytics and skill taxonomy editor.

## Out of scope
- Auto-applying to external job boards.
- Live scraping of LinkedIn/Indeed.
- Video interviews or chat bots.
- Mobile app.

## Constraints (budget, deadline, platform)
- Team of 1-4 students, about 14 weeks.
- Free/open-source tools only; deployable on a single VM or free-tier cloud.
- Web only (responsive); English-language resumes.
