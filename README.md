# Arogya Setu Local

> AI-powered rural health triage and hospital-matching app — built for **Smart India Hackathon**.

A patient (or ASHA health worker) enters symptoms in plain language. The app
classifies the urgency (**Mild / Moderate / Emergency**) and matches them to
the best nearby healthcare facility based on urgency, doctor availability,
specialist match, and distance.

## Project layout

```
hackathon 2026 aditya/
├── backend/          # Python FastAPI service
│   ├── main.py       # API endpoints
│   ├── triage.py     # Rule-based classifier + hospital matcher (swap for ML later)
│   ├── hospitals.json
│   ├── requirements.txt
│   └── README.md
├── frontend/         # React + Vite + Tailwind + Framer Motion
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── api/client.js
│   │   ├── context/AppContext.jsx
│   │   └── components/
│   │       ├── Home.jsx
│   │       ├── SymptomInput.jsx
│   │       ├── Result.jsx
│   │       ├── UrgencyBadge.jsx
│   │       ├── HospitalCard.jsx
│   │       ├── Navbar.jsx
│   │       ├── OfflineBanner.jsx
│   │       ├── LanguageToggle.jsx
│   │       └── About.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── .env.example
└── README.md         # this file
```

## Features

- **Landing screen** with a clear "Check My Symptoms" CTA and feature highlights
- **Symptom input** — large textarea + 8 tappable common-symptom chips
- **Triage engine** — rule-based keyword matching, isolated in `triage.py` so it
  can be swapped for an ML model or LLM API call without refactoring the API
- **Urgency badge** — green / orange / red, with a gentle pulse for Emergency
- **Recommended hospital card** — name, distance, doctors, specialist, medicine
  stock, with a tappable "Why this hospital?" explanation
- **Mobile-first** — 320px → 1440px+, bottom nav on mobile, top nav on desktop
- **Offline-aware** — offline banner + cached hospital data in `localStorage`
- **Language toggle UI** (English / हिन्दी / मराठी) — present and persisted
- **Polished animations** via Framer Motion; respects `prefers-reduced-motion`
- **Installable** — includes a `manifest.webmanifest` so the app can be
  "Added to Home Screen" on a phone

## Run locally

You need two terminals — one for the backend, one for the frontend.

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at <http://localhost:8000>. Swagger UI: <http://localhost:8000/docs>.

### 2. Frontend (Vite + React)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at <http://localhost:5173>. It uses a Vite dev proxy so calls to
`/api/*` are forwarded to `http://localhost:8000` — no CORS issues during dev.

To point at a different backend in production, copy `.env.example` to
`.env` and set `VITE_API_URL`.

## Endpoints

| Method | Path                  | Body                                            |
|------- |-----------------------|-------------------------------------------------|
| POST   | `/classify-urgency`   | `{ "symptoms": "...", "language": "en" }`        |
| POST   | `/match-hospital`     | `{ "urgency": "Mild", "symptoms": "..." }`       |
| GET    | `/hospitals`          | —                                               |

## How the matching works (for judges)

1. **Urgency classification** — `triage.classify_urgency` scans the input
   for weighted emergency and moderate keywords and returns one of
   `Mild / Moderate / Emergency` plus a confidence score and the matched
   keywords (so the UI can show "Based on: chest pain, shortness of breath").
2. **Specialty hint** — symptom text is matched against specialty dictionaries
   (`cardio`, `neuro`, `ortho`, `pediatric`, `gyn`, `ent`, `derm`, `general`).
3. **Weighted score per hospital**:
   - Emergency: distance 45 % + availability 35 % + specialist 15 % + stock 5 %
   - Moderate : distance 30 % + availability 30 % + specialist 25 % + stock 15 %
   - Mild     : distance 50 % + availability 20 % + specialist 15 % + stock 15 %
4. **Best match** wins, and `_match_reason` produces a plain-language sentence
   explaining why — shown in the expandable "Why this hospital?" section.

Swap `triage.py` for an ML/LLM implementation later — the public function
signatures are stable, so `main.py` and the frontend don't change.

## Demo script

1. Open <http://localhost:5173> on a phone or browser at narrow width
2. Tap **Check My Symptoms**
3. Type something like *"I've had high fever for 3 days, body ache, and a dry cough"*
   — or tap the **Fever** + **Cough** chips
4. Tap **Check my symptoms** → see the **Moderate** orange badge pulse softly
   and the matched hospital card
5. Tap **Why this hospital?** to see the plain-language explanation
6. Try a more serious input — *"crushing chest pain, can't breathe"* — to see
   the **Emergency** red pulse
7. Disconnect from the internet (or use DevTools → Offline) — the orange
   "You're offline" banner appears at the top
