/**
 * apiClient.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin HTTP client for communicating with the game's backend API routes.
 * All sensitive work (Google Sheets, TalentLMS API) happens server-side.
 * The frontend only sends/receives plain JSON through these routes.
 *
 * Backend routes (Vercel serverless functions):
 *   POST  /api/start-game      – identify player, load or create game state
 *   GET   /api/load-progress   – load latest saved state for a player
 *   POST  /api/save-progress   – persist current game state
 *   POST  /api/log-event       – record an auditable player action
 *
 * Dev mode (VITE_DEV_MOCK_SCORM=true):
 *   All calls are routed through mockApiService.js (in-memory, no network).
 *   This lets the entire player-setup and game flow work without a backend.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as MockApi from './mockApiService.js'

/**
 * True when running in dev/mock mode.
 * Controlled by VITE_DEV_MOCK_SCORM in .env.development.
 */
const IS_MOCK_MODE = import.meta.env.VITE_DEV_MOCK_SCORM === 'true'

const BASE_URL = '' // same origin; works for Vercel, Netlify, local dev proxy

/**
 * Internal fetch wrapper with JSON handling and error normalisation.
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
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

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identify the player and return their game state (new or resumed).
 *
 * @param {{ learnerId: string, learnerName: string }} identity
 * @returns {Promise<{ player: object, gameState: object, isNewPlayer: boolean }>}
 */
export function startGame(identity) {
  if (IS_MOCK_MODE) return MockApi.startGame(identity)
  return request('/api/start-game', {
    method: 'POST',
    body: JSON.stringify(identity),
  })
}

/**
 * Load the latest saved game state for a player.
 *
 * @param {string} playerId
 * @returns {Promise<{ gameState: object | null }>}
 */
export function loadProgress(playerId) {
  if (IS_MOCK_MODE) return MockApi.loadProgress(playerId)
  return request(`/api/load-progress?playerId=${encodeURIComponent(playerId)}`)
}

/**
 * Persist the player's current game state.
 *
 * @param {string} playerId
 * @param {object} gameState  – current_screen, current_quarter, cash, etc.
 * @returns {Promise<{ success: boolean }>}
 */
export function saveProgress(playerId, gameState) {
  if (IS_MOCK_MODE) return MockApi.saveProgress(playerId, gameState)
  return request('/api/save-progress', {
    method: 'POST',
    body: JSON.stringify({ playerId, gameState }),
  })
}

/**
 * Log an auditable player action.
 *
 * @param {string} playerId
 * @param {object} event  – action_type, action_payload, screen, quarter, etc.
 * @returns {Promise<{ success: boolean }>}
 */
export function logEvent(playerId, event) {
  if (IS_MOCK_MODE) return MockApi.logEvent(playerId, event)
  return request('/api/log-event', {
    method: 'POST',
    body: JSON.stringify({ playerId, event }),
  })
}
