/**
 * leaderboardHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure helpers for leaderboard qualification and ranking logic.
 * No side-effects; safe to use anywhere.
 *
 * Leaderboard rules:
 *   • A player qualifies only if reputation > 100.
 *   • Among qualified players, ranking is by highest net_profit (descending).
 *   • Players with reputation ≤ 100 are marked "Not Qualified" regardless of profit.
 *
 * These values come from the game_config sheet (win_reputation_threshold = 100).
 * TODO: load threshold dynamically from GET /api/game-config instead of hardcoding.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Threshold from game_config: win_reputation_threshold */
const WIN_REPUTATION_THRESHOLD = 100

/**
 * @typedef {object} LeaderboardStatus
 * @property {boolean} qualifiedForLeaderboard
 * @property {string}  qualificationReason
 */

/**
 * calculateLeaderboardStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Determine whether the player qualifies for final leaderboard ranking.
 *
 * @param {{ reputation: number, netProfit: number }} playerState
 * @returns {LeaderboardStatus}
 *
 * @example
 * calculateLeaderboardStatus({ reputation: 105, netProfit: 42000 })
 * // → { qualifiedForLeaderboard: true, qualificationReason: 'Reputation threshold met' }
 *
 * calculateLeaderboardStatus({ reputation: 80, netProfit: 99000 })
 * // → { qualifiedForLeaderboard: false, qualificationReason: 'Reputation below threshold (80 ≤ 100)' }
 */
export function calculateLeaderboardStatus(playerState) {
  const { reputation = 0 } = playerState

  if (reputation > WIN_REPUTATION_THRESHOLD) {
    return {
      qualifiedForLeaderboard: true,
      qualificationReason: 'Reputation threshold met',
    }
  }

  return {
    qualifiedForLeaderboard: false,
    qualificationReason: `Reputation below threshold (${reputation} ≤ ${WIN_REPUTATION_THRESHOLD})`,
  }
}

/**
 * rankLeaderboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Sort an array of player states into leaderboard order.
 * Qualified players (reputation > threshold) are ranked by net_profit descending.
 * Non-qualified players appear below qualified players, ordered by reputation desc.
 *
 * @param {Array<{ playerId: string, reputation: number, netProfit: number }>} players
 * @returns {Array<{ rank: number|null, playerId: string, reputation: number, netProfit: number, qualified: boolean }>}
 */
export function rankLeaderboard(players) {
  const qualified   = players.filter(p => p.reputation > WIN_REPUTATION_THRESHOLD)
  const notQualified = players.filter(p => p.reputation <= WIN_REPUTATION_THRESHOLD)

  // Sort qualified by netProfit descending
  qualified.sort((a, b) => b.netProfit - a.netProfit)

  // Sort non-qualified by reputation descending (secondary ordering)
  notQualified.sort((a, b) => b.reputation - a.reputation)

  return [
    ...qualified.map((p, i) => ({ rank: i + 1, ...p, qualified: true })),
    ...notQualified.map(p   => ({ rank: null,   ...p, qualified: false })),
  ]
}
