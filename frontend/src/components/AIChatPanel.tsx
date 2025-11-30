import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function askAI(payload: { prompt: string; code?: string; roomId?: string; username?: string }){
  const res = await fetch(`${API_URL}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('AI chat failed')
  return res.json() as Promise<{ reply: string; provider: string }>
}

type Props = { code: string; roomId: string; username: string }

export default function AIChatPanel({ code, roomId, username }: Props){
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState<{ role: 'user'|'ai'; text: string }[]>([])
  const [provider, setProvider] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function send(){
    if (!prompt.trim()) return
    const userText = prompt
    setHistory(h => [...h, { role: 'user', text: userText }])
    setPrompt('')
    setLoading(true)
    try{
      const r = await askAI({ prompt: userText, code, roomId, username })
      setHistory(h => [...h, { role: 'ai', text: r.reply }])
      setProvider(r.provider)
    } catch(e:any){
      setHistory(h => [...h, { role: 'ai', text: e?.message || 'Failed to ask AI' }])
    } finally {
      setLoading(false)
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>){
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send()
  }

  return (
    <div className="card stack">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{margin:0}}>🧠 Ask AI (chat)</h3>
        <span className="badge">{provider ? `provider: ${provider}` : 'idle'}</span>
      </div>
      <div style={{maxHeight:'28vh', overflowY:'auto', background:'#0a1026', border:'1px solid var(--border)', borderRadius:10, padding:10}}>
        {history.map((m, i)=>(
          <div key={i} style={{marginBottom:10}}>
            <span className="hl">{m.role === 'user' ? 'you' : 'ai'}:</span> {m.text}
          </div>
        ))}
      </div>
      <div>
        <div style={{fontSize:12, color:'var(--muted)', marginBottom:6}}>You can ask about the code or anything else. <em>Ctrl/⌘+Enter</em> to send.</div>
        <textarea className="input" rows={3} value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={onKey} placeholder="Ask the AI…" />
        <div className="row" style={{marginTop:8}}>
          <button className="btn" onClick={send} disabled={loading}>{loading ? 'Thinking…' : 'Send to AI'}</button>
        </div>
      </div>
    </div>
  )
}
