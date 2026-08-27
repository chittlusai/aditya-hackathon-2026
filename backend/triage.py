"""
triage.py — Deep Gemini AI + Rule-based Urgency Classification & Hospital Matching
==================================================================================
"""

import json
import os
import re
import math
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


# Keyword dictionaries supporting English and Indian language transliterations
EMERGENCY_KEYWORDS = {
    # Cardiac
    "chest pain": 4, "सीने में दर्द": 4, "छातीत दुखणे": 4, "heart attack": 5, "crushing chest": 5, "pressure in chest": 4,
    # Respiratory
    "can't breathe": 5, "cannot breathe": 5, "cant breathe": 5, "difficulty breathing": 4,
    "shortness of breath": 4, "सांस लेने में तकलीफ": 4, "श्वास घेण्यास त्रास": 4, "choking": 5, "turning blue": 5,
    # Neuro
    "unconscious": 5, "बेहोश": 5, "fainted": 3, "seizure": 5, "convulsion": 5, "दौरा": 5,
    "stroke": 5, "slurred speech": 4, "face drooping": 4, "numbness one side": 4,
    # Bleeding / trauma
    "severe bleeding": 5, "खून बहना": 5, "heavy bleeding": 4, "blood loss": 4,
    "head injury": 4, "broken bone": 3, "snake bite": 5, "सांप": 5, "dog bite": 3,
    # Allergic / toxic
    "anaphylaxis": 5, "allergic reaction": 3, "swollen tongue": 4, "poisoning": 5,
    "overdose": 5, "suicide": 5, "suicidal": 5,
    # Pregnancy
    "labor pain": 3, "heavy bleeding pregnancy": 5, "ectopic": 5,
}

MODERATE_KEYWORDS = {
    "high fever": 3, "तेज बुखार": 3, "तीव्र ताप": 3, "fever 3 days": 3, "fever for 3 days": 3, "persistent fever": 3,
    "vomiting": 2, "उल्टी": 2, "blood in vomit": 4, "persistent vomiting": 3,
    "dehydration": 3, "severe diarrhea": 3, "diarrhea and vomiting": 3, "दस्त": 2,
    "abdominal pain": 2, "पेट दर्द": 2, "severe abdominal": 3, "stomach pain severe": 3,
    "dizziness": 2, "चक्कर": 2, "fainting spells": 3,
    "infection": 2, "wound infection": 2, "pus": 2,
    "asthma attack": 3, "wheezing": 2,
    "urinary": 1, "burning urination": 2, "blood in urine": 4,
    "rash spreading": 2, "skin infection": 2,
    "fracture": 2, "sprain": 1,
    "pregnancy bleeding": 4, "pregnant bleeding": 4,
    "severe headache": 2, "सिरदर्द": 2, "migraine": 2,
}

SPECIALIST_HINTS = {
    "cardio": ["chest pain", "heart", "palpitation", "blood pressure", "bp high", "hypertension", "सीने में दर्द", "छातीत दुखणे"],
    "neuro":  ["seizure", "stroke", "numbness", "headache severe", "migraine", "convulsion", "slurred", "बेहोश", "दौरा"],
    "ortho":  ["fracture", "broken bone", "sprain", "joint pain", "back pain", "knee pain", "चोट", "हड्डी"],
    "pediatric": ["child", "baby", "infant", "toddler", "kid", "बच्चा", "मूल"],
    "gyn":    ["pregnant", "pregnancy", "labor", "period", "menstrual", "vaginal", "गर्भवती", "गरोदर"],
    "ent":    ["ear pain", "sore throat", "throat", "sinus", "hearing", "गला", "कान"],
    "derm":   ["rash", "skin", "itching", "allergy skin", "eczema", "दाद", "त्वचा"],
    "general":["fever", "cough", "cold", "vomiting", "diarrhea", "flu", "body ache", "बुखार", "ताप"],
}


def load_hospitals(path: str = None) -> List[Dict[str, Any]]:
    """Load the mock hospital dataset from disk."""
    if path is None:
        here = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(here, "hospitals.json")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def classify_with_gemini(text: str, vitals: Optional[Dict[str, Any]] = None, language: str = "en") -> Optional[Dict[str, Any]]:
    """Query Google Gemini API for deep AI clinical triage."""
    if not GEMINI_API_KEY:
        return None

    vitals = vitals or {}
    models = ["gemini-1.5-flash", "gemini-2.5-flash", "gemini-pro"]

    prompt = f"""
Analyze this patient illness according to clinical emergency triage standards:
Symptoms: "{text}"
Vitals: Age: {vitals.get('age')}, SpO2: {vitals.get('spo2')}%, Pulse: {vitals.get('pulse')}, BP: {vitals.get('bp')}, Temp: {vitals.get('temp')}F, Sugar: {vitals.get('sugar')}, Pregnant: {vitals.get('isPregnant')}

Determine:
1. Urgency: 'Emergency', 'Moderate', or 'Mild'
2. Confidence score (0.75-0.99)
3. Matched keywords/symptoms
4. Actionable medical advice in {language}
5. Risk factors

Return JSON only:
{{
  "urgency": "Emergency"|"Moderate"|"Mild",
  "confidence": 0.95,
  "matched_keywords": ["symptom1"],
  "risk_factors": ["risk1"],
  "advice": "..."
}}
"""

    for model in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={GEMINI_API_KEY}"
            payload = json.dumps({
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                text_out = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_out.replace("```json", "").replace("```", "").strip())
                return {
                    "urgency": parsed.get("urgency", "Moderate"),
                    "confidence": float(parsed.get("confidence", 0.92)),
                    "matched_keywords": parsed.get("matched_keywords", []),
                    "advice": parsed.get("advice", "Please consult your nearest primary healthcare doctor."),
                    "risk_factors": parsed.get("risk_factors", []),
                    "ai_powered": True
                }
        except Exception:
            continue

    return None


def classify_urgency(text: str, vitals: Optional[Dict[str, Any]] = None, language: str = "en") -> Dict[str, Any]:
    """
    Classify symptom description + optional clinical vitals into Mild / Moderate / Emergency.
    Tries Gemini AI first, falling back to rule engine.
    """
    ai_result = classify_with_gemini(text, vitals, language)
    if ai_result:
        return ai_result

    text_lower = (text or "").lower()
    emergency_score = 0
    moderate_score = 0
    matched = []

    # Score emergency keywords
    for keyword, weight in EMERGENCY_KEYWORDS.items():
        if keyword in text_lower:
            emergency_score += weight
            if keyword not in matched:
                matched.append(keyword)

    # Score moderate keywords
    for keyword, weight in MODERATE_KEYWORDS.items():
        if keyword in text_lower:
            moderate_score += weight
            if keyword not in matched:
                matched.append(keyword)

    # Vitals clinical risk triggers
    if vitals:
        try:
            spo2 = float(vitals.get("spo2") or 0)
            if 0 < spo2 < 90:
                emergency_score += 6
                matched.append("Critical Low SpO2 (<90%)")
            elif 90 <= spo2 < 94:
                moderate_score += 3
                matched.append("Low Oxygen SpO2")
        except (ValueError, TypeError):
            pass

        try:
            temp = float(vitals.get("temp") or 0)
            if temp >= 104.0:
                emergency_score += 4
                matched.append("Hyperpyrexia Fever (≥104°F)")
            elif temp >= 101.5:
                moderate_score += 3
                matched.append("High Grade Fever")
        except (ValueError, TypeError):
            pass

        try:
            pulse = float(vitals.get("pulse") or 0)
            if pulse > 140 or (0 < pulse < 45):
                emergency_score += 4
                matched.append("Dangerous Pulse Rate")
            elif pulse > 110 or (0 < pulse < 55):
                moderate_score += 2
                matched.append("Abnormal Heart Rate")
        except (ValueError, TypeError):
            pass

        if vitals.get("isPregnant") and (emergency_score > 0 or moderate_score > 0):
            emergency_score += 3
            matched.append("Pregnancy Priority Complication")

    # Urgency decision
    if emergency_score >= 4:
        urgency = "Emergency"
        confidence = min(0.98, 0.75 + (emergency_score * 0.05))
        advice = (
            "🚨 CRITICAL: Seek emergency medical care immediately or call 108 Ambulance service. "
            "Do not delay. Go to the nearest trauma centre or emergency hospital."
        )
    elif moderate_score >= 2 or emergency_score >= 1:
        urgency = "Moderate"
        confidence = min(0.92, 0.65 + (moderate_score * 0.05))
        advice = (
            "⚠️ Medical attention recommended today. Please visit your nearest Primary Health Centre (PHC) "
            "or Community Health Centre (CHC) for clinical evaluation."
        )
    else:
        urgency = "Mild"
        confidence = 0.55 if not matched else 0.65
        advice = (
            "Your symptoms appear mild. Rest, stay hydrated, and monitor yourself. "
            "Visit a clinic if they worsen or persist beyond 2-3 days."
        )

    return {
        "urgency": urgency,
        "confidence": round(confidence, 2),
        "matched_keywords": matched,
        "advice": advice,
        "ai_powered": False
    }


def _detect_specialty(symptom_text: str) -> str:
    text_lower = (symptom_text or "").lower()
    scores = {spec: 0 for spec in SPECIALIST_HINTS}
    for spec, hints in SPECIALIST_HINTS.items():
        for hint in hints:
            if hint in text_lower:
                scores[spec] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


def _stock_score(stock: str) -> float:
    stock = (stock or "").lower()
    if "in stock" in stock or "full" in stock or "good" in stock:
        return 1.0
    if "low" in stock:
        return 0.5
    if "out" in stock:
        return 0.0
    return 0.5


def _match_reason(hospital: Dict[str, Any], urgency: str, specialty: str) -> str:
    parts = []
    if urgency == "Emergency":
        parts.append("closest facility equipped for emergency care")
    elif urgency == "Moderate":
        parts.append("well-suited for secondary clinical care")
    else:
        parts.append("convenient nearby option for primary care")

    if hospital.get("doctors_available", 0) >= 3:
        parts.append(f"{hospital['doctors_available']} doctors available right now")

    if specialty != "general" and specialty in (hospital.get("specialist") or "").lower():
        parts.append(f"has a {specialty.capitalize()} specialist on duty")

    stock = (hospital.get("medicine_stock") or "").lower()
    if "in stock" in stock or "good" in stock:
        parts.append("essential medicines in stock")

    if hospital.get("distance_km", 99) < 5:
        parts.append(f"only {hospital['distance_km']:.1f} km away")

    return "Selected: " + " • ".join(parts).capitalize() + "."


def match_hospital(
    urgency: str,
    symptoms: str,
    hospitals: List[Dict[str, Any]],
    user_coords: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """Score every hospital and return the best one with an explanation."""
    if not hospitals:
        return {
            "name": "No facility available",
            "distance_km": 0,
            "type": "—",
            "doctors_available": 0,
            "specialist": None,
            "medicine_stock": "unknown",
            "match_score": 0,
            "match_reason": "No hospitals are currently registered in the system.",
        }

    specialty = _detect_specialty(symptoms)

    if urgency == "Emergency":
        w_dist, w_avail, w_spec, w_stock = 0.45, 0.35, 0.15, 0.05
    elif urgency == "Moderate":
        w_dist, w_avail, w_spec, w_stock = 0.30, 0.30, 0.25, 0.15
    else:  # Mild
        w_dist, w_avail, w_spec, w_stock = 0.50, 0.20, 0.15, 0.15

    # Update distances if user coords provided
    hosp_list = []
    for h in hospitals:
        item = dict(h)
        if user_coords and "lat" in user_coords and "lng" in user_coords and "lat" in item and "lng" in item:
            item["distance_km"] = calculate_distance(user_coords["lat"], user_coords["lng"], item["lat"], item["lng"])
        hosp_list.append(item)

    max_dist = max((h.get("distance_km", 1) for h in hosp_list), default=1) or 1
    max_avail = max((h.get("doctors_available", 1) for h in hosp_list), default=1) or 1

    best = None
    best_score = -1.0
    for h in hosp_list:
        dist = h.get("distance_km", 0)
        avail = h.get("doctors_available", 0)
        spec_text = (h.get("specialist") or "").lower()
        stock = _stock_score(h.get("medicine_stock", ""))

        dist_score = 1.0 - (dist / (max_dist * 1.1))
        avail_score = avail / max_avail

        if specialty != "general" and specialty in spec_text:
            spec_score = 1.0
        elif h.get("specialist") and h["specialist"] != "None":
            spec_score = 0.6
        else:
            spec_score = 0.3

        total = (
            w_dist * dist_score
            + w_avail * avail_score
            + w_spec * spec_score
            + w_stock * stock
        )

        if total > best_score:
            best_score = total
            best = h

    return {
        **best,
        "match_score": round(best_score, 3),
        "match_reason": _match_reason(best, urgency, specialty),
    }
