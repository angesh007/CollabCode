// frontend/src/api.ts
const RAW = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// remove trailing slashes
export const BASE_URL = RAW.replace(/\/+$/, '');
// swap only the leading scheme (http->ws, https->wss)
export const WS_BASE  = BASE_URL.replace(/^http/, 'ws');

export async function createRoom(): Promise<{ roomId: string }> {
  const res = await fetch(`${BASE_URL}/rooms`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json();
}

export async function autocomplete(payload: { code: string; cursorPosition: number; language: string; notes?: string }) {
  const res = await fetch(`${BASE_URL}/autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to fetch suggestion');
  return res.json() as Promise<{ suggestion: string }>;
}

// if your backend uses /ai-chat (my latest build), point here:
export async function assist(payload: { code: string; question: string; notes?: string; language?: string }) {
  const res = await fetch(`${BASE_URL}/ai-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to get answer');
  return res.json();
}
