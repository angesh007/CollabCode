# CollabCode — Real-time Pair Programming App

**Live Demo:**  
 [https://collabcode-web-410477008137.asia-south1.run.app/](https://collabcode-web-410477008137.asia-south1.run.app/)

---

##  Overview
**CollabCode** is a real-time collaborative code editor with:
- Shared live coding (via WebSockets)
- AI assistant with OpenAI integration
- Live room chat + user presence tracking
- Modern dark UI built with React + Tailwind + FastAPI backend

---

## Tech Stack
**Frontend**
- React + TypeScript + Vite  
- Redux Toolkit for global state  
- WebSocket for real-time sync  

**Backend**
- Python FastAPI  
- WebSocket endpoint for collaboration  
- PostgreSQL (Supabase-hosted) for room persistence  
- OpenAI API for AI assistant (via `.env` key)

---

## Backend Setup (Local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate     # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# create .env
cat > .env <<'EOF'
DATABASE_URL=xxxxxxxx
OPENAI_API_KEY=sk-xxxxxx                
OPENAI_MODEL=gpt-4o-mini                # default model
CORS_ORIGINS=http://localhost:5173
EOF

# run locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000
