# App Flow

## Screens
- Landing page
- Register / Login / Forgot password
- Candidate Dashboard (history, score trend)
- Upload Resume
- Parsed Profile (editable)
- ATS Report
- Job Match (select JD or paste text)
- Recommended Jobs
- Job Detail
- Recruiter Dashboard
- Post/Edit Job
- Candidate Ranking for a Job
- Admin: Users
- Admin: Skills Taxonomy
- Admin: Analytics
- Profile & Settings

## Navigation between screens
Public landing -> Auth. After login the sidebar depends on role. Candidate: Dashboard, Upload, Reports, Jobs, Settings. Recruiter: Dashboard, My Jobs, Candidates, Settings. Admin: Users, Skills, Analytics, Jobs. Unauthorized routes redirect to login or a 403 page.

## Main user journey (step by step)
1. Candidate registers and logs in.
2. Opens Upload Resume and drops a PDF.
3. Backend stores the file, queues parsing, UI shows progress.
4. Parsed Profile appears; candidate fixes any wrong fields.
5. ATS Report opens with score, breakdown and suggestions.
6. Candidate pastes a job description; Match page shows match % and skill gaps.
7. Recommended Jobs list appears; candidate saves or opens jobs.
8. Candidate downloads the PDF report and re-uploads an improved resume; score trend updates.

## Error and empty states
- Unsupported/oversized/corrupt file: inline error, nothing stored.
- Scanned PDF without text: OCR fallback, else message asking for a text-based file.
- Parser failure: show partial results and a 'retry' button.
- No jobs match: empty state with tips to add skills.
- Empty dashboard: call-to-action to upload first resume.
- 401 -> redirect to login; 403 -> access denied page; 500 -> friendly retry message.
- NLP service down: queue analysis and show 'pending' status.
