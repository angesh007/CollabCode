import { useEffect, useRef, useState } from 'react'
import { autocomplete } from '../api'

type Props = { code: string }

export default function AssistantPanel({ code }: Props){
  const [suggestion, setSuggestion] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(()=>{
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async ()=>{
      setLoading(true)
      try{
        const r = await autocomplete({ code, cursorPosition: code.length, language: 'python' })
        setSuggestion(r.suggestion || '')
      } catch{
        setSuggestion('')
      } finally { setLoading(false) }
    }, 600)
    return ()=>{ if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [code])

  return (
    <div className="card stack">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h3 style={{margin:0}}>🤖 AI Assistant</h3>
        {loading ? <span className="badge">suggesting…</span> : <span className="badge">ready</span> }
      </div>

      <div>
        <div style={{fontSize:12, color:'var(--muted)', marginBottom:6}}>Autocomplete Suggestion</div>
        <pre className="code">{suggestion || 'No suggestion yet…'}</pre>
      </div>
    </div>
  )
}
