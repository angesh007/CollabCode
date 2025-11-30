import { useEffect, useRef, useState } from 'react'

type Chat = { user: string; text: string }

type Props = {
  ws: WebSocket | null
  username: string
  incoming?: Chat
}

export default function ChatPanel({ ws, username, incoming }: Props){
  const [text, setText] = useState('')
  const [messages, setMessages] = useState<Chat[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{
    if (incoming){
      setMessages(prev => [...prev, incoming])
    }
  }, [incoming])

  useEffect(()=>{
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(){
    if (!ws || ws.readyState !== ws.OPEN || !text.trim()) return
    ws.send(JSON.stringify({ type: 'chat', user: username || 'anon', text }))
    setText('')
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>){
    if (e.key === 'Enter') send()
  }

  return (
    <div className="card stack">
      <h3 style={{margin:0}}>💬 Room Chat</h3>
      <div style={{maxHeight:'30vh', overflowY:'auto', border:'1px solid var(--border)', borderRadius:10, padding:8, background:'#0a1026'}}>
        {messages.map((m, i)=>(
          <div key={i} style={{marginBottom:6}}>
            <span className="hl">{m.user}:</span> {m.text}
          </div>
        ))}
        <div ref={endRef}></div>
      </div>
      <div className="row">
        <input className="input" placeholder="Type a message…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={onKey}/>
        <button className="btn secondary" onClick={send}>Send</button>
      </div>
    </div>
  )
}
