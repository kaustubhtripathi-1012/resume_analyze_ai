from typing import List, Dict, Any
from .similarity import compute_match

def recommend_jobs(parsed_profile: Dict[str, Any], jobs: List[Dict[str, Any]], top_n: int = 10) -> List[Dict[str, Any]]:
    """
    Rank jobs for candidate resume and generate personalized recommendations with explanations.
    """
    scored_jobs = []

    for job in jobs:
        job_id = str(job.get("_id") or job.get("jobId") or job.get("id"))
        title = job.get("title", "")
        company = job.get("company", "")
        description = job.get("description", "")
        required_skills = job.get("requiredSkills", [])
        experience_level = job.get("experienceLevel", "fresher")

        full_job_text = f"{title} {description} {' '.join(required_skills)}"

        match_res = compute_match(
            parsed_profile=parsed_profile,
            job_text=full_job_text,
            required_skills=required_skills,
            job_level=experience_level
        )

        match_percent = match_res["matchPercent"]
        matched_skills = match_res["matchedSkills"]

        # Formulate reason
        if matched_skills:
            reason = f"Strong match for skills: {', '.join(matched_skills[:3])}."
        elif match_percent >= 60:
            reason = "Good alignment with candidate profile and background."
        else:
            reason = "Role offers growth in modern tech stacks."

        scored_jobs.append({
            "jobId": job_id,
            "title": title,
            "company": company,
            "matchPercent": match_percent,
            "matchedSkills": matched_skills,
            "missingSkills": match_res["missingSkills"],
            "reason": reason
        })

    # Sort descending by matchPercent
    scored_jobs.sort(key=lambda x: x["matchPercent"], reverse=True)
    return scored_jobs[:top_n]

