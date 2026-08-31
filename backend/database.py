"""
database.py - SQLite Database Storage Layer for Arogya Setu Local
================================================================
Handles persistent relational storage for:
- User accounts & role authentication (Citizen, Doctor, ASHA, Admin)
- Security audit logs for all login attempts
- Patient Health Assessment & Triage Reports history
- Teleconsultation Video Call Records
"""

import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "arogya_setu.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes SQLite database tables and default demo users."""
    conn = get_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL, -- 'patient', 'doctor', 'asha', 'admin'
            phone TEXT,
            abha_id TEXT,
            facility TEXT,
            specialty TEXT,
            reg_no TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Login Audit Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            user_name TEXT,
            role TEXT NOT NULL,
            ip_address TEXT,
            status TEXT DEFAULT 'SUCCESS',
            login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 3. Patient Health Assessment & Triage Reports / Prescriptions
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patient_reports (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            patient_name TEXT NOT NULL,
            phone TEXT,
            age INTEGER,
            gender TEXT,
            symptoms TEXT NOT NULL,
            urgency TEXT NOT NULL,
            is_prescription INTEGER DEFAULT 0,
            diagnosis TEXT,
            doctor_name TEXT,
            vitals_json TEXT,
            advice TEXT,
            hospital_name TEXT,
            hospital_distance REAL,
            prescribed_medicines_json TEXT,
            medicines_list_json TEXT,
            doctor_notes TEXT,
            risk_factors_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    try:
        cursor.execute("ALTER TABLE patient_reports ADD COLUMN is_prescription INTEGER DEFAULT 0")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE patient_reports ADD COLUMN diagnosis TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE patient_reports ADD COLUMN doctor_name TEXT")
    except Exception:
        pass
    try:
        cursor.execute("ALTER TABLE patient_reports ADD COLUMN medicines_list_json TEXT")
    except Exception:
        pass

    # 4. Teleconsultation Video Call Records
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teleconsult_records (
            id TEXT PRIMARY KEY,
            call_id TEXT NOT NULL,
            patient_name TEXT NOT NULL,
            doctor_name TEXT NOT NULL,
            duration_seconds INTEGER DEFAULT 0,
            symptoms TEXT,
            vitals_json TEXT,
            rx_meds_json TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    # Seed demo users if table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        demo_users = [
            ('DR-101', 'Dr. Rajesh Sharma', 'doctor', '+91 98220 11223', '91-8821-4401-1001@abdm', 'Rampur Primary Health Centre (PHC)', 'Chief Medical Officer (General Medicine)', 'MCI-MH-88210'),
            ('ASHA-404', 'Anita Devi', 'asha', '+91 98220 44556', '91-8821-4401-2002@abdm', 'Rampur Sector Sub-Centre', 'Frontline ASHA Worker', 'ASHA-RMP-404'),
            ('ADM-DIST-01', 'Dr. K. Verma', 'admin', '+91 98220 99887', '91-8821-4401-3003@abdm', 'Nagpur Rural District Health Directorate', 'District Chief Medical Officer', 'CMO-NGP-01'),
            ('PAT-DEMO-01', 'Ramesh Kumar (Citizen)', 'patient', '+91 98221 55432', '91-8821-4401-9923@abdm', 'Rampur Rural Sector', 'Citizen Patient', None),
        ]
        cursor.executemany("""
            INSERT INTO users (id, name, role, phone, abha_id, facility, specialty, reg_no)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, demo_users)

        # Seed initial health assessment reports for history
        initial_reports = [
            (
                'REP-2026-8801',
                'PAT-DEMO-01',
                'Ramesh Kumar',
                '+91 98221 55432',
                54,
                'Male',
                'High fever for 3 days with severe headache, body pain, and dry cough',
                'Moderate',
                json.dumps({"bp": "124/80", "spo2": "97%", "pulse": "82", "temp": "101.4°F"}),
                'Hydrate with ORS, take Paracetamol 500mg, and consult PHC doctor if fever persists.',
                'Rampur Primary Health Centre (PHC)',
                3.2,
                json.dumps(["Paracetamol 500mg (1 TDS)", "ORS Solution"]),
                'Patient advised bed rest and warm fluids.',
                json.dumps(["High Fever > 101°F", "Tachycardia"]),
                '2026-08-28 10:30:00'
            ),
            (
                'REP-2026-8802',
                'PAT-DEMO-01',
                'Savita Devi',
                '+91 98221 66789',
                28,
                'Female',
                'Routine ANC visit checkup with mild swelling in feet at 28 weeks gestation',
                'Mild',
                json.dumps({"bp": "118/76", "spo2": "99%", "pulse": "74", "temp": "98.4°F", "isPregnant": True}),
                'Continue daily IFA and Calcium supplements. Schedule 3rd ANC scan.',
                'Rampur Sector Sub-Centre',
                1.5,
                json.dumps(["Iron Folic Acid (IFA) Tablets", "Calcium Carbonate 500mg"]),
                'Fetal heart sounds normal (142 bpm).',
                json.dumps(["Mild Pedal Edema"]),
                '2026-08-29 15:45:00'
            )
        ]
        cursor.executemany("""
            INSERT INTO patient_reports (
                id, user_id, patient_name, phone, age, gender, symptoms, urgency,
                vitals_json, advice, hospital_name, hospital_distance,
                prescribed_medicines_json, doctor_notes, risk_factors_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_reports)

        conn.commit()

    conn.close()


# ---------- Database Operations ----------

def log_login_event(user_id: str, user_name: str, role: str, ip_address: str = "127.0.0.1", status: str = "SUCCESS"):
    """Records a login audit entry in the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO login_logs (user_id, user_name, role, ip_address, status)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, user_name, role, ip_address, status))
    conn.commit()
    conn.close()


def get_login_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent login events."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, user_id, user_name, role, ip_address, status, login_time
        FROM login_logs
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_or_update_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves or updates a user profile."""
    conn = get_connection()
    cursor = conn.cursor()
    user_id = user_data.get("id") or f"USR-{int(datetime.now().timestamp())}"
    cursor.execute("""
        INSERT OR REPLACE INTO users (id, name, role, phone, abha_id, facility, specialty, reg_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        user_data.get("name", "Citizen"),
        user_data.get("role", "patient"),
        user_data.get("phone", ""),
        user_data.get("abha_id", user_data.get("abhaNumber", "")),
        user_data.get("facility", ""),
        user_data.get("specialty", ""),
        user_data.get("reg_no", user_data.get("regNo", ""))
    ))
    conn.commit()
    conn.close()
    return {**user_data, "id": user_id}


def get_all_users() -> List[Dict[str, Any]]:
    """Returns all registered users."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_patient_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves a patient health assessment or triage report."""
    conn = get_connection()
    cursor = conn.cursor()
    report_id = report_data.get("id") or f"REP-{datetime.now().year}-{int(datetime.now().timestamp()) % 10000:04d}"
    
    vitals = report_data.get("vitals", {})
    if isinstance(vitals, dict):
        vitals_json = json.dumps(vitals)
    else:
        vitals_json = str(vitals)

    meds = report_data.get("prescribed_medicines", report_data.get("medicines", []))
    meds_json = json.dumps(meds) if isinstance(meds, list) else str(meds)

    meds_list = report_data.get("medicines_list", [])
    meds_list_json = json.dumps(meds_list) if isinstance(meds_list, list) else str(meds_list)

    risks = report_data.get("risk_factors", [])
    risks_json = json.dumps(risks) if isinstance(risks, list) else str(risks)

    hospital = report_data.get("hospital", {})
    h_name = hospital.get("name", "") if isinstance(hospital, dict) else str(hospital or "")
    h_dist = hospital.get("distance_km", 0.0) if isinstance(hospital, dict) else 0.0

    is_rx = 1 if (report_data.get("is_prescription") or report_id.startswith("RX") or bool(meds_list)) else 0

    cursor.execute("""
        INSERT OR REPLACE INTO patient_reports (
            id, user_id, patient_name, phone, age, gender, symptoms, urgency,
            is_prescription, diagnosis, doctor_name,
            vitals_json, advice, hospital_name, hospital_distance,
            prescribed_medicines_json, medicines_list_json, doctor_notes, risk_factors_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report_id,
        report_data.get("user_id", "PAT-DEMO-01"),
        report_data.get("patient_name", report_data.get("name", "Resident")),
        report_data.get("phone", ""),
        report_data.get("age", 30),
        report_data.get("gender", "Other"),
        report_data.get("symptoms", "Routine checkup"),
        report_data.get("urgency", "Moderate"),
        is_rx,
        report_data.get("diagnosis", "Clinical Diagnosis"),
        report_data.get("doctor_name", "Dr. Rajesh Sharma (MD)"),
        vitals_json,
        report_data.get("advice", ""),
        h_name,
        h_dist,
        meds_json,
        meds_list_json,
        report_data.get("doctor_notes", ""),
        risks_json
    ))
    conn.commit()
    conn.close()
    return {**report_data, "id": report_id}


def get_patient_reports(user_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieves patient assessment history reports and prescriptions."""
    conn = get_connection()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("""
            SELECT * FROM patient_reports
            WHERE user_id = ? OR phone LIKE ?
            ORDER BY created_at DESC
            LIMIT ?
        """, (user_id, f"%{user_id}%", limit))
    else:
        cursor.execute("""
            SELECT * FROM patient_reports
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        try:
            d["vitals"] = json.loads(d["vitals_json"]) if d.get("vitals_json") else {}
        except:
            d["vitals"] = {}
        try:
            d["prescribed_medicines"] = json.loads(d["prescribed_medicines_json"]) if d.get("prescribed_medicines_json") else []
        except:
            d["prescribed_medicines"] = []
        try:
            d["medicines_list"] = json.loads(d["medicines_list_json"]) if d.get("medicines_list_json") else []
        except:
            d["medicines_list"] = []
        try:
            d["risk_factors"] = json.loads(d["risk_factors_json"]) if d.get("risk_factors_json") else []
        except:
            d["risk_factors"] = []
        d["is_prescription"] = bool(d.get("is_prescription")) or d["id"].startswith("RX") or bool(d.get("medicines_list"))
        results.append(d)
    return results


def delete_patient_report(report_id: str) -> bool:
    """Deletes a report by ID."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patient_reports WHERE id = ?", (report_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted


def clear_all_patient_reports() -> bool:
    """Wipes all patient reports and teleconsultation records from SQLite."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM patient_reports")
    cursor.execute("DELETE FROM teleconsult_records")
    conn.commit()
    conn.close()
    return True


def save_teleconsult_record(call_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves a teleconsultation video call record."""
    conn = get_connection()
    cursor = conn.cursor()
    rec_id = call_data.get("id") or f"TC-{int(datetime.now().timestamp()) % 10000:04d}"
    cursor.execute("""
        INSERT INTO teleconsult_records (
            id, call_id, patient_name, doctor_name, duration_seconds,
            symptoms, vitals_json, rx_meds_json, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rec_id,
        call_data.get("call_id", rec_id),
        call_data.get("patient_name", "Patient"),
        call_data.get("doctor_name", "Duty Doctor"),
        call_data.get("duration_seconds", 0),
        call_data.get("symptoms", ""),
        json.dumps(call_data.get("vitals", {})),
        json.dumps(call_data.get("rx_meds", [])),
        call_data.get("notes", "")
    ))
    conn.commit()
    conn.close()
    return {**call_data, "id": rec_id}


def get_teleconsult_records(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent teleconsultation video records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM teleconsult_records ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        try:
            d["vitals"] = json.loads(d["vitals_json"]) if d.get("vitals_json") else {}
        except:
            d["vitals"] = {}
        try:
            d["rx_meds"] = json.loads(d["rx_meds_json"]) if d.get("rx_meds_json") else []
        except:
            d["rx_meds"] = []
        results.append(d)
    return results


# Auto-initialize database on import
init_db()
