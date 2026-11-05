# Security

## Authentication and authorization
- Passwords hashed with bcrypt (cost 12); minimum 8 chars with complexity check.
- Short-lived JWT access token (15 min) + rotating refresh token in httpOnly, Secure, SameSite=Strict cookie.
- Role-based access control enforced on the server for every route; ownership checked on every resource.
- Recruiter/admin accounts created by admin or invitation only; admin role can never be self-assigned.
- Internal Express-to-NLP calls use a shared service key and private network.

## Data protection and privacy
- HTTPS/TLS everywhere; HSTS enabled in production.
- Store only data needed; allow users to delete their account and data.
- Resume files stored outside the public web root, served only via authenticated endpoints.
- Resume text never written to logs; contact info masked for recruiters until consent.
- Account deletion removes files, parsed data and analyses.

## Secrets management (.env, never commit)
- All secrets (DB URL, JWT secret, API keys) live in `.env`; `.env` is in `.gitignore`; commit only `.env.example`.
- Use different secrets per environment; rotate on suspected leak.

## Input validation
- Validate every request body, query and path param with a schema (zod in Express, pydantic in FastAPI).
- Use parameterized queries / ORM only; escape output; limit request size.
- File validation: size, extension, MIME and magic bytes; scan filenames for path traversal.
- Sanitize any rendered resume text to prevent XSS; use zod on all Express inputs.

## Rate limiting
- Global: 100 requests/min per IP. Login/register: 5 attempts/min per IP+email, then temporary lockout.
- Upload: 10 files/hour per user. Analyze: 30 requests/hour per user.

## Dependency checks
- Run `npm audit && pip-audit` in CI on every pull request; Dependabot enabled.
- Pin versions; review changelogs before major upgrades.
