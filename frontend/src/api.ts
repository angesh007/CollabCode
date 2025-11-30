// frontend/src/api.ts
// 1) normalize the base so there's no trailing slash
const RAW = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const BASE_URL = RAW.replace(/\/+$/, '')

// 2) derive the ws base safely (only swap the leading scheme)
export const WS_BASE = BASE_URL.replace(/^http/, 'ws')

export async function createRoom(): Promise<{ roomId: string }> {
  const res = await fetch(`${BASE_URL}/rooms`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create room')
  return res.json()
}

export async function autocomplete(payload: { code: string; cursorPosition: number; language: string; notes?: string }) {
  const res = await fetch(`${BASE_URL}/autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to fetch suggestion')
  return res.json() as Promise<{ suggestion: string }>
}

// If your backend endpoint is /ai-chat (from my build), either:
//   1) change this to /ai-chat, OR
//   2) add @app.post("/assist") on the backend that calls the same handler.
export async function assist(payload: { code: string; question: string; notes?: string; language?: string }) {
  const res = await fetch(`${BASE_URL}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Failed to get answer')
  return res.json() as Promise<{ answer?: string; reply?: string; provider?: string }>
}
