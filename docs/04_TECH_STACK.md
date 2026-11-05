# Tech Stack
- Frontend: React 18 + TypeScript + Vite, Tailwind CSS
- Backend: Node.js 20 + Express 4 (API, auth, jobs) and Python 3.11 + FastAPI (NLP/ML microservice)
- Database: MongoDB 7 (Mongoose ODM); GridFS or local disk for resume files
- Auth: JWT access + refresh token, bcrypt, role-based access
- Hosting: Docker Compose on a VM; Vercel/Netlify (frontend) + Render/Railway (backend) as alternative
- Key libraries (with versions):
  - react 18.x, react-router-dom 6.x, @tanstack/react-query 5.x, zustand 4.x, recharts 2.x, axios 1.x
  - express 4.x, mongoose 8.x, jsonwebtoken 9.x, bcryptjs 2.x, multer 1.x, zod 3.x, helmet, express-rate-limit, pino
  - fastapi 0.110+, uvicorn, spacy 3.7 (en_core_web_md), scikit-learn 1.4, sentence-transformers (all-MiniLM-L6-v2), pdfminer.six, python-docx, pytesseract (OCR fallback), pydantic 2
  - reportlab or puppeteer for PDF reports; jest + supertest, pytest, vitest + React Testing Library, Playwright

## Do NOT use
- Do not call paid LLM/APIs for core parsing (keep it reproducible offline).
- No localStorage for tokens.
- No ORMs/DBs other than Mongoose/MongoDB.
- No scraping of sites that forbid it.
- Do not add UI kits beyond Tailwind without approval.
