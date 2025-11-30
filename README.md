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

## Backend and Frontend Setup (Local)

```bash
Backend Setup (Local)
cd backend
python -m venv .venv
source .venv/bin/activate     # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# create .env in backend
cat > .env <<'EOF'
DATABASE_URL=xxxxxxxx
OPENAI_API_KEY=sk-xxxxxx                
OPENAI_MODEL=gpt-4o-mini                # default model
CORS_ORIGINS=http://localhost:5173
EOF

## Frontend Setup (Local)
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev

# run locally
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

## How to Use

- **Create a Room** → Generates a unique room ID  
- **Share the URL** (e.g. `/room/:roomId`) with another user  
- **Collaborate Live** → Both users can edit the same code in real-time  
- **Use the AI Assistant** for autocompletion or coding questions  
- **Chat in Real-Time** using the chat panel on the right  

-Chat in real-time on the right panel
