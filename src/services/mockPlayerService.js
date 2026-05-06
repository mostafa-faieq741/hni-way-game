/**
 * mockPlayerService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * In-memory mock for the Google Sheets "players" sheet.
 * Used in dev/mock mode only (VITE_DEV_MOCK_SCORM=true).
 *
 * Pre-seeded players:
 *   returning-001  Alex Chen    – early game  (Q3)
 *   returning-002  Jordan Kim   – mid game    (Q10)
 *   returning-003  Sam Rivera   – late game   (Q18, leaderboard qualified)
 *
 * Any learnerId not in the seed set will be created fresh (new player).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** @type {Map<string, object>} keyed by talentlms_user_id (== learnerId) */
const _players = new Map()

// ── Seed data ────────────────────────────────────────────────────────────────

const SEEDED_PLAYERS = [
  {
    player_id:          'returning-001',
    talentlms_user_id:  'returning-001',
    talentlms_username: 'alex.chen',
    email:              'alex.chen@hni.com',
    display_name:       'Alex Chen',
    first_seen_at:      '2026-04-01T09:00:00.000Z',
    last_seen_at:       '2026-04-15T14:30:00.000Z',
    status:             'active',
  },
  {
    player_id:          'returning-002',
    talentlms_user_id:  'returning-002',
    talentlms_username: 'jordan.kim',
    email:              'jordan.kim@hni.com',
    display_name:       'Jordan Kim',
    first_seen_at:      '2026-04-02T10:00:00.000Z',
    last_seen_at:       '2026-04-20T16:00:00.000Z',
    status:             'active',
  },
  {
    player_id:          'returning-003',
    talentlms_user_id:  'returning-003',
    talentlms_username: 'sam.rivera',
    email:              'sam.rivera@hni.com',
    display_name:       'Sam Rivera',
    first_seen_at:      '2026-03-28T08:00:00.000Z',
    last_seen_at:       '2026-05-01T11:00:00.000Z',
    status:             'active',
  },
]

SEEDED_PLAYERS.forEach((p) => _players.set(p.talentlms_user_id, p))

// ── Public helpers ────────────────────────────────────────────────────────────

/**
 * Find a player by their learnerId (TalentLMS user ID).
 * @param {string} learnerId
 * @returns {object|null}
 */
export function findPlayerByLearnerId(learnerId) {
  return _players.get(learnerId) ?? null
}

/**
 * Create a new player record and store it in memory.
 * @param {{ learnerId: string, learnerName: string }} identity
 * @returns {object}
 */
export function createPlayer({ learnerId, learnerName }) {
  const now = new Date().toISOString()
  const player = {
    player_id:          learnerId,
    talentlms_user_id:  learnerId,
    talentlms_username: learnerName,
    email:              '',
    display_name:       learnerName,
    first_seen_at:      now,
    last_seen_at:       now,
    status:             'active',
  }
  _players.set(learnerId, player)
  console.info('[mockPlayerService] Player created:', player.display_name)
  return player
}

/**
 * Update last_seen_at for an existing player (simulates LMS check-in).
 * @param {string} learnerId
 */
export function touchPlayer(learnerId) {
  const player = _players.get(learnerId)
  if (player) {
    player.last_seen_at = new Date().toISOString()
  }
}
