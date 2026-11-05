import re
from typing import Dict, Any, List

REQUIRED_SECTIONS = ["skills", "education", "experience", "projects", "summary", "contact"]

def score_resume(text: str, parsed: Dict[str, Any], weights: Dict[str, float], section_keywords: Dict[str, List[str]] = None) -> Dict[str, Any]:
    """
    Score resume ATS compatibility based on:
    - keywords (25%)
    - sections (20%)
    - format (20%)
    - readability (15%)
    - length (10%)
    - contactInfo (10%)
    """
    suggestions = []
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text)
    word_count = len(words)

    # 1. Keywords Score (skills found)
    skills = parsed.get("skills", [])
    num_skills = len(skills)
    if num_skills >= 8:
        keywords_score = 100
    elif num_skills >= 5:
        keywords_score = 80
    elif num_skills >= 3:
        keywords_score = 60
        suggestions.append("Add more specific technical and domain skills to reach standard ATS keyword density.")
    elif num_skills >= 1:
        keywords_score = 40
        suggestions.append("Highlight at least 6-8 relevant skills clearly in a dedicated Skills section.")
    else:
        keywords_score = 15
        suggestions.append("No technical skills detected. Create a dedicated 'Technical Skills' section.")

    # 2. Sections Score
    detected_sections = 0
    missing_sections = []
    if section_keywords:
        for section, keywords in section_keywords.items():
            if any(re.search(rf'\b{re.escape(kw)}\b', text_lower) for kw in keywords):
                detected_sections += 1
            else:
                missing_sections.append(section.capitalize())
    else:
        for sec in REQUIRED_SECTIONS:
            if re.search(rf'\b{sec}\b', text_lower):
                detected_sections += 1
            else:
                missing_sections.append(sec.capitalize())

    sections_score = int((detected_sections / len(REQUIRED_SECTIONS)) * 100)
    sections_score = min(100, max(20, sections_score))
    if missing_sections:
        suggestions.append(f"Missing recommended resume sections: {', '.join(missing_sections[:3])}.")

    # 3. Format Score
    format_penalties = 0
    lines = text.split("\n")
    bullet_lines = [l for l in lines if l.strip().startswith(("-", "•", "*", "–"))]
    if len(bullet_lines) < 3:
        format_penalties += 20
        suggestions.append("Use standard bullet points (•) for listing your achievements and project tasks.")

    # Check for excessive special characters / weird encoding
    special_chars = len(re.findall(r'[^\x00-\x7F]', text))
    if special_chars > 50:
        format_penalties += 20
        suggestions.append("Avoid unsupported decorative unicode characters or symbols that confuse ATS parsers.")

    format_score = max(30, 100 - format_penalties)

    # 4. Readability Score
    # Estimate average sentence length
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    avg_sentence_len = (word_count / max(1, len(sentences))) if sentences else 15

    if 10 <= avg_sentence_len <= 22:
        readability_score = 95
    elif 8 <= avg_sentence_len <= 28:
        readability_score = 80
    else:
        readability_score = 65
        suggestions.append("Keep your bullet points and sentences concise (12-20 words per point) for higher readability.")

    # 5. Length Score
    if 350 <= word_count <= 950:
        length_score = 100
    elif 250 <= word_count <= 1300:
        length_score = 80
    elif word_count < 250:
        length_score = 45
        suggestions.append(f"Resume is very brief ({word_count} words). Expand on project details and quantifiable outcomes.")
    else:
        length_score = 60
        suggestions.append(f"Resume is lengthy ({word_count} words). Aim for 1-2 pages (400-800 words) for best ATS parsing.")

    # 6. Contact Info Score
    contact_score = 0
    contact = parsed.get("contact", {}) or {}
    name = parsed.get("name") or contact.get("name")
    email = parsed.get("email") or contact.get("email")
    phone = parsed.get("phone") or contact.get("phone")

    if name:
        contact_score += 35
    if email:
        contact_score += 35
    if phone:
        contact_score += 30

    if not email:
        suggestions.append("Include a professional email address at the top of your resume.")
    if not phone:
        suggestions.append("Include a reachable contact telephone number with country code.")
    if not name:
        suggestions.append("Ensure your full name is formatted as the top header of your resume.")

    # Calculate weighted total
    breakdown = {
        "keywords": int(keywords_score),
        "sections": int(sections_score),
        "format": int(format_score),
        "readability": int(readability_score),
        "length": int(length_score),
        "contactInfo": int(contact_score)
    }

    w_kw = weights.get("keywords", 0.25)
    w_sec = weights.get("sections", 0.20)
    w_fmt = weights.get("format", 0.20)
    w_read = weights.get("readability", 0.15)
    w_len = weights.get("length", 0.10)
    w_cnt = weights.get("contactInfo", 0.10)

    total_score = (
        breakdown["keywords"] * w_kw +
        breakdown["sections"] * w_sec +
        breakdown["format"] * w_fmt +
        breakdown["readability"] * w_read +
        breakdown["length"] * w_len +
        breakdown["contactInfo"] * w_cnt
    )

    ats_score = int(round(min(100, max(0, total_score))))

    if not suggestions:
        suggestions.append("Great job! Your resume format, keyword balance, and contact structure are ATS compliant.")

    return {
        "atsScore": ats_score,
        "breakdown": breakdown,
        "suggestions": suggestions
    }

