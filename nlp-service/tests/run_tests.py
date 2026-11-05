import unittest
import os
import sys
import json

# Setup import path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from app.extractors.entities import extract_contact_info
from app.extractors.skills import extract_skills
from app.extractors.education import extract_education
from app.extractors.experience import extract_experience
from app.scoring.ats import score_resume
from app.matching.similarity import compute_match
from app.matching.recommend import recommend_jobs
from app.config import settings

SAMPLE_RESUME = """
John Doe
john.doe@example.com | +91 9876543210 | Bangalore, India
linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Dedicated Full Stack Software Engineer with 3+ years of experience building scalable web applications.

SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS
Frameworks & Tools: React, Node.js, Express, FastAPI, MongoDB, PostgreSQL, Docker, Git, AWS

EXPERIENCE
Software Engineer - Tech Solutions Ltd
Jan 2022 - Present
- Developed and maintained microservices using Python, FastAPI, and Docker.
- Built responsive frontend components using React and TypeScript.
- Optimized database queries in PostgreSQL, improving query response time by 30%.

EDUCATION
Bachelor of Technology in Computer Science
ABC Institute of Technology
2018 - 2022

PROJECTS
AI Resume Analyzer
- Implemented natural language processing algorithms using Python and spaCy to parse resumes.
"""

class TestNLPService(unittest.TestCase):
    def setUp(self):
        skills_path = os.path.join(BASE_DIR, "app", "data", "skills.json")
        with open(skills_path, "r", encoding="utf-8") as f:
            self.taxonomy = json.load(f)

        sec_path = os.path.join(BASE_DIR, "app", "data", "section_keywords.json")
        with open(sec_path, "r", encoding="utf-8") as f:
            self.section_keywords = json.load(f)

    def test_contact_info_extraction(self):
        contact = extract_contact_info(SAMPLE_RESUME)
        self.assertEqual(contact["email"], "john.doe@example.com")
        self.assertIn("9876543210", contact["phone"])
        self.assertTrue(len(contact["links"]) >= 1)

    def test_skills_extraction(self):
        skills = extract_skills(SAMPLE_RESUME, self.taxonomy)
        self.assertIn("Python", skills)
        self.assertIn("React", skills)
        self.assertIn("Docker", skills)
        self.assertIn("FastAPI", skills)

    def test_education_extraction(self):
        edu = extract_education(SAMPLE_RESUME)
        self.assertTrue(len(edu) >= 1)
        deg_str = " ".join([e["degree"] for e in edu])
        self.assertTrue("Technology" in deg_str or "Bachelor" in deg_str or "B.Tech" in deg_str)

    def test_experience_extraction(self):
        exp = extract_experience(SAMPLE_RESUME)
        self.assertTrue(len(exp) >= 1)
        self.assertIn("Software Engineer", exp[0]["role"])

    def test_ats_scoring_deterministic(self):
        parsed = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+91 9876543210",
            "skills": ["Python", "JavaScript", "React", "Docker", "FastAPI", "SQL", "Git", "PostgreSQL"],
            "education": [{"degree": "B.Tech", "institution": "ABC Institute"}],
            "experience": [{"role": "Software Engineer", "company": "Tech Solutions"}]
        }
        res1 = score_resume(SAMPLE_RESUME, parsed, settings.SCORING_WEIGHTS, self.section_keywords)
        res2 = score_resume(SAMPLE_RESUME, parsed, settings.SCORING_WEIGHTS, self.section_keywords)
        self.assertEqual(res1["atsScore"], res2["atsScore"])
        self.assertTrue(0 <= res1["atsScore"] <= 100)
        self.assertTrue(len(res1["suggestions"]) >= 1)

    def test_missing_sections_lower_score(self):
        parsed_empty = {
            "name": "",
            "email": "",
            "phone": "",
            "skills": [],
            "education": [],
            "experience": []
        }
        res = score_resume("Random short paragraph.", parsed_empty, settings.SCORING_WEIGHTS, self.section_keywords)
        self.assertLess(res["atsScore"], 50)
        self.assertTrue(len(res["suggestions"]) >= 3)

    def test_matching_identical_skills(self):
        parsed = {
            "skills": ["Python", "React", "Docker"],
            "education": [],
            "experience": []
        }
        res = compute_match(parsed, "Python React Docker engineer", ["Python", "React", "Docker"])
        self.assertGreaterEqual(res["matchPercent"], 70)
        self.assertEqual(len(res["missingSkills"]), 0)
        self.assertEqual(len(res["matchedSkills"]), 3)

    def test_recommend_jobs(self):
        parsed = {
            "skills": ["Python", "React", "Node.js"],
            "education": [],
            "experience": []
        }
        jobs = [
            {
                "_id": "job1",
                "title": "Full Stack Engineer",
                "description": "Python React Node.js web development",
                "requiredSkills": ["Python", "React", "Node.js"]
            },
            {
                "_id": "job2",
                "title": "Accountant",
                "description": "Financial tax audits",
                "requiredSkills": ["Auditing", "Taxation", "Excel"]
            }
        ]
        recs = recommend_jobs(parsed, jobs)
        self.assertEqual(len(recs), 2)
        self.assertEqual(recs[0]["jobId"], "job1")
        self.assertGreater(recs[0]["matchPercent"], recs[1]["matchPercent"])

if __name__ == '__main__':
    unittest.main()

