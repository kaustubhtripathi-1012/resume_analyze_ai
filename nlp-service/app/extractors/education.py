import re
from typing import List, Dict, Any

DEGREE_PATTERNS = [
    r'\b(?:B\.?Tech|B\.?E\.?|Bachelor of Engineering|Bachelor of Technology)\b',
    r'\b(?:B\.?Sc|B\.?S\.?|Bachelor of Science|BCA|Bachelor of Computer Applications)\b',
    r'\b(?:M\.?Tech|M\.?E\.?|Master of Technology|Master of Engineering)\b',
    r'\b(?:M\.?Sc|M\.?S\.?|Master of Science|MCA|Master of Computer Applications)\b',
    r'\b(?:MBA|Master of Business Administration|BBA)\b',
    r'\b(?:Ph\.?D|Doctor of Philosophy)\b',
    r'\b(?:Diploma|HSC|SSC|CBSE|ICSE|Higher Secondary)\b'
]

YEAR_PATTERN = re.compile(r'\b(19\d{2}|20\d{2})(?:\s*[-–to]+\s*(19\d{2}|20\d{2}|Present|Current))?\b', re.IGNORECASE)

SECTION_HEADER_EDU = re.compile(r'^\s*(?:education|academics|academic\s+qualifications?|qualifications?)\s*$', re.IGNORECASE)
SECTION_HEADER_OTHER = re.compile(r'^\s*(?:experience|work\s+experience|employment|skills|projects|certifications|awards|summary)\s*$', re.IGNORECASE)

def extract_education(text: str, nlp=None) -> List[Dict[str, str]]:
    """Extract education history: degree, institution, and year."""
    education_entries = []
    lines = text.split("\n")

    in_edu_section = False
    edu_text_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if SECTION_HEADER_EDU.match(stripped):
            in_edu_section = True
            continue
        elif in_edu_section and SECTION_HEADER_OTHER.match(stripped):
            in_edu_section = False
            break

        if in_edu_section:
            edu_text_lines.append(line)

    lines_to_search = edu_text_lines if edu_text_lines else lines

    for i, line in enumerate(lines_to_search):
        degree_found = None
        for pat in DEGREE_PATTERNS:
            match = re.search(pat, line, re.IGNORECASE)
            if match:
                degree_found = match.group(0)
                break

        if degree_found:
            surrounding = " ".join(lines_to_search[max(0, i-1):min(len(lines_to_search), i+3)])

            # Year search
            year_match = YEAR_PATTERN.search(surrounding)
            year_str = year_match.group(0) if year_match else ""

            # Institution search
            institution = ""
            for line_candidate in lines_to_search[max(0, i-1):min(len(lines_to_search), i+2)]:
                if any(w in line_candidate.lower() for w in ["university", "college", "institute", "school", "academy", "campus"]):
                    institution = line_candidate.strip()
                    break

            if not institution and nlp:
                doc = nlp(surrounding)
                for ent in doc.ents:
                    if ent.label_ == "ORG" and ent.text != degree_found:
                        institution = ent.text.strip()
                        break

            education_entries.append({
                "degree": degree_found,
                "institution": institution if institution else "University / Institute",
                "year": year_str
            })

    # Deduplicate
    unique_entries = []
    seen = set()
    for item in education_entries:
        key = (item["degree"].lower(), item["institution"].lower())
        if key not in seen:
            seen.add(key)
            unique_entries.append(item)

    return unique_entries
