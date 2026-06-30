/**
 * authClient.js — frontend client for accounts, auth, save/resume and leaderboard.
 * Talks to the game backend (/api/*). Stores the signed-in session in localStorage.
 */
const STORE_KEY = 'hni_auth'
const BASE = '' // same origin; Vite proxies /api -> backend in dev

function readAuth() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null') } catch { return null }
}
function writeAuth(v) {
  try { v ? localStorage.setItem(STORE_KEY, JSON.stringify(v)) : localStorage.removeItem(STORE_KEY) } catch {}
}

export function getAccount() { return readAuth()?.account || null }
export function getToken()   { return readAuth()?.token || null }
export function isAdmin()    { return getAccount()?.role === 'admin' }
export function isSignedIn() { return !!getToken() }
export function signOut()    { writeAuth(null) }

async function req(path, { method = 'GET', body = null, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) { const t = getToken(); if (t) headers.authorization = 'Bearer ' + t }
  const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let data = null
  try { data = await res.json() } catch {}
  if (!res.ok) {
    const msg = data?.error || (data?.errors && Object.values(data.errors)[0]) || ('HTTP ' + res.status)
    const err = new Error(msg); err.status = res.status; err.errors = data?.errors; throw err
  }
  return data
}

/** Sign in. Returns the account; stores the session. */
export async function login(username, password) {
  const data = await req('/api/auth', { method: 'POST', body: { action: 'login', username, password } })
  writeAuth({ account: data.account, token: data.token })
  return data.account
}

/** LMS/SCORM launch: mint a session from the learner identity (no password). */
export async function lmsLogin(learnerId, learnerName) {
  const data = await req('/api/auth', { method: 'POST', body: { action: 'lms', learnerId, learnerName } })
  writeAuth({ account: data.account, token: data.token })
  return data.account
}

// ── Admin: player accounts ──────────────────────────────────────────────
export async function listUsers()              { return (await req('/api/users', { auth: true })).users }
export async function createUser(payload)       { return (await req('/api/users', { method: 'POST', auth: true, body: payload })).user }
export async function deleteUser(playerId)      { return req('/api/users?playerId=' + encodeURIComponent(playerId), { method: 'DELETE', auth: true }) }

// ── Per-player save / resume ────────────────────────────────────────────
export async function loadProgress(playerId) {
  try { return (await req('/api/progress?playerId=' + encodeURIComponent(playerId), { auth: true })).state }
  catch { return null }
}
export async function saveProgress(playerId, snapshot) {
  try { return await req('/api/progress', { method: 'POST', auth: true, body: { playerId, snapshot } }) }
  catch { return null }
}

// ── Admin stats ─────────────────────────────────────────────────────────
export async function fetchStats() { return (await req('/api/stats', { auth: true })).players }

// ── Leaderboard ─────────────────────────────────────────────────────────
export async function fetchLeaderboard() {
  try { return (await req('/api/leaderboard')).leaderboard || [] } catch { return [] }
}
