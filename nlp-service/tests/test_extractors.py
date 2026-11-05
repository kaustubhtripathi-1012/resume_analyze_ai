import json
import os
from app.extractors.entities import extract_contact_info
from app.extractors.skills import extract_skills
from app.extractors.education import extract_education
from app.extractors.experience import extract_experience

def test_extract_contact_info(sample_resume_text):
    contact = extract_contact_info(sample_resume_text)
    assert contact["email"] == "john.doe@example.com"
    assert "9876543210" in contact["phone"]
    assert len(contact["links"]) >= 1

def test_extract_skills(sample_resume_text):
    skills_path = os.path.join(os.path.dirname(__file__), "..", "app", "data", "skills.json")
    with open(skills_path, "r", encoding="utf-8") as f:
        taxonomy = json.load(f)

    skills = extract_skills(sample_resume_text, taxonomy)
    assert "Python" in skills
    assert "React" in skills
    assert "Docker" in skills
    assert "FastAPI" in skills

def test_extract_education(sample_resume_text):
    education = extract_education(sample_resume_text)
    assert len(education) >= 1
    deg_str = " ".join([e["degree"] for e in education])
    assert "Technology" in deg_str or "B.Tech" in deg_str or "Bachelor" in deg_str

def test_extract_experience(sample_resume_text):
    exp = extract_experience(sample_resume_text)
    assert len(exp) >= 1
    assert "Software Engineer" in exp[0]["role"]

