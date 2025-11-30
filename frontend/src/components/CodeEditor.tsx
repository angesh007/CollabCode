import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { setCode, setCursor, setSuggestion } from '../features/editor/editorSlice'
import { autocomplete } from '../api'

type Props = { ws?: WebSocket | null; roomId: string }

export default function CodeEditor({ ws }: Props) {
  const dispatch = useDispatch()
  const code = useSelector((s: RootState) => s.editor.code)
  const suggestion = useSelector((s: RootState) => s.editor.suggestion)
  const debounceRef = useRef<number | null>(null)
  const [notes, setNotes] = useState('')
  const [online, setOnline] = useState(1)

  useEffect(() => {
    if (!ws) return
    const onMessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'state') {
          dispatch(setCode(msg.code || ''))
          dispatch(setSuggestion(null))
        } else if (msg.type === 'presence') {
          setOnline(msg.count || 1)
        }
      } catch {}
    }
    ws.addEventListener('message', onMessage)
    return () => ws.removeEventListener('message', onMessage)
  }, [ws, dispatch])

  function broadcast(next: string, cursor: number) {
    if (!ws || ws.readyState !== ws.OPEN) return
    ws.send(JSON.stringify({ type: 'update', code: next, cursor }))
  }

  async function handleChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = ev.target.value
    const cursor = ev.target.selectionStart ?? 0
    dispatch(setCode(next))
    dispatch(setCursor(cursor))
    broadcast(next, cursor)

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const r = await autocomplete({ code: next, cursorPosition: cursor, language: 'python', notes })
        dispatch(setSuggestion(r.suggestion))
      } catch { dispatch(setSuggestion(null)) }
    }, 600)
  }

  return (
    <div className="grid">
      <div className="stack">
        <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>Editor</div>
          <div className="badge">Users online: {online}</div>
        </div>
        <textarea
          value={code}
          onChange={handleChange}
          placeholder="Type Python code here…"
          className="textarea"
        />
      </div>

      <div className="stack">
        <div className="card">
          <div style={{fontWeight:700, marginBottom:8}}>Autocomplete Suggestion</div>
          <pre style={{ whiteSpace: 'pre-wrap', background:'#0b1020', border:'1px solid #1f2937', borderRadius:8, padding:8, minHeight:120 }}>{suggestion || '—'}</pre>
        </div>

        <div className="card stack">
          <div style={{fontWeight:700}}>Notes for AI (optional)</div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="textarea" style={{height:120}} placeholder="E.g., goals, constraints, libraries, etc."/>
        </div>
      </div>
    </div>
  )
}
