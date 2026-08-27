# Backend — Arogya Setu Local

FastAPI service that does the rule-based symptom classification and hospital
matching. The classification + matching logic lives in `triage.py` so it can
later be swapped for an ML model or LLM API call without touching the API
surface.

## Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload
```

The API will be at <http://localhost:8000>.
Interactive docs (Swagger UI): <http://localhost:8000/docs>

## Endpoints

| Method | Path                  | Body                                   |
|------- |-----------------------|----------------------------------------|
| GET    | `/`                   | —                                      |
| POST   | `/classify-urgency`   | `{ "symptoms": "...", "language": "en" }` |
| POST   | `/match-hospital`     | `{ "urgency": "Mild", "symptoms": "..." }` |
| GET    | `/hospitals`          | —                                      |
