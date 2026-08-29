"""
Arogya Setu Local — National Rural Health Mission Clinical Triage & Referral API
================================================================================
REST API endpoints:
  - POST /classify-urgency / /api/classify-urgency : clinical triage assessment
  - POST /match-hospital   / /api/match-hospital   : proximity-based PHC/CHC allocation
  - GET  /hospitals        / /api/hospitals        : list all hospitals with real-time distance
  - PUT  /hospitals/{id}   / /api/hospitals/{id}   : live capacity update for PHC admin portal
  - GET  /api/status                               : health check endpoint
  - GET  /*                                        : serves React Single Page Application (SPA)
"""

import os
import sys
from typing import Optional, Dict, Any, List

# Ensure backend directory is in sys.path
_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from triage import classify_urgency, match_hospital, load_hospitals

app = FastAPI(
    title="Arogya Setu Local API",
    description="National Rural Health Mission Clinical Triage & PHC Referral Engine",
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


# Helper to locate pre-built frontend distribution
def get_dist_dir() -> Optional[str]:
    candidates = [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist"),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist"),
        os.path.join(os.getcwd(), "frontend", "dist"),
        os.path.join(os.getcwd(), "dist"),
        os.path.join(os.getcwd(), "backend", "dist"),
    ]
    for c in candidates:
        if os.path.exists(c) and os.path.exists(os.path.join(c, "index.html")):
            return os.path.abspath(c)
    return None


dist_dir = get_dist_dir()
if dist_dir:
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")



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


# ---------- API Endpoints ----------

@app.get("/api/status")
@app.get("/api/health")
def api_status():
    return {
        "app": "Arogya Setu Local",
        "status": "running",
        "version": "2.1.0",
        "hospitals_loaded": len(HOSPITALS),
        "protocol": "National Rural Health Clinical Protocol (ESI & WHO Standards)",
    }


@app.post("/classify-urgency", response_model=UrgencyResponse)
@app.post("/api/classify-urgency", response_model=UrgencyResponse)
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
@app.post("/api/match-hospital", response_model=HospitalResponse)
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
@app.get("/api/hospitals", response_model=List[Dict[str, Any]])
def get_hospitals(lat: Optional[float] = None, lng: Optional[float] = None):
    from triage import calculate_distance
    if lat is not None and lng is not None:
        recalculated = []
        for h in HOSPITALS:
            item = dict(h)
            if "lat" in item and "lng" in item and item["lat"] and item["lng"]:
                item["distance_km"] = calculate_distance(lat, lng, item["lat"], item["lng"])
            recalculated.append(item)
        recalculated.sort(key=lambda x: x.get("distance_km", 999))
        return recalculated
    return HOSPITALS


@app.put("/hospitals/{hospital_id}")
@app.put("/api/hospitals/{hospital_id}")
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


# ---------- Root & SPA Catch-All Route ----------

@app.get("/")
@app.get("/{full_path:path}")
async def serve_root_or_spa(full_path: str = ""):
    # If the client requested an unhandled /api route, return 404 JSON instead of HTML
    if full_path == "api" or full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API route /{full_path} not found")

    current_dist = get_dist_dir()
    if current_dist:
        if full_path:
            # Check for direct file match (e.g., favicon.ico, vite.svg, assets/...)
            specific_file = os.path.join(current_dist, full_path)
            if os.path.exists(specific_file) and os.path.isfile(specific_file):
                return FileResponse(specific_file)

        # For all other frontend routes (React SPA), serve index.html
        index_file = os.path.join(current_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)

    # Fallback status if frontend is not yet built
    return {
        "app": "Arogya Setu Local",
        "status": "running",
        "version": "2.1.0",
        "hospitals_loaded": len(HOSPITALS),
        "protocol": "National Rural Health Clinical Protocol (ESI & WHO Standards)",
        "notice": "Frontend build not found. Please run 'npm run build' in the frontend folder.",
    }

