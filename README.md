# 🇮🇳 Arogya Setu Local (SIH26133)
> **National Rural Health Mission • Offline-First Clinical Triage, WhatsApp AI Teleconsultation & Governance Health Mesh**

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL--Mode-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5-Multimodal_Vision-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Neural_Voice_TTS-black?style=flat)](https://elevenlabs.io/)
[![ABDM FHIR R4](https://img.shields.io/badge/ABDM-HL7_FHIR_R4-orange?style=flat)](https://abdm.gov.in/)

---

## 📌 Executive Summary
**Arogya Setu Local (SIH26133)** is a comprehensive, offline-first National Rural Health Mission digital healthcare ecosystem designed to bridge the critical last-mile healthcare divide across India's 650,000+ villages by transforming rural triage, emergency response, and clinical teleconsultation through **20 flagship features** spanning 4 role-based portals (Citizen Patient, Doctor OPD Workbench, ASHA Super-App, and District Health Directorate Command). The core problem it solves is the lack of specialized doctors and connectivity in remote areas, which often leads to misdiagnoses, delayed emergency interventions, and overcrowded tertiary hospitals; our solution integrates an offline-capable clinical decision matrix with **Google Gemini Multimodal Vision AI** for automated facial pain/expression and injury screening, **ElevenLabs Multilingual V2 Neural TTS** for realistic WhatsApp-style doctor teleconsultation, real-time proximity-based PHC/CHC bed and oxygen routing, an ABDM-compliant **FHIR R4 & Consent Vault**, and a categorized **Daily Pill Adherence & Timings Tracker** supporting **17 major Indian regional languages** with voice dictation. Built upon a high-performance technical stack of **React 18, Vite, TailwindCSS, Python FastAPI, and SQLite (WAL mode)**, this platform reduces hospital intake latency from hours to seconds, eliminates language barriers for illiterate citizens, enables ASHA frontline workers to conduct doorstep screenings with automated digital referral slips, and directly delivers life-saving, zero-delay healthcare access to over 800 million rural citizens.

---

## 🌟 Complete Catalog of All 20 Upgrade Features

| # | Feature Name | Description |
|---|---|---|
| **01** | **Visual Body Map Symptom Selector** | 18 interactive anatomical body parts with 1-tap visual symptom cards. |
| **02** | **17 Major Indian Languages Engine** | Full UI translation & BCP-47 speech recognition across 17 regional languages. |
| **03** | **Dual-Mode AI Triage Engine** | Offline `<10ms` matrix + Google Gemini 2.5 Flash Multimodal Vision AI. |
| **04** | **Dynamic Facilities & Bed Mesh** | Proximity GPS radar tracking ICU beds, Oxygen, and on-duty doctors. |
| **05** | **Proximity GPS Routing & Cards** | Turn-by-turn routing with direct 108 ambulance dialers. |
| **06** | **End-to-End Referral Journey Tracker** | Complete 5-stage referral lifecycle monitoring with drop-off alerts. |
| **07** | **Verified Digital Health Slip & QR** | MoHFW-compliant bilingual referral slip with dynamic QR code verification. |
| **08** | **Smart OPD Queue Prediction Engine** | Live queue waiting time prediction using Poisson-distribution estimation. |
| **09** | **Doctor OPD Workbench Desk** | Clinical workbench for fast digital triage review and prescription dispatch. |
| **10** | **Essential Medicine Stock Router** | Live inventory tracking with nearest alternative stock pharmacy routing. |
| **11** | **Rural Diagnostics Directory** | Live availability catalog for essential rural lab tests (CBC, Malaria, Sputum). |
| **12** | **High-Risk Maternal & Child Care (MCH)** | Trimester-wise ANC/PNC tracking with pre-eclampsia and anemia alerts. |
| **13** | **Chronic Care (NCD) Registry** | Longitudinal tracking for Hypertension, Diabetes, and COPD. |
| **14** | **ASHA Super-App Offline Registry** | Doorstep screening app with offline household records & auto SQLite sync. |
| **15** | **Epidemic Outbreak Early Warning** | Disease surveillance cluster heatmaps for Dengue, Malaria, and ADD. |
| **16** | **Authentic WhatsApp Doctor Video Call** | Real clinical video of Dr. Rajesh Sharma with floating user PIP & Gemini AI face HUD. |
| **17** | **Ultra-Realistic ElevenLabs Voices** | Lifelike doctor voice with instant speech interruption & backend proxy. |
| **18** | **Categorized Daily Pill Tracker** | Categorizes tablets into Morning/Afternoon/Night slots with clinical purpose & voice reader. |
| **19** | **ABDM Patient Consent Vault** | ABDM-compliant granular consent management and audit logging. |
| **20** | **HL7 FHIR R4 Interoperability Bridge** | 1-click export of standard FHIR R4 clinical health record bundles. |

---

## 👥 4 Role-Based Dedicated Portals

1. 👤 **Citizen / Patient Portal**: Visual/Voice symptom checker, 108 Emergency SOS, WhatsApp Doctor Video Call, Daily Pill Timings & Purpose Vault.
2. 👩‍⚕️ **ASHA Frontline Worker Super-App**: High-risk pregnancy tracking, NCD chronic monitoring, offline household registry, doorstep triage slips.
3. 👨‍⚕️ **Doctor / CMO Workbench**: Smart OPD queue manager, fast prescription writer with timings & purpose, teleconsultation room.
4. 🏛️ **District Health Directorate Command**: Hospital capacity overrides, epidemic surveillance heatmaps, referral audits.

---

## 🚀 Quick Start Guide

### 1. Backend Service (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Application (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📄 Full Documentation
For complete technical specifications, architecture diagrams, and clinical decision rules, see [**`PROJECT_MASTER_DOCUMENTATION.md`**](file:///c:/Users/RAM/Desktop/hackathon%202026%20aditya/PROJECT_MASTER_DOCUMENTATION.md).
