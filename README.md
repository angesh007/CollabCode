# CollabCode
- Backend: `main.py`, `db.py` `.env`
- Frontend: React 

## Backend setup
```
cd backend
cp .env .env.local  # optional backup
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

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
