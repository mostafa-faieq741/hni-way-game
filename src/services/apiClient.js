/**
 * apiClient.js
 * Thin client for the game backend API.
 *
 * IS_MOCK_MODE is hardcoded to true for the current prototype.
 * All calls route through mockApiService.js (in-memory, no network).
 *
 * TODO: When real backend is connected:
 *   1. Set IS_MOCK_MODE = false (or gate on VITE_USE_REAL_API env var).
 *   2. Ensure Vercel serverless functions exist at:
 *      POST /api/start-game
 *      GET  /api/load-progress
 *      POST /api/save-progress
 *      POST /api/log-event
 *   3. Connect Google Sheets credentials in Vercel env vars.
 */

import * as MockApi from './mockApiService.js'

// TODO: Set to false and use env var when real backend is connected.
// const IS_MOCK_MODE = import.meta.env.VITE_USE_REAL_API !== 'true'
const IS_MOCK_MODE = true

const BASE_URL = ''

async function request(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  let body
  try {
    body = await res.json()
  } catch {
    body = null
  }

  if (!res.ok) {
    const message = body?.error || body?.message || `HTTP ${res.status}`
    throw new Error(message)
  }

  return body
}

export function startGame(identity) {
  if (IS_MOCK_MODE) return MockApi.startGame(identity)
  return request('/api/start-game', {
    method: 'POST',
    body: JSON.stringify(identity),
  })
}

export function loadProgress(playerId) {
  if (IS_MOCK_MODE) return MockApi.loadProgress(playerId)
  return request(`/api/load-progress?playerId=${encodeURIComponent(playerId)}`)
}

export function saveProgress(playerId, gameState) {
  if (IS_MOCK_MODE) return MockApi.saveProgress(playerId, gameState)
  return request('/api/save-progress', {
    method: 'POST',
    body: JSON.stringify({ playerId, gameState }),
  })
}

export function logEvent(playerId, event) {
  if (IS_MOCK_MODE) return MockApi.logEvent(playerId, event)
  return request('/api/log-event', {
    method: 'POST',
    body: JSON.stringify({ playerId, event }),
  })
}
