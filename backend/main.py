"""
Arogya Setu Local — National Rural Health Mission Clinical Triage & Referral API
================================================================================
REST API endpoints:
  - POST /classify-urgency / /api/classify-urgency : clinical triage assessment
  - POST /match-hospital   / /api/match-hospital   : proximity-based PHC/CHC allocation
  - GET  /hospitals        / /api/hospitals        : list all hospitals with real-time distance
  - PUT  /hospitals/{id}   / /api/hospitals/{id}   : live capacity update for PHC admin portal
  - POST /api/auth/login                           : authenticate and log user session to SQLite
  - GET  /api/auth/users                           : list registered users from database
  - GET  /api/auth/login-logs                      : view security login audit trail
  - POST /api/reports                              : save patient health assessment / triage report
  - GET  /api/reports                              : get patient historical health reports
  - DELETE /api/reports/{id}                       : delete patient health report
  - POST /api/teleconsult                          : save teleconsultation video call session
  - GET  /api/teleconsult                          : get teleconsultation records
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

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from triage import classify_urgency, match_hospital, load_hospitals
import database

app = FastAPI(
    title="Arogya Setu Local API & Database Engine",
    description="National Rural Health Mission Clinical Triage, Persistent Database & Teleconsultation API",
    version="2.2.0",
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


class LoginRequest(BaseModel):
    id: Optional[str] = None
    name: str
    role: str
    phone: Optional[str] = None
    abha_id: Optional[str] = None
    facility: Optional[str] = None
    specialty: Optional[str] = None
    reg_no: Optional[str] = None


class ReportPayload(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    patient_name: str
    phone: Optional[str] = ""
    age: Optional[int] = 30
    gender: Optional[str] = "Other"
    symptoms: str
    urgency: str
    vitals: Optional[Dict[str, Any]] = None
    advice: Optional[str] = ""
    hospital: Optional[Dict[str, Any]] = None
    prescribed_medicines: Optional[List[str]] = None
    doctor_notes: Optional[str] = None
    risk_factors: Optional[List[str]] = None


# ---------- API Endpoints ----------

@app.get("/api/status")
@app.get("/api/health")
def api_status():
    return {
        "app": "Arogya Setu Local",
        "status": "running",
        "version": "2.2.0",
        "database": "SQLite Relational Storage Active (arogya_setu.db)",
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


# ---------- Database Endpoints (Auth, Login Logs, Reports, Teleconsult) ----------

@app.post("/api/auth/login")
def api_login(login_req: LoginRequest, request: Request):
    """Authenticates user, saves profile to SQLite, and logs audit record."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_dict = login_req.dict()
    saved_user = database.save_or_update_user(user_dict)
    database.log_login_event(
        user_id=saved_user["id"],
        user_name=saved_user["name"],
        role=saved_user["role"],
        ip_address=client_ip,
        status="SUCCESS"
    )
    return {
        "status": "success",
        "message": f"Authenticated successfully as {saved_user['name']} ({saved_user['role']})",
        "user": saved_user,
    }


@app.get("/api/auth/users")
def get_users():
    """Returns all registered users stored in SQLite."""
    return database.get_all_users()


@app.get("/api/auth/login-logs")
def get_logs():
    """Returns login audit trail from SQLite."""
    return database.get_login_logs(limit=100)


@app.post("/api/reports")
def create_report(payload: ReportPayload):
    """Saves a patient health assessment & triage report to SQLite."""
    report_dict = payload.dict()
    saved = database.save_patient_report(report_dict)
    return {
        "status": "success",
        "message": "Health assessment report saved to SQLite database successfully",
        "report": saved,
    }


@app.get("/api/reports")
def get_reports(user_id: Optional[str] = None):
    """Retrieves patient historical assessment reports from SQLite."""
    return database.get_patient_reports(user_id=user_id, limit=100)


@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str):
    """Deletes a report by ID."""
    success = database.delete_patient_report(report_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found")
    return {"status": "success", "message": f"Report {report_id} deleted successfully"}


@app.post("/api/teleconsult")
def create_teleconsult(call_data: Dict[str, Any]):
    """Saves a teleconsultation video call record to SQLite."""
    saved = database.save_teleconsult_record(call_data)
    return {"status": "success", "record": saved}


@app.get("/api/teleconsult")
def get_teleconsult():
    """Retrieves teleconsultation video call records."""
    return database.get_teleconsult_records(limit=50)


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
        "version": "2.2.0",
        "database": "SQLite Relational Storage Active (arogya_setu.db)",
        "hospitals_loaded": len(HOSPITALS),
        "protocol": "National Rural Health Clinical Protocol (ESI & WHO Standards)",
        "notice": "Frontend build not found. Please run 'npm run build' in the frontend folder.",
    }
