/**
 * mockGameStateService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory mock for the Google Sheets "game_state" sheet.
 * Used in dev/mock mode only (VITE_DEV_MOCK_SCORM=true).
 *
 * Pre-seeded game states (keyed by player_id):
 *   returning-001  Q3  – early game   ($85k cash, rep 20)
 *   returning-002  Q10 – mid game     ($120k cash, rep 65)
 *   returning-003  Q18 – late game    ($180k cash, rep 110, leaderboard qualified)
 *
 * Players with no seeded state get a fresh game when startGame() is called.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {Map<string, object>} keyed by player_id */
const _states = new Map()

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEEDED_STATES = [
  {
    // Early game: Quarter 3 — cash tight, rep just starting to build
    player_id:                 'returning-001',
    current_screen:            'game',
    current_game_phase:        'game',
    current_quarter:           3,
    current_turn_step:         'open_sales_request',
    cash:                      85_000,
    reputation:                20,
    net_profit:                -15_000,
    total_revenue:             45_000,
    total_costs:               60_000,
    qualified_for_leaderboard: false,
    game_status:               'in_progress',
    updated_at:                '2026-04-15T14:30:00.000Z',
  },
  {
    // Mid game: Quarter 10 — profitable, halfway through
    player_id:                 'returning-002',
    current_screen:            'game',
    current_game_phase:        'game',
    current_quarter:           10,
    current_turn_step:         'hire_specialist',
    cash:                      120_000,
    reputation:                65,
    net_profit:                38_000,
    total_revenue:             200_000,
    total_costs:               162_000,
    qualified_for_leaderboard: false,
    game_status:               'in_progress',
    updated_at:                '2026-04-20T16:00:00.000Z',
  },
  {
    // Late game: Quarter 18 — strong position, leaderboard qualified (rep > 100)
    player_id:                 'returning-003',
    current_screen:            'game',
    current_game_phase:        'game',
    current_quarter:           18,
    current_turn_step:         'review_kpis',
    cash:                      180_000,
    reputation:                110,
    net_profit:                95_000,
    total_revenue:             480_000,
    total_costs:               385_000,
    qualified_for_leaderboard: true,
    game_status:               'in_progress',
    updated_at:                '2026-05-01T11:00:00.000Z',
  },
]

SEEDED_STATES.forEach((s) => _states.set(s.player_id, s))

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Load the saved game state for a player.
 * Returns null if no state exists (new game).
 *
 * @param {string} playerId
 * @returns {object|null}
 */
export function loadGameState(playerId) {
  return _states.get(playerId) ?? null
}

/**
 * Save (upsert) game state for a player.
 *
 * @param {string} playerId
 * @param {object} state
 */
export function saveGameState(playerId, state) {
  _states.set(playerId, {
    ...state,
    player_id:  playerId,
    updated_at: new Date().toISOString(),
  })
  console.info('[mockGameStateService] State saved for player:', playerId)
}
