import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CodeEditor from '../components/CodeEditor'
import AssistantPanel from '../components/AssistantPanel'
import AIChatPanel from '../components/AIChatPanel'
import ChatPanel from '../components/ChatPanel'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [users, setUsers] = useState(1)
  const [latestChat, setLatestChat] = useState<{user:string;text:string}|undefined>(undefined)
  const code = useSelector((s: RootState) => s.editor.code)
  const [username, setUsername] = useState<string>(() => `user-${Math.floor(Math.random()*999)}`)

  useEffect(() => {
    if (!roomId) return
    const socket = new WebSocket(API_URL.replace('http', 'ws') + `/ws/${roomId}`)
    setWs(socket)
    socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'presence') setUsers(msg.count || 1)
        if (msg.type === 'chat') setLatestChat({ user: msg.user, text: msg.text })
      } catch {}
    }
    return () => { socket.close(); setWs(null) }
  }, [roomId])

  return (
    <div>
      <div className="header">
        <div><strong>Room:</strong> <span className="hl">{roomId}</span></div>
        <div className="row" style={{alignItems:'center', gap:12}}>
          <span className="badge">Users online: {users}</span>
          <input className="input" style={{width:200}} value={username} onChange={e=>setUsername(e.target.value)} placeholder="your name" />
        </div>
      </div>

      <div className="layout">
        <div className="stack">
          <div className="card">
            <h3 style={{marginTop:0}}>📝 Editor</h3>
            <CodeEditor ws={ws} roomId={roomId!} />
          </div>
        </div>
        <div className="stack">
          <AssistantPanel code={code} />
          <AIChatPanel code={code} roomId={roomId!} username={username} />
          <ChatPanel ws={ws} username={username} incoming={latestChat} />
        </div>
      </div>
    </div>
  )
}
