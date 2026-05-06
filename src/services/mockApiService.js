/**
 * mockApiService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in mock for apiClient.js in dev mode (VITE_DEV_MOCK_SCORM=true).
 *
 * Implements the same public interface as apiClient.js — every function has
 * the identical name and signature — but routes through in-memory services
 * instead of real HTTP calls to Vercel serverless functions.
 *
 * This file deliberately avoids importing from gameStateService.js to prevent
 * a circular dependency (apiClient ↔ gameStateService ↔ apiClient).
 * The initial game state shape is defined locally here.
 *
 * Simulated latency: 600 ms for startGame/loadProgress, 200 ms for saves,
 *                    100 ms for event logging.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  findPlayerByLearnerId,
  createPlayer,
  touchPlayer,
} from './mockPlayerService.js'

import {
  loadGameState,
  saveGameState,
} from './mockGameStateService.js'

import { logEvent as mockLogEvent } from './mockEventsService.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/**
 * Build a fresh (snake_case) game state object for a brand-new player.
 * Mirrors the schema of the Google Sheets game_state tab.
 *
 * @param {string} playerId
 * @returns {object}
 */
function buildInitialGameState(playerId) {
  return {
    player_id:                 playerId,
    current_screen:            'player_setup',
    current_game_phase:        'game',
    current_quarter:           1,
    current_turn_step:         'open_sales_request',
    cash:                      100_000,
    reputation:                0,
    net_profit:                0,
    total_revenue:             0,
    total_costs:               0,
    qualified_for_leaderboard: false,
    game_status:               'in_progress',
    updated_at:                new Date().toISOString(),
  }
}

// ── Public API (mirrors apiClient.js exactly) ─────────────────────────────────

/**
 * Identify the player and return their game state (new or resumed).
 * Mirrors: POST /api/start-game
 *
 * @param {{ learnerId: string, learnerName: string }} identity
 * @returns {Promise<{ player: object, gameState: object, isNewPlayer: boolean }>}
 */
export async function startGame(identity) {
  await delay(600)

  const { learnerId, learnerName } = identity

  // Find existing player or create a new one
  let player = findPlayerByLearnerId(learnerId)
  let isNewPlayer = false

  if (!player) {
    player = createPlayer({ learnerId, learnerName })
    isNewPlayer = true
    console.info('[mockApi] startGame → new player:', player.display_name)
  } else {
    touchPlayer(learnerId)
    console.info('[mockApi] startGame → returning player:', player.display_name)
  }

  // Load existing game state or create a fresh one
  let gameState = loadGameState(player.player_id)

  if (!gameState) {
    gameState = buildInitialGameState(player.player_id)
    saveGameState(player.player_id, gameState)
    // Only mark as new if we also had no player (avoids edge case where player
    // exists but state was manually cleared)
    isNewPlayer = true
  }

  return { player, gameState, isNewPlayer }
}

/**
 * Load the latest saved game state for a player.
 * Mirrors: GET /api/load-progress
 *
 * @param {string} playerId
 * @returns {Promise<{ gameState: object|null }>}
 */
export async function loadProgress(playerId) {
  await delay(600)
  const gameState = loadGameState(playerId)
  return { gameState }
}

/**
 * Persist the player's current game state.
 * Mirrors: POST /api/save-progress
 *
 * @param {string} playerId
 * @param {object} gameState
 * @returns {Promise<{ success: boolean }>}
 */
export async function saveProgress(playerId, gameState) {
  await delay(200)
  saveGameState(playerId, gameState)
  return { success: true }
}

/**
 * Log an auditable player action.
 * Mirrors: POST /api/log-event
 *
 * @param {string} playerId
 * @param {object} event
 * @returns {Promise<{ success: boolean }>}
 */
export async function logEvent(playerId, event) {
  await delay(100)
  mockLogEvent(playerId, event)
  return { success: true }
}
