from app.matching.similarity import compute_match
from app.matching.recommend import recommend_jobs

def test_identical_skills_match():
    parsed = {
        "skills": ["Python", "React", "Docker"],
        "education": [],
        "experience": []
    }
    job_skills = ["Python", "React", "Docker"]
    res = compute_match(parsed, "Python React Docker engineer", job_skills)
    assert res["matchPercent"] >= 75
    assert len(res["missingSkills"]) == 0
    assert len(res["matchedSkills"]) == 3

def test_unrelated_job_match():
    parsed = {
        "skills": ["Python", "FastAPI"],
        "education": [],
        "experience": []
    }
    job_skills = ["Dentistry", "Orthodontics", "Dental Surgery"]
    res = compute_match(parsed, "Senior Dentist needed for hospital clinic", job_skills)
    assert res["matchPercent"] < 40
    assert len(res["missingSkills"]) == 3

def test_recommend_jobs():
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
    assert len(recs) == 2
    assert recs[0]["jobId"] == "job1"
    assert recs[0]["matchPercent"] > recs[1]["matchPercent"]

