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

## Database Notes (Supabase pooled)
- We recommend using the discrete vars in `.env` (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`).
- **Do NOT** set `DATABASE_URL` unless you URL-encode special characters in the password.
  - Example: `Test@123` → `Test%40123` (the `@` must be `%40`).
- If both are set, `DATABASE_URL` overrides the discrete vars.

Troubleshooting:
- Error like `could not translate host name "123@aws-..."` means your password has `@` unencoded inside `DATABASE_URL`.
  - Fix by either unsetting `DATABASE_URL` or encoding the password (`@` → `%40`).
