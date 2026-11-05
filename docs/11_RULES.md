# Rules for the AI (use as CLAUDE.md / .cursorrules)
- Read all docs in /docs before coding.
- Change only what the task asks. Do not refactor unrelated code.
- Follow 04_TECH_STACK.md; never add new libraries without asking.
- Keep files small and functions single-purpose.
- Never hardcode secrets.
- After each task, update 13_PROGRESS.md and tick the task in 12_TASKS.md.
- If unsure, ask before guessing.

## Project-specific rules
- NLP logic lives only in nlp-service; Express never parses resumes itself.
- Scoring weights must come from config, not hardcoded in several places.
- Never log resume text or personal data.
- Add a pytest for every new extractor/scoring rule using sample resumes in tests/fixtures.
