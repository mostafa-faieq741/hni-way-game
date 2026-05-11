/**
 * leaderboard.js
 * Mock leaderboard rows for the prototype.
 * Future: fetched from a Google Sheets "leaderboard" tab.
 */

export const MOCK_LEADERBOARD = [
  { name: 'Hanan Nagi',     revenue: 1_420_000, netProfit: 510_000, reputation: 150 },
  { name: 'Eslam Semary',   revenue: 1_365_000, netProfit: 472_000, reputation: 145 },
  { name: 'Shady Wiliam',   revenue: 1_298_000, netProfit: 438_000, reputation: 120 },
  { name: 'Heba Abdallah',  revenue: 1_210_000, netProfit: 401_000, reputation: 111 },
  { name: 'Reem Hamdy',     revenue: 1_145_000, netProfit: 366_000, reputation: 108 },
]

/** Initials for the avatar circle, e.g. "HN". */
export function getInitials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
}

/**
 * Combine mock data with the current player's running stats and re-sort by netProfit.
 * Players with reputation > 100 are flagged qualified.
 */
export function getRankedLeaderboard(currentPlayer = null) {
  const rows = MOCK_LEADERBOARD.map((r) => ({ ...r, isCurrentPlayer: false }))
  if (currentPlayer && currentPlayer.name) {
    rows.push({ ...currentPlayer, isCurrentPlayer: true })
  }
  // Sort by netProfit desc; reputation > 100 just affects qualification, not order
  return rows
    .sort((a, b) => b.netProfit - a.netProfit)
    .map((row, idx) => ({ ...row, rank: idx + 1, qualified: row.reputation > 100 }))
}
