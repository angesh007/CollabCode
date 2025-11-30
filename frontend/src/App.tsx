import { useState } from 'react'
import { createRoom } from './api'
import { useNavigate } from 'react-router-dom'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const navigate = useNavigate()
  const baseUrl = window.location.origin

  async function handleCreate() {
    setLoading(true); setError(null)
    try {
      const { roomId } = await createRoom()
      setRoomId(roomId)
    } catch (e: any) {
      setError(e?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  async function copyUrl() {
    if (!roomId) return
    const url = `${baseUrl}/room/${roomId}`
    try { await navigator.clipboard.writeText(url) } catch { /* noop */ }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="brand">CollabCode</div>
        <div className="badge">Minimal+AI</div>
      </div>

      <div className="card stack">
        <div>
          <h2>Create a room</h2>
          <p>Share the URL with a friend to collaborate in real-time.</p>
        </div>
        <div style={{display:'flex', gap:12}}>
          <button className="btn" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating…' : 'Create Room'}
          </button>
          {roomId && (
            <>
              <button className="btn secondary" onClick={() => navigate(`/room/${roomId}`)}>Go to Room</button>
              <button className="btn ghost" onClick={copyUrl}>Copy URL</button>
            </>
          )}
        </div>
        {roomId && (
          <code className="kbd">{`${baseUrl}/room/${roomId}`}</code>
        )}
        {error && <div style={{color:'#fca5a5'}}>{error}</div>}
      </div>
    </div>
  )
}
