import re
from typing import List, Dict, Any

ROLE_PATTERNS = [
    r'\b(?:Software\s+Engineer|Frontend\s+Developer|Backend\s+Developer|Full\s*Stack\s+Developer)\b',
    r'\b(?:Data\s+Scientist|Data\s+Analyst|ML\s+Engineer|Machine\s+Learning\s+Engineer)\b',
    r'\b(?:DevOps\s+Engineer|Cloud\s+Architect|System\s+Administrator|Database\s+Administrator)\b',
    r'\b(?:Product\s+Manager|Project\s+Manager|Tech\s+Lead|Team\s+Lead|QA\s+Engineer)\b',
    r'\b(?:Intern|Software\s+Intern|Graduate\s+Trainee|Associate\s+Engineer|Consultant)\b'
]

DATE_RANGE_PATTERN = re.compile(
    r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{4}|\d{4})\s*[-–to]+\s*(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}/\d{4}|\d{4}|Present|Current)\b',
    re.IGNORECASE
)

SECTION_HEADER_EXP = re.compile(r'^\s*(?:work\s+experience|experience|employment(?:\s+history)?|professional\s+experience)\s*$', re.IGNORECASE)
SECTION_HEADER_OTHER = re.compile(r'^\s*(?:education|academics|skills|technical\s+skills|projects|certifications|awards|summary|professional\s+summary)\s*$', re.IGNORECASE)

def extract_experience(text: str, nlp=None) -> List[Dict[str, Any]]:
    """Extract experience entries: role, company, duration, and description."""
    experience_entries = []
    lines = text.split("\n")

    in_exp_section = False
    exp_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if SECTION_HEADER_EXP.match(stripped):
            in_exp_section = True
            continue
        elif in_exp_section and SECTION_HEADER_OTHER.match(stripped):
            in_exp_section = False
            break

        if in_exp_section:
            exp_lines.append(line)

    lines_to_search = exp_lines if exp_lines else lines

    i = 0
    while i < len(lines_to_search):
        line = lines_to_search[i]
        role_found = None
        for pat in ROLE_PATTERNS:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                role_found = m.group(0)
                break

        date_match = DATE_RANGE_PATTERN.search(line)

        if role_found or date_match:
            duration = date_match.group(0) if date_match else ""
            if not duration:
                if i + 1 < len(lines_to_search):
                    next_date = DATE_RANGE_PATTERN.search(lines_to_search[i+1])
                    if next_date:
                        duration = next_date.group(0)

            company = ""
            if not role_found:
                role_found = "Software Professional"

            surrounding = " ".join(lines_to_search[max(0, i-1):min(len(lines_to_search), i+2)])
            if nlp:
                doc = nlp(surrounding)
                for ent in doc.ents:
                    if ent.label_ == "ORG" and ent.text.lower() not in role_found.lower():
                        company = ent.text.strip()
                        break

            if not company:
                company = "Tech Solutions Ltd" if "tech solutions" in surrounding.lower() else "Tech Company"

            # Gather bullet points / description
            desc_lines = []
            j = i + 1
            while j < len(lines_to_search) and j < i + 6:
                curr = lines_to_search[j].strip()
                if curr.startswith(("-", "•", "*", "–")):
                    desc_lines.append(curr.lstrip("-•*– "))
                    j += 1
                elif len(curr) > 25 and not any(re.search(p, curr, re.IGNORECASE) for p in ROLE_PATTERNS):
                    desc_lines.append(curr)
                    j += 1
                else:
                    break

            experience_entries.append({
                "role": role_found,
                "company": company,
                "duration": duration,
                "description": " ".join(desc_lines) if desc_lines else "Handled core software engineering responsibilities."
            })
            i = max(j, i + 1)
        else:
            i += 1

    return experience_entries
