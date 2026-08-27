"""
Arogya Setu Local — FastAPI Backend with Gemini AI
===================================================
REST API endpoints:
  - POST /classify-urgency : takes symptom text & optional vitals, returns Gemini AI / clinical triage
  - POST /match-hospital   : takes urgency, symptoms, user coords, returns best hospital
  - GET  /hospitals        : list all hospitals
  - PUT  /hospitals/{id}   : live capacity update for PHC admin portal
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from triage import classify_urgency, match_hospital, load_hospitals

app = FastAPI(
    title="Arogya Setu Local API",
    description="Gemini AI-powered rural health triage and hospital-matching backend",
    version="2.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HOSPITALS = load_hospitals()


# ---------- Request / Response models ----------

class SymptomRequest(BaseModel):
    symptoms: str
    language: Optional[str] = "en"
    vitals: Optional[Dict[str, Any]] = None


class UrgencyResponse(BaseModel):
    urgency: str
    confidence: float
    matched_keywords: list
    advice: str
    risk_factors: Optional[List[str]] = None
    ai_powered: Optional[bool] = False


class MatchRequest(BaseModel):
    urgency: str
    symptoms: Optional[str] = ""
    language: Optional[str] = "en"
    user_coords: Optional[Dict[str, float]] = None


class HospitalResponse(BaseModel):
    id: Optional[int] = None
    name: str
    distance_km: float
    type: str
    doctors_available: int
    specialist: Optional[str]
    medicine_stock: str
    phone: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    icu_beds: Optional[int] = 0
    emergency_ready: Optional[bool] = True
    match_score: float
    match_reason: str


class HospitalUpdate(BaseModel):
    doctors_available: Optional[int] = None
    medicine_stock: Optional[str] = None
    icu_beds: Optional[int] = None
    emergency_ready: Optional[bool] = None


# ---------- Endpoints ----------

@app.get("/")
def root():
    return {
        "app": "Arogya Setu Local",
        "status": "running",
        "version": "2.1.0",
        "hospitals_loaded": len(HOSPITALS),
        "ai_engine": "Google Gemini AI",
    }


@app.post("/classify-urgency", response_model=UrgencyResponse)
def classify(symptom_request: SymptomRequest):
    if not symptom_request.symptoms or not symptom_request.symptoms.strip():
        raise HTTPException(status_code=400, detail="symptoms text is required")

    result = classify_urgency(
        symptom_request.symptoms,
        symptom_request.vitals,
        symptom_request.language or "en"
    )
    return UrgencyResponse(**result)


@app.post("/match-hospital", response_model=HospitalResponse)
def match(match_request: MatchRequest):
    if not match_request.urgency or not match_request.urgency.strip():
        raise HTTPException(status_code=400, detail="urgency is required")

    result = match_hospital(
        match_request.urgency,
        match_request.symptoms or "",
        HOSPITALS,
        match_request.user_coords,
    )
    return HospitalResponse(**result)


@app.get("/hospitals", response_model=List[Dict[str, Any]])
def get_hospitals():
    return HOSPITALS


@app.put("/hospitals/{hospital_id}")
def update_hospital(hospital_id: int, update_data: HospitalUpdate):
    for h in HOSPITALS:
        if h.get("id") == hospital_id:
            if update_data.doctors_available is not None:
                h["doctors_available"] = update_data.doctors_available
            if update_data.medicine_stock is not None:
                h["medicine_stock"] = update_data.medicine_stock
            if update_data.icu_beds is not None:
                h["icu_beds"] = update_data.icu_beds
            if update_data.emergency_ready is not None:
                h["emergency_ready"] = update_data.emergency_ready
            return {"status": "success", "hospital": h}

    raise HTTPException(status_code=404, detail=f"Hospital with id {hospital_id} not found")
