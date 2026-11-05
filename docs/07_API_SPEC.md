# API Spec
Base URL: `/api`. All responses are JSON. Errors use `{ "error": { "code": "STRING", "message": "text" } }`. Lists are paginated with `?page=&limit=`.

## Endpoint: POST /api/auth/register
- Auth required: No
- Request body: `{name, email, password}`
- Response (success): 201 `{user, accessToken}`
- Response (errors): 400 validation, 409 email exists

## Endpoint: POST /api/auth/login
- Auth required: No
- Request body: `{email, password}`
- Response (success): 200 `{accessToken}` + httpOnly refresh cookie
- Response (errors): 401 invalid credentials, 429 too many attempts

## Endpoint: POST /api/auth/refresh
- Auth required: Refresh cookie
- Request body: -
- Response (success): 200 `{accessToken}`
- Response (errors): 401 expired/revoked

## Endpoint: GET /api/auth/me
- Auth required: Yes
- Request body: -
- Response (success): 200 `{user}`
- Response (errors): 401 unauthenticated

## Endpoint: POST /api/resumes
- Auth required: Yes (candidate)
- Request body: multipart `file`
- Response (success): 202 `{resumeId, status:'parsing'}`
- Response (errors): 400 bad file, 413 too large, 415 unsupported type

## Endpoint: GET /api/resumes/:id
- Auth required: Yes (owner/admin)
- Request body: -
- Response (success): 200 `{resume, parsed, status}`
- Response (errors): 403, 404

## Endpoint: PATCH /api/resumes/:id/parsed
- Auth required: Yes (owner)
- Request body: `{skills, education, experience, ...}`
- Response (success): 200 `{resume}`
- Response (errors): 400, 403

## Endpoint: POST /api/resumes/:id/analyze
- Auth required: Yes (owner)
- Request body: `{jobId?, jobText?}`
- Response (success): 202 `{analysisId}`
- Response (errors): 400, 404

## Endpoint: GET /api/analyses/:id
- Auth required: Yes (owner)
- Request body: -
- Response (success): 200 `{status, atsScore, breakdown, matchPercent, matchedSkills, missingSkills, suggestions}`
- Response (errors): 404

## Endpoint: GET /api/analyses/:id/report.pdf
- Auth required: Yes (owner)
- Request body: -
- Response (success): 200 PDF stream
- Response (errors): 404

## Endpoint: GET /api/resumes/:id/recommendations
- Auth required: Yes (owner)
- Request body: `?limit=10`
- Response (success): 200 `{items:[{job, matchPercent, reason}]}`
- Response (errors): 404

## Endpoint: GET /api/jobs
- Auth required: Yes
- Request body: `?q=&skill=&page=`
- Response (success): 200 `{items, total}`
- Response (errors): -

## Endpoint: POST /api/jobs
- Auth required: Yes (recruiter/admin)
- Request body: `{title, company, description, requiredSkills, location}`
- Response (success): 201 `{job}`
- Response (errors): 400, 403

## Endpoint: PATCH /api/jobs/:id
- Auth required: Yes (owner/admin)
- Request body: partial job
- Response (success): 200 `{job}`
- Response (errors): 403, 404

## Endpoint: GET /api/jobs/:id/candidates
- Auth required: Yes (recruiter)
- Request body: `?limit=`
- Response (success): 200 `{items:[{candidateAlias, matchPercent, topSkills}]}`
- Response (errors): 403

## Endpoint: GET /api/admin/users
- Auth required: Yes (admin)
- Request body: `?page=&q=`
- Response (success): 200 `{items, total}`
- Response (errors): 403

## Endpoint: PATCH /api/admin/users/:id
- Auth required: Yes (admin)
- Request body: `{isActive, role}`
- Response (success): 200 `{user}`
- Response (errors): 403, 404

## Endpoint: CRUD /api/admin/skills
- Auth required: Yes (admin)
- Request body: `{name, aliases, category}`
- Response (success): 200/201 `{skill}`
- Response (errors): 409 duplicate

## Endpoint: GET /api/admin/analytics
- Auth required: Yes (admin)
- Request body: -
- Response (success): 200 `{users, resumes, avgAtsScore, topSkills}`
- Response (errors): 403

## Endpoint: POST /nlp/parse | /nlp/score | /nlp/match | /nlp/recommend
- Auth required: Internal (shared service key)
- Request body: text / profile / JD
- Response (success): 200 structured result
- Response (errors): 422 invalid input, 500
