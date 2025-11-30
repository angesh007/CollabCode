# Backend (Minimal: 2 files)

Files:
- `main.py` — API routes + WebSocket + models + schemas
- `db.py` — SQLAlchemy engine/session + init
- `.env` — server + database settings

## Run
```
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
