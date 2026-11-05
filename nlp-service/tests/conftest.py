import pytest
import os
import sys

# Add nlp-service root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.fixture
def sample_resume_text():
    return """
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

@pytest.fixture
def sample_job_description():
    return """
    Job Title: Full Stack Developer
    Company: InnovateTech
    Requirements:
    - Proficient in Python, React, and Node.js
    - Experience with Docker, Git, and REST API development
    - Knowledge of PostgreSQL and AWS cloud deployment
    """

