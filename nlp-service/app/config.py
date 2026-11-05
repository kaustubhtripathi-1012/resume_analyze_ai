import os
from typing import Dict
try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:
            pass

class Settings:
    SERVICE_KEY: str = os.getenv("SERVICE_KEY", "your_nlp_service_key_here")
    SPACY_MODEL: str = os.getenv("SPACY_MODEL", "en_core_web_md")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # ATS Scoring weights
    SCORING_WEIGHTS: Dict[str, float] = {
        "keywords": 0.25,
        "sections": 0.20,
        "format": 0.20,
        "readability": 0.15,
        "length": 0.10,
        "contactInfo": 0.10
    }

settings = Settings()

