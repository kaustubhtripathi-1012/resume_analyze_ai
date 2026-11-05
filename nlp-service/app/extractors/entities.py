import re
from typing import Dict, Any

EMAIL_PATTERN = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_PATTERN = re.compile(r'(?:(?:\+|0{0,2})91[\s-]?)?[6789]\d{9}|(?:\+?1[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}')

def extract_contact_info(text: str, nlp=None) -> Dict[str, Any]:
    """Extract name, email, phone, and profile links from text."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # 1. Email extraction
    email_matches = EMAIL_PATTERN.findall(text)
    email = email_matches[0] if email_matches else ""

    # 2. Phone extraction
    phone_matches = PHONE_PATTERN.findall(text)
    # clean phone match
    phone = phone_matches[0].strip() if phone_matches else ""

    # 3. Name extraction
    name = ""
    if nlp is not None:
        try:
            # Analyze first 500 characters
            doc = nlp("\n".join(lines[:6]))
            for ent in doc.ents:
                if ent.label_ == "PERSON" and len(ent.text.split()) in [2, 3, 4]:
                    name = ent.text.strip()
                    break
        except Exception:
            pass

    if not name and lines:
        # Fallback heuristic: top line without email or phone or keywords
        for line in lines[:3]:
            if not EMAIL_PATTERN.search(line) and not PHONE_PATTERN.search(line):
                cleaned = re.sub(r'[^a-zA-Z\s]', '', line).strip()
                words = cleaned.split()
                if 2 <= len(words) <= 4:
                    name = cleaned
                    break

    # 4. Links
    links = []
    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    if github_match:
        links.append(github_match.group(0))

    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+', text, re.IGNORECASE)
    if linkedin_match:
        links.append(linkedin_match.group(0))

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "links": links
    }

