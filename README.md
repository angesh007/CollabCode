# CollabCode (Minimal)
- Backend: **2 files** (`main.py`, `db.py`) + `.env`
- Frontend: React + TypeScript + Redux Toolkit

## Backend setup
```
cd backend
cp .env .env.local  # optional backup
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database (Supabase pooled)
Use the prefilled `.env` (DB_* vars). Do **NOT** set `DATABASE_URL` unless you URL-encode your password:
- `Test@123` → `Test%40123`
If both are set, `DATABASE_URL` wins.

## Frontend setup
```
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

## Usage
- Open `http://localhost:5173` → click "Create Room"
- Share `/room/:roomId` with another tab/window → edit together
- Stop typing for ~600ms → mocked autocomplete suggestion appears
