# Architecture

## System overview
Three-tier web app with a separate NLP microservice. The React SPA talks to the Express API. Express handles auth, CRUD and file storage in MongoDB, and calls the FastAPI NLP service for parsing, scoring, matching and recommendations. Long analyses run asynchronously and the UI polls status.

```
[React SPA] --HTTPS/JSON--> [Express API] --> [MongoDB]
                                |   \--> [File storage]
                                +--HTTP--> [FastAPI NLP Service]
                                              |-- spaCy parser
                                              |-- ATS scorer
                                              \-- Matcher / Recommender
```

## Components and responsibilities
| Component | Responsibility |
|---|---|
| React SPA | UI, routing, forms, charts, calls API. |
| Express API | Auth, RBAC, validation, resume/job CRUD, orchestrates NLP calls, report generation. |
| FastAPI NLP Service | Text extraction, entity/skill extraction, ATS scoring, embeddings, matching, recommendations. |
| MongoDB | Users, resumes, parsed profiles, analyses, jobs, taxonomy, audit logs. |
| File storage | Original resume files (private, not publicly served). |
| Report Generator | Builds PDF analysis reports. |

## Data flow
1. User uploads file -> Express validates type/size/magic bytes and stores it.
2. Express sends file path/text to NLP service /parse.
3. NLP returns structured profile; Express saves it as resume.parsed.
4. Express calls /score -> ATS result saved to analyses.
5. On match request Express calls /match with resume profile + JD -> match result saved.
6. Recommendations computed by /recommend against active jobs and cached per resume.
7. Frontend polls /analyses/:id until status = done and renders results.

## External services
- NLP models (spaCy, MiniLM) downloaded at build time - no runtime external API.
- SMTP server for password reset and notifications (optional).
- Optional: Tesseract OCR binary.

## Key decisions and why
- Separate Python service: best NLP/ML ecosystem while Node keeps API simple.
- MongoDB: resume/profile documents are flexible and nested.
- Hybrid scoring (rules + embeddings): explainable results, good accuracy without training data.
- Async analyses: parsing/embedding may take seconds; avoids request timeouts.
- Docker Compose: one-command reproducible setup.
