# AI-Powered Resume Analyzer & Job Recommendation System

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-teal.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%2F%203.14-blue.svg)](https://python.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intelligent, multi-tier full-stack platform that parses unstructured PDF and DOCX resumes, computes multi-parameter Applicant Tracking System (ATS) compatibility scores, matches candidates with real job requisitions, and recommends high-fit career paths with actionable feedback.

Developed for **TY B.Sc. Computer Science Final Year Major Project**.

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Scoring & Matching Formulas](#scoring--matching-formulas)
5. [Project Structure](#project-structure)
6. [Quick Start & Setup](#quick-start--setup)
7. [Default Demo Credentials](#default-demo-credentials)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Security & Privacy](#security--privacy)
10. [Documentation Index](#documentation-index)

---

## System Architecture

The solution uses a decoupled **three-tier architecture** with an asynchronous NLP microservice:

```
┌────────────────────────────┐
│   React 18 SPA (Vite)      │  Port 3000
│ (Tailwind, TanStack Query) │
└─────────────┬──────────────┘
              │  HTTPS / REST + Cookies
              ▼
┌────────────────────────────┐
│   Node.js + Express API    │  Port 5000
│ (Auth, RBAC, CRUD, Reports)│
└──────┬───────────────┬─────┘
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────────────────────────────────────┐
│  MongoDB 7   │ │           FastAPI NLP Service                │  Port 8000
│  (Mongoose)  │ │ (PDFMiner, python-docx, OCR, spaCy NER,      │
└──────────────┘ │  60+ Skills Taxonomy, Scorer, TF-IDF Matcher)│
                 └──────────────────────────────────────────────┘
```

---

## Key Features

### 1. Candidate Portal
- **File Ingestion:** Drag-and-drop resume upload (PDF / DOCX, up to 5 MB) guarded by strict magic-byte verification (rejects fake or disguised binaries).
- **Automated Entity Extraction:** Extracts contact info (name, email, phone, links), education credentials, employment history, and technical skills mapped to a standardized taxonomy.
- **Editable Parsed Profile:** Candidates can review, modify, or add missing skills before generating final reports.
- **ATS Compatibility Audit:** Interactive radial score gauge (0–100) breaking down keywords density, sections presence, layout formatting, sentence readability, length, and contact details with tailored fix suggestions.
- **Job Description Matcher:** Paste any target JD or select active platform jobs to view match percentage, matched skills (green badges), and missing criteria (red badges).
- **Personalized Recommendations:** Content-based ranking of active job openings with AI-generated match rationale.
- **PDF Report Download:** Download analysis summaries for offline tracking.
- **Recruiter Discovery Opt-in:** Candidate privacy controls allowing or disallowing recruiters to discover their profile.

### 2. Recruiter Portal
- **Job Requisition Management:** Post, edit, and manage active jobs with location, experience level, and required skill tags.
- **Candidate Shortlisting & Ranking:** Browse candidates who opted-in for recruiter visibility, ranked descending by compatibility score and skill overlap. Contact info remains protected until direct candidate engagement.

### 3. Administrator Panel
- **User Management:** Search, view, activate, and deactivate candidate and recruiter accounts (with self-demotion protection).
- **Skills Taxonomy Editor:** Live catalog editor to search, add, edit, or delete skills and synonyms/aliases across categories (`language`, `framework`, `tool`, `soft`).
- **Analytics & Trends:** System KPI metrics (total users, total resumes, average ATS score) and Recharts distribution of the most in-demand skills.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Recharts, Lucide Icons |
| **Backend API** | Node.js 20, Express 4, Mongoose 8, JWT + httpOnly Refresh Cookies, Multer, Zod, Puppeteer, Pino, Helmet, Rate-Limit |
| **NLP Microservice** | Python 3.11 / 3.14, FastAPI, Uvicorn, Pydantic v2, scikit-learn, pdfminer.six, python-docx, pytesseract, Pillow |
| **Database** | MongoDB 7 (Mongoose ODM) |
| **Containerization** | Docker, Docker Compose, Nginx |

---

## Scoring & Matching Formulas

### 1. ATS Compatibility Scoring Engine
The overall ATS score ($0 - 100$) is computed through a deterministic weighted multi-parameter function:

$$\text{ATS Score} = \sum (\text{Component Score} \times \text{Weight})$$

- **Keywords Density (25%):** Count of validated technical skills vs. target density.
- **Standard Sections (20%):** Detection of essential header blocks (Summary, Skills, Experience, Education, Projects, Contact).
- **Layout & Formatting (20%):** Standard bullet point usage, absence of unparsed symbols or decorative characters.
- **Sentence Readability (15%):** Average sentence length and clarity index.
- **Length & Structure (10%):** Optimal word-count balance (350–950 words ideal).
- **Contact Details (10%):** Detection of name, reachable phone number, and professional email.

### 2. Resume-to-Job Matching Formula
Match percentage represents a hybrid of deterministic skill overlap, TF-IDF vector cosine similarity, and seniority fit:

$$\text{Match \%} = (0.6 \times \text{Skill Overlap}) + (0.3 \times \text{Semantic Similarity}) + (0.1 \times \text{Experience Fit})$$

---

## Project Structure

```text
resume_analyze_ai/
├── docker-compose.yml              # Multi-container orchestration
├── package.json                    # Monorepo scripts
├── .env.example & .gitignore
├── backend/                        # Node.js + Express backend
│   ├── src/
│   │   ├── config/                 # Environment & Mongo connection retry
│   │   ├── controllers/            # REST API endpoints controllers
│   │   ├── middleware/             # Auth, roles guard, zod validator, magic-byte upload
│   │   ├── models/                 # User, Resume, Analysis, Job, Skill, Recommendation, AuditLog
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # nlpClient, authService, reportService, analysisService
│   │   └── utils/                  # Pino logger, pagination
│   ├── scripts/seed.js             # Database seeder (demo users, skills, jobs)
│   └── tests/                      # Jest & Supertest integration tests
├── nlp-service/                    # FastAPI NLP service
│   ├── app/
│   │   ├── parsers/                # PDFMiner, python-docx, OCR fallback
│   │   ├── extractors/             # Contact, skills, education, experience extractors
│   │   ├── scoring/                # ATS weighted scoring
│   │   ├── matching/               # Semantic similarity & job recommender
│   │   └── data/                   # skills.json (60+ skills) & section_keywords.json
│   └── tests/                      # Pytest & run_tests.py test suite
├── frontend/                       # React 18 + TypeScript + Vite + Tailwind SPA
│   └── src/
│       ├── api/                    # Axios client with automatic 401 token refresh
│       ├── components/             # Reusable UI (Button, Card, Table, Modal, ScoreGauge, SkillBadge)
│       ├── layouts/                # AuthLayout, DashboardLayout
│       ├── pages/                  # 16 distinct pages (Candidate, Recruiter, Admin)
│       ├── routes/                 # Protected route table
│       └── store/                  # Zustand in-memory auth store
└── docs/                           # Full specification documentation (15 files)
```

---

## Quick Start & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://python.org/) (v3.10 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or in Docker

---

### Option A: Docker Compose (All services in one command)

```bash
# Clone the repository
git clone https://github.com/kaustubhtripathi-1012/resume_analyze_ai.git
cd resume_analyze_ai

# Launch all microservices
docker-compose up --build
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **NLP Microservice:** [http://localhost:8000](http://localhost:8000)
- **MongoDB:** `localhost:27017`

---

### Option B: Local Development Setup

#### 1. Start the NLP Service
```bash
cd nlp-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start the Backend API & Seed Initial Data
```bash
cd ../backend
npm install

# Seed demo accounts (Admin, Recruiter, Candidate), skills taxonomy & jobs:
npm run seed

# Start server:
npm run dev
```

#### 3. Start the Frontend Application
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Demo Credentials

The database seeder pre-configures three role-based demo accounts:

| Role | Email | Password | Landing Page |
|---|---|---|---|
| **System Admin** | `admin@example.com` | `Admin@12345` | `/admin/analytics` |
| **Candidate** | `candidate@example.com` | `Candidate@12345` | `/dashboard` |
| **Recruiter** | `recruiter@example.com` | `Recruiter@12345` | `/recruiter` |

> **Tip:** The Login Page includes **1-click autofill buttons** (`Admin`, `Candidate`, `Recruiter`) to instantly populate credentials without typing. You can also self-register a new account on `/register`.

---

## Testing & Quality Assurance

### 1. NLP Service Unit Tests
Run the standalone test runner verifying extractors, section boundary parsing, ATS determinism, and recommendations:
```bash
python nlp-service/tests/run_tests.py
```
**Test Results:**
- `test_contact_info_extraction` — PASS
- `test_skills_extraction` — PASS
- `test_education_extraction` — PASS
- `test_experience_extraction` — PASS
- `test_ats_scoring_deterministic` — PASS
- `test_missing_sections_lower_score` — PASS
- `test_matching_identical_skills` — PASS
- `test_recommend_jobs` — PASS
- **8/8 unit tests passing (100%)**

### 2. Backend Syntax & Type Checking
```bash
# Validates JavaScript syntax across all backend files:
Get-ChildItem -Path "backend" -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

---

## Security & Privacy

- **Magic-Byte File Validation:** Checks file headers (`%PDF` for PDF, `PK\x03\x04` for DOCX) to block renamed executables or malicious payloads.
- **Short-Lived Access Tokens:** 15-minute JWT stored strictly in memory (never in localStorage to prevent XSS exfiltration).
- **Rotating Refresh Cookies:** 7-day refresh token stored in an `httpOnly`, `SameSite=Strict`, `Secure` cookie.
- **RBAC Enforcement:** Route-level authorization guards for `candidate`, `recruiter`, and `admin`.
- **Data Protection:** Structured Pino logs redact candidate contact details and raw resume text.
- **Rate Limiting:** Global rate limit (100 req/min) and auth rate limit (10 attempts/min) using `express-rate-limit`.

---

## Documentation Index

The complete requirements, architectural diagrams, task trackers, and audit guides are stored in [`docs/`](docs/):

- [`01_PRD.md`](docs/01_PRD.md) — Product Requirements Document
- [`02_USER_STORIES.md`](docs/02_USER_STORIES.md) — User Stories & Acceptance Criteria
- [`03_APP_FLOW.md`](docs/03_APP_FLOW.md) — User Journey & Screen Navigations
- [`04_TECH_STACK.md`](docs/04_TECH_STACK.md) — Tech Stack & Constraints
- [`05_ARCHITECTURE.md`](docs/05_ARCHITECTURE.md) — Microservice Architecture & Data Flow
- [`06_DATABASE_SCHEMA.md`](docs/06_DATABASE_SCHEMA.md) — MongoDB Collection Schemas & Indexes
- [`07_API_SPEC.md`](docs/07_API_SPEC.md) — REST API Endpoints Specification
- [`08_BACKEND_STRUCTURE.md`](docs/08_BACKEND_STRUCTURE.md) — Express & FastAPI Layout
- [`09_FRONTEND_GUIDELINES.md`](docs/09_FRONTEND_GUIDELINES.md) — React & Tailwind Guidelines
- [`10_DESIGN_SYSTEM.md`](docs/10_DESIGN_SYSTEM.md) — Design Tokens, Colors, & Typography
- [`11_RULES.md`](docs/11_RULES.md) — AI Development Guidelines
- [`12_TASKS.md`](docs/12_TASKS.md) — Implementation Task Tracker
- [`13_PROGRESS.md`](docs/13_PROGRESS.md) — Project Progress Changelog
- [`14_TESTING.md`](docs/14_TESTING.md) — Test Plan & Verification Results
- [`15_SECURITY.md`](docs/15_SECURITY.md) — Threat Model & Security Posture

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
