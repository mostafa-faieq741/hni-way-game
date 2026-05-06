/**
 * gameStateService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory game state management for the frontend.
 * This service:
 *   • Holds the authoritative in-memory copy of game state during a session.
 *   • Provides helpers to read and mutate state.
 *   • Calls apiClient.saveProgress() to persist changes to the backend
 *     (which writes to Google Sheets).
 *
 * When real backend integration is enabled, the mock functions below will be
 * replaced by apiClient calls. The interface intentionally mirrors the
 * mock functions so swapping them is mechanical.
 *
 * Google Sheets data model (reference):
 * ─────────────────────────────────────
 * Sheet: game_state
 *   player_id, current_screen, current_game_phase, current_quarter,
 *   current_turn_step, cash, reputation, net_profit, total_revenue,
 *   total_costs, qualified_for_leaderboard, game_status, updated_at
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { saveProgress as apiSaveProgress, logEvent as apiLogEvent } from './apiClient.js'
import { calculateLeaderboardStatus } from './leaderboardHelper.js'

// ─────────────────────────────────────────────────────────────────────────────
// Default / initial game state shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} GameState
 * @property {string}  playerId
 * @property {string}  currentScreen
 * @property {string}  currentGamePhase
 * @property {number}  currentQuarter
 * @property {string}  currentTurnStep
 * @property {number}  cash
 * @property {number}  reputation
 * @property {number}  netProfit
 * @property {number}  totalRevenue
 * @property {number}  totalCosts
 * @property {boolean} qualifiedForLeaderboard
 * @property {string}  gameStatus
 * @property {string|null} updatedAt
 */

/** @returns {GameState} */
export function createInitialGameState(playerId) {
  return {
    playerId,
    currentScreen:            'player_setup',
    currentGamePhase:         'game',
    currentQuarter:           1,
    currentTurnStep:          'open_sales_request',
    cash:                     100_000,
    reputation:               0,
    netProfit:                0,
    totalRevenue:             0,
    totalCosts:               0,
    qualifiedForLeaderboard:  false,
    gameStatus:               'in_progress',
    updatedAt:                null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory session state
// ─────────────────────────────────────────────────────────────────────────────

/** @type {GameState | null} */
let _state = null

/** @type {string | null} */
let _playerId = null

/**
 * Initialise the service with state loaded from the backend (or a fresh state).
 * Call this once, after startGame() resolves.
 *
 * @param {GameState} state
 */
export function initGameState(state) {
  _state = { ...state }
  _playerId = state.playerId
}

/**
 * Return a shallow copy of the current game state.
 * @returns {GameState}
 */
export function getGameState() {
  if (!_state) throw new Error('[gameStateService] State not initialised. Call initGameState() first.')
  return { ..._state }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply a partial update to in-memory state and recalculate leaderboard status.
 * @param {Partial<GameState>} patch
 */
export function patchGameState(patch) {
  if (!_state) throw new Error('[gameStateService] State not initialised.')
  _state = { ..._state, ...patch, updatedAt: new Date().toISOString() }
  _state.qualifiedForLeaderboard = calculateLeaderboardStatus(_state).qualifiedForLeaderboard
}

/**
 * saveProgress
 * ─────────────────────────────────────────────────────────────────────────────
 * Persist the current in-memory state to the backend.
 * Should be called after every meaningful player action.
 *
 * TODO: Replace apiSaveProgress with real Google Sheets write via the backend.
 *
 * @returns {Promise<void>}
 */
export async function saveProgress() {
  if (!_state || !_playerId) {
    console.warn('[gameStateService] saveProgress called before state init – skipping.')
    return
  }
  try {
    // TODO: real call → await apiSaveProgress(_playerId, _state)
    // Mock: just log for now
    console.info('[gameStateService] saveProgress (mock):', _state)
  } catch (err) {
    console.error('[gameStateService] saveProgress failed:', err)
    // Non-fatal: local state is still intact
  }
}

/**
 * logPlayerEvent
 * ─────────────────────────────────────────────────────────────────────────────
 * Record an auditable player action to the backend events_log sheet.
 *
 * @param {string} actionType   – e.g. 'accepted_sales_request', 'hired_specialist'
 * @param {object} [payload={}] – extra data about the action
 * @returns {Promise<void>}
 */
export async function logPlayerEvent(actionType, payload = {}) {
  if (!_state || !_playerId) return
  const event = {
    action_type:        actionType,
    action_payload:     JSON.stringify(payload),
    screen:             _state.currentScreen,
    quarter:            _state.currentQuarter,
    turn_step:          _state.currentTurnStep,
    cash_after:         _state.cash,
    reputation_after:   _state.reputation,
    net_profit_after:   _state.netProfit,
  }
  try {
    // TODO: real call → await apiLogEvent(_playerId, event)
    console.info('[gameStateService] logPlayerEvent (mock):', event)
  } catch (err) {
    console.error('[gameStateService] logPlayerEvent failed:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock service stubs (used until real backend integration is wired up)
// These function names match the spec in the integration requirements doc.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * findPlayerByLearnerId – look up a player row in the Google Sheets players sheet.
 * TODO: replace with real Sheets API call via backend route.
 *
 * @param {string} learnerId
 * @returns {Promise<object|null>}
 */
export async function findPlayerByLearnerId(learnerId) {
  // TODO: call GET /api/load-progress?playerId=... and return the player row
  console.info('[mock] findPlayerByLearnerId:', learnerId)
  return null
}

/**
 * createPlayer – write a new row to the players sheet.
 * TODO: replace with real Sheets API call via backend route (POST /api/start-game).
 *
 * @param {{ learnerId: string, learnerName: string }} identity
 * @returns {Promise<object>}
 */
export async function createPlayer({ learnerId, learnerName }) {
  // TODO: POST /api/start-game → backend creates row and returns player record
  console.info('[mock] createPlayer:', { learnerId, learnerName })
  return {
    player_id:           learnerId,
    talentlms_user_id:   learnerId,
    talentlms_username:  learnerName,
    email:               '',
    display_name:        learnerName,
    first_seen_at:       new Date().toISOString(),
    last_seen_at:        new Date().toISOString(),
    status:              'active',
  }
}

/**
 * loadGameState – read the latest game_state row for a player.
 * TODO: replace with real Sheets API call via backend.
 *
 * @param {string} playerId
 * @returns {Promise<GameState|null>}
 */
export async function loadGameState(playerId) {
  // TODO: call GET /api/load-progress?playerId=... and return game_state row
  console.info('[mock] loadGameState:', playerId)
  return null // null → new game
}
