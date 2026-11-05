import json
import os
from app.scoring.ats import score_resume
from app.config import settings

def test_ats_score_deterministic(sample_resume_text):
    sec_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "section_keywords.json")
    with open(sec_path, "r", encoding="utf-8") as f:
        section_keywords = json.load(f)

    parsed = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+91 9876543210",
        "skills": ["Python", "JavaScript", "React", "Docker", "FastAPI", "SQL", "Git", "PostgreSQL"],
        "education": [{"degree": "B.Tech", "institution": "ABC Institute"}],
        "experience": [{"role": "Software Engineer", "company": "Tech Solutions"}]
    }

    res1 = score_resume(sample_resume_text, parsed, settings.SCORING_WEIGHTS, section_keywords)
    res2 = score_resume(sample_resume_text, parsed, settings.SCORING_WEIGHTS, section_keywords)

    assert res1["atsScore"] == res2["atsScore"]
    assert 0 <= res1["atsScore"] <= 100
    assert "breakdown" in res1
    assert "suggestions" in res1

def test_missing_sections_lower_score():
    sec_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "section_keywords.json")
    with open(sec_path, "r", encoding="utf-8") as f:
        section_keywords = json.load(f)

    parsed_empty = {
        "name": "",
        "email": "",
        "phone": "",
        "skills": [],
        "education": [],
        "experience": []
    }

    res = score_resume("Random short paragraph without structure.", parsed_empty, settings.SCORING_WEIGHTS, section_keywords)
    assert res["atsScore"] < 50
    assert len(res["suggestions"]) >= 3

