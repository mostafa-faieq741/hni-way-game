/**
 * mockEventsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory mock for the Google Sheets "events_log" sheet.
 * Used in dev/mock mode only (VITE_DEV_MOCK_SCORM=true).
 *
 * All logged events are kept in a module-level array for the session.
 * Access them from the browser console in dev mode:
 *   import { getAllEvents } from './services/mockEventsService'
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {Array<object>} */
const _events = []
let _nextId = 1

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Log a player event.
 *
 * @param {string} playerId
 * @param {object} event   – action_type, action_payload, screen, quarter, etc.
 * @returns {object}       – the stored event entry with id and logged_at
 */
export function logEvent(playerId, event) {
  const entry = {
    id:        _nextId++,
    player_id: playerId,
    logged_at: new Date().toISOString(),
    ...event,
  }
  _events.push(entry)
  console.info('[mockEventsService] Event logged:', entry)
  return entry
}

/**
 * Get all events for a specific player (dev/debug helper).
 * @param {string} playerId
 * @returns {Array<object>}
 */
export function getEventsForPlayer(playerId) {
  return _events.filter((e) => e.player_id === playerId)
}

/**
 * Get the full in-memory event log (dev/debug helper).
 * @returns {Array<object>}
 */
export function getAllEvents() {
  return [..._events]
}
