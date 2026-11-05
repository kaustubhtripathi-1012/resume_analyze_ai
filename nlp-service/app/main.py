import os
import json
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .config import settings
from .parsers.pdf_text import extract_pdf_text
from .parsers.docx_text import extract_docx_text
from .extractors.entities import extract_contact_info
from .extractors.skills import extract_skills
from .extractors.education import extract_education
from .extractors.experience import extract_experience
from .scoring.ats import score_resume
from .matching.similarity import compute_match
from .matching.recommend import recommend_jobs

app = FastAPI(
    title="Resume Analyzer NLP Service",
    version="1.0.0",
    description="Microservice for resume text extraction, entity parsing, ATS scoring, and job matching."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models and taxonomy
nlp_model = None
skills_taxonomy = []
section_keywords = {}

@app.on_event("startup")
def load_resources():
    global nlp_model, skills_taxonomy, section_keywords
    # 1. Load spaCy model with graceful fallback
    try:
        import spacy
        try:
            nlp_model = spacy.load(settings.SPACY_MODEL)
        except Exception:
            try:
                nlp_model = spacy.load("en_core_web_sm")
            except Exception:
                nlp_model = None
    except Exception:
        nlp_model = None

    # 2. Load skills taxonomy
    skills_path = os.path.join(os.path.dirname(__file__), "data", "skills.json")
    if os.path.exists(skills_path):
        with open(skills_path, "r", encoding="utf-8") as f:
            skills_taxonomy = json.load(f)

    # 3. Load section keywords
    sec_path = os.path.join(os.path.dirname(__file__), "data", "section_keywords.json")
    if os.path.exists(sec_path):
        with open(sec_path, "r", encoding="utf-8") as f:
            section_keywords = json.load(f)

def verify_service_key(x_service_key: Optional[str] = Header(None)):
    """Optionally verify internal service authentication."""
    # If a service key is configured in settings and provided, check it
    if settings.SERVICE_KEY and settings.SERVICE_KEY != "your_nlp_service_key_here":
        if x_service_key != settings.SERVICE_KEY:
            raise HTTPException(status_code=401, detail="Invalid internal service key")
    return True

# Request Schemas
class ParseRequest(BaseModel):
    filePath: str
    fileType: str

class ScoreRequest(BaseModel):
    parsedProfile: Dict[str, Any]
    rawText: str

class MatchRequest(BaseModel):
    parsedProfile: Dict[str, Any]
    jobText: str
    jobSkills: Optional[List[str]] = []
    experienceLevel: Optional[str] = "fresher"

class RecommendRequest(BaseModel):
    parsedProfile: Dict[str, Any]
    jobs: List[Dict[str, Any]]
    topN: Optional[int] = 10

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "nlp-service",
        "spacy_loaded": nlp_model is not None,
        "skills_count": len(skills_taxonomy)
    }

@app.post("/parse", dependencies=[Depends(verify_service_key)])
def parse_resume(req: ParseRequest):
    file_path = req.filePath
    file_type = req.fileType.lower()

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

    try:
        if file_type == "pdf":
            raw_text = extract_pdf_text(file_path)
        elif file_type in ["docx", "doc"]:
            raw_text = extract_docx_text(file_path)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Text extraction failed: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Extracted text is empty. Please upload a clear text PDF or DOCX file.")

    # Entity and feature extraction
    contact = extract_contact_info(raw_text, nlp=nlp_model)
    skills = extract_skills(raw_text, taxonomy=skills_taxonomy)
    education = extract_education(raw_text, nlp=nlp_model)
    experience = extract_experience(raw_text, nlp=nlp_model)

    parsed_profile = {
        "name": contact.get("name", ""),
        "email": contact.get("email", ""),
        "phone": contact.get("phone", ""),
        "links": contact.get("links", []),
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": []
    }

    return {
        "rawText": raw_text,
        "parsed": parsed_profile
    }

@app.post("/score", dependencies=[Depends(verify_service_key)])
def score_endpoint(req: ScoreRequest):
    result = score_resume(
        text=req.rawText,
        parsed=req.parsedProfile,
        weights=settings.SCORING_WEIGHTS,
        section_keywords=section_keywords
    )
    return result

@app.post("/match", dependencies=[Depends(verify_service_key)])
def match_endpoint(req: MatchRequest):
    result = compute_match(
        parsed_profile=req.parsedProfile,
        job_text=req.jobText,
        required_skills=req.jobSkills,
        job_level=req.experienceLevel
    )
    return result

@app.post("/recommend", dependencies=[Depends(verify_service_key)])
def recommend_endpoint(req: RecommendRequest):
    results = recommend_jobs(
        parsed_profile=req.parsedProfile,
        jobs=req.jobs,
        top_n=req.topN or 10
    )
    return {"items": results}

