import os, json, uuid
from datetime import datetime

from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from db import Base, get_db, init_db 

USE_OPENAI = False
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    if os.getenv("OPENAI_API_KEY"):
        USE_OPENAI = True
except Exception:
    USE_OPENAI = False

load_dotenv()

class Room(Base):
    __tablename__ = "rooms"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RoomCreateResponse(BaseModel):
    roomId: str

class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str = "python"

class AutocompleteResponse(BaseModel):
    suggestion: str

class ChatMessage(BaseModel):
    user: str
    text: str

class AIChatRequest(BaseModel):
    prompt: str
    code: str | None = None
    roomId: str | None = None
    username: str | None = None

class AIChatResponse(BaseModel):
    reply: str
    provider: str

app = FastAPI(title="CollabCode Minimal+AI")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _mock_suggestion(code: str) -> str:
    code = code.rstrip()
    if code.endswith("def "):
        return "function_name():\n    pass"
    if code.endswith("def"):
        return " function_name():\n    pass"
    if code.endswith(":"):
        return "\n    pass"
    return "\n# suggestion: print('Hello from AI')"

class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, list[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms.setdefault(room_id, []).append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        conns = self.rooms.get(room_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns and room_id in self.rooms:
            del self.rooms[room_id]

    def count(self, room_id: str) -> int:
        return len(self.rooms.get(room_id, []))

    async def broadcast(self, room_id: str, message: dict, sender: WebSocket | None = None, include_sender: bool = False):
        for ws in self.rooms.get(room_id, []):
            if not include_sender and sender is not None and ws is sender:
                continue
            await ws.send_json(message)

manager = ConnectionManager() 

@app.post("/rooms", response_model=RoomCreateResponse)
def create_room(db: Session = Depends(get_db)):
    room = Room()
    db.add(room)
    db.commit()
    db.refresh(room)
    return RoomCreateResponse(roomId=room.id)

@app.post("/autocomplete", response_model=AutocompleteResponse)
def autocomplete(payload: AutocompleteRequest):
    
    if USE_OPENAI:
        prompt =f"""You are a coding autocomplete assistant. Given the current code and cursor position, \
propose a SHORT single-line or small snippet that is the most likely next completion. \
Return ONLY the code to insert, no explanations.

Language: {payload.language}
Cursor Position: {payload.cursorPosition}
Code so far:
-----
{payload.code}
-----
"""
        try:
            # Use a small, inexpensive model if available
            resp = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You return only code suggestions without any commentary."},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "64")),
                temperature=0.2,
            )
            suggestion = resp.choices[0].message.content.strip()
            return AutocompleteResponse(suggestion=suggestion)
        except Exception:
            # Fallback to mock on any error
            return AutocompleteResponse(suggestion=_mock_suggestion(payload.code))
    else:
        return AutocompleteResponse(suggestion=_mock_suggestion(payload.code))

@app.post("/ai-chat", response_model=AIChatResponse)
async def ai_chat(payload: AIChatRequest): 
    """General AI chat to ask about the code or anything else.
    Uses OpenAI if configured, otherwise returns a simple mocked reply.
    """
    if USE_OPENAI:
        context = ""
        if payload.code:
            context = f"\n\n---\nCurrent code (optional):\n{payload.code}\n---\n"
        try:
            resp = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                messages=[
                    {"role": "system", "content": "You are a concise coding copilot and tutor."},
                    {"role": "user", "content": f"{payload.prompt}{context}"}
                ],
                max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "300")),
                temperature=0.2,
            )
            response_obj = AIChatResponse(reply=resp.choices[0].message.content.strip(), provider="openai")
        except Exception as e:
            response_obj = AIChatResponse(reply=f"(mock fallback) Error communicating with OpenAI: {str(e)[:120]}", provider="mock")
    else:
        
        base = "Here's a quick tip: try adding tests and printing intermediate values to debug."
        if payload.code:
            base += " I looked at your code and it seems fine at a glance."
        response_obj = AIChatResponse(reply=base, provider="mock")

    if payload.roomId:
        ai_message = {
            "type": "chat",
            "user": response_obj.provider,
            "text": response_obj.reply
        }
        
        await manager.broadcast(payload.roomId, ai_message, include_sender=True)

    return response_obj

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, db: Session = Depends(get_db)):
    room = db.get(Room, room_id)
    if not room:
        await websocket.close(code=4400)
        return

    await manager.connect(room_id, websocket)

    # Send current state and presence to this client
    await websocket.send_json({"type": "state", "code": room.code or "", "cursor": 0, "sender": "server"})
    await manager.broadcast(room_id, {"type": "presence", "count": manager.count(room_id)}, include_sender=True)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
            except json.JSONDecodeError:
                continue

            msg_type = parsed.get("type")
            if msg_type == "update":
                code = parsed.get("code", "")
                cursor = parsed.get("cursor", 0)
                
                # 1. Update DB (Persistence)
                room.code = code
                db.add(room)
                db.commit()
                
                # 2. Broadcast to Peers (Real-Time Sync)
                await manager.broadcast(room_id, {"type": "state", "code": code, "cursor": cursor, "sender": "peer"}, sender=websocket)
                
            elif msg_type == "chat":
                # Broadcast user chat messages
                user = parsed.get("user", "anon")
                text = parsed.get("text", "")
                await manager.broadcast(room_id, {"type": "chat", "user": user, "text": text}, include_sender=True)
                
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        await manager.broadcast(room_id, {"type": "presence", "count": manager.count(room_id)}, include_sender=True)
    except Exception:
        manager.disconnect(room_id, websocket)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
        await manager.broadcast(room_id, {"type": "presence", "count": manager.count(room_id)}, include_sender=True)

@app.on_event("startup")
async def on_startup():
    init_db()