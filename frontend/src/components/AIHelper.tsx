import { useState } from 'react'
import { assist } from '../api'

type Props = { code: string }

export default function AIHelper({ code }: Props) {
  const [notes, setNotes] = useState('')
  const [question, setQuestion] = useState('How can I improve this code?')
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function ask() {
    setLoading(true)
    try {
      const r = await assist({ code, question, notes, language: 'python' })
      setAnswer(r.answer)
    } catch (e:any) {
      setAnswer('(Error) ' + (e?.message || 'Failed to get answer'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card stack">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:700}}>AI Helper</div>
        <span className="badge">OpenAI</span>
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes/context for the AI (optional)" className="textarea" style={{height:120}}/>
      <div style={{display:'flex', gap:8}}>
        <input value={question} onChange={e=>setQuestion(e.target.value)} className="textarea" style={{height:42}} placeholder="Ask a question…" />
        <button className="btn" onClick={ask} disabled={loading}>{loading ? 'Asking…' : 'Ask AI'}</button>
      </div>
      <div className="card" style={{background:'#0b1020'}}>
        <div style={{fontWeight:700, marginBottom:6}}>Answer</div>
        <div style={{whiteSpace:'pre-wrap'}}>{answer || '—'}</div>
      </div>
    </div>
  )
}
