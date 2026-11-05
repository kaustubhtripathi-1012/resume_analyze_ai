import re
from typing import List, Dict, Any

def extract_skills(text: str, taxonomy: List[Dict[str, Any]]) -> List[str]:
    """Extract and normalize skills from text based on the taxonomy list."""
    found_skills = set()
    text_lower = " " + text.lower() + " "

    for item in taxonomy:
        canonical_name = item["name"]
        aliases = item.get("aliases", [])
        all_variants = [canonical_name] + aliases

        matched = False
        for variant in all_variants:
            v_clean = variant.lower().strip()
            if not v_clean:
                continue

            # Handle single letters or symbols like C, C++, C#, R, Go
            if len(v_clean) <= 2 or "+" in v_clean or "#" in v_clean:
                escaped = re.escape(v_clean)
                pattern = rf'(?:^|[\s,;/()|]){escaped}(?:[\s,;/()|]|$)'
                if re.search(pattern, text_lower):
                    matched = True
                    break
            else:
                escaped = re.escape(v_clean)
                pattern = rf'\b{escaped}\b'
                if re.search(pattern, text_lower):
                    matched = True
                    break

        if matched:
            found_skills.add(canonical_name)

    return sorted(list(found_skills))

