import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Compute semantic text similarity using TF-IDF and cosine similarity."""
    if not text1.strip() or not text2.strip():
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words='english', min_df=1)
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(sim)
    except Exception:
        # Fallback word set Jaccard
        w1 = set(re.findall(r'\b\w+\b', text1.lower()))
        w2 = set(re.findall(r'\b\w+\b', text2.lower()))
        if not w1 or not w2:
            return 0.0
        return len(w1.intersection(w2)) / len(w1.union(w2))

def compute_match(parsed_profile: Dict[str, Any], job_text: str, required_skills: List[str] = None, job_level: str = "fresher") -> Dict[str, Any]:
    """
    Compute matching percentage:
    Match % = 0.6 * skill-overlap + 0.3 * semantic similarity + 0.1 * experience-level fit
    """
    resume_skills = [s.strip() for s in parsed_profile.get("skills", []) if s.strip()]
    resume_skills_lower = {s.lower(): s for s in resume_skills}

    # Normalize required skills
    if required_skills is None:
        required_skills = []

    # If no required skills were passed explicitly, extract words from job text
    if not required_skills and job_text:
        # Simple extraction or fallback
        required_skills = [s for s in resume_skills if s.lower() in job_text.lower()]
        if not required_skills:
            required_skills = ["Software Development", "Problem Solving"]

    req_skills_lower = [s.lower() for s in required_skills]

    matched_skills = []
    missing_skills = []

    for req in required_skills:
        if req.lower() in resume_skills_lower:
            matched_skills.append(req)
        else:
            # Check partial match
            found = False
            for rs in resume_skills_lower:
                if req.lower() in rs or rs in req.lower():
                    matched_skills.append(req)
                    found = True
                    break
            if not found:
                missing_skills.append(req)

    # 1. Skill overlap score (0 - 100)
    if required_skills:
        skill_overlap = len(matched_skills) / len(required_skills)
    else:
        skill_overlap = 0.5
    skill_score = skill_overlap * 100

    # 2. Semantic text similarity (0 - 100)
    resume_text_repr = " ".join(resume_skills) + " "
    for edu in parsed_profile.get("education", []):
        resume_text_repr += f" {edu.get('degree', '')} {edu.get('institution', '')}"
    for exp in parsed_profile.get("experience", []):
        resume_text_repr += f" {exp.get('role', '')} {exp.get('company', '')} {exp.get('description', '')}"

    sem_sim = calculate_text_similarity(resume_text_repr, job_text)
    semantic_score = min(100.0, sem_sim * 100 * 1.5)  # Scale up slightly for TF-IDF

    # 3. Experience level fit (0 - 100)
    exp_count = len(parsed_profile.get("experience", []))
    job_level_lower = (job_level or "fresher").lower()
    level_fit = 100
    if job_level_lower == "senior" and exp_count < 2:
        level_fit = 50
    elif job_level_lower == "mid" and exp_count < 1:
        level_fit = 70
    elif job_level_lower == "fresher":
        level_fit = 100

    # Total Match Percent
    final_match = (0.6 * skill_score) + (0.3 * semantic_score) + (0.1 * level_fit)
    match_percent = int(round(min(100, max(0, final_match))))

    return {
        "matchPercent": match_percent,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "skillOverlapPercent": int(round(skill_score)),
        "semanticPercent": int(round(semantic_score))
    }

