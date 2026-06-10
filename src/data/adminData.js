/**
 * adminData.js
 * Data layer for the Admin dashboard (prototype).
 * Combines the player's real game result (read from localStorage) with a set
 * of sample/mock players so the dashboard is never empty. No backend yet.
 */

import { MOCK_LEADERBOARD, getInitials } from './leaderboard.js'
import { GAME_CONFIG } from './gameConfig.js'

const DEMO_SAVE_KEY = 'hni_demo_game_state'
const TOTAL_QUARTERS = GAME_CONFIG.totalQuarters
const QUALIFY = GAME_CONFIG.winReputationThreshold

// Sample players (from the existing mock leaderboard), enriched for the dashboard.
const MOCK_PLAYERS = MOCK_LEADERBOARD.map((p, i) => ({
  id: 'sample-' + (i + 1),
  name: p.name,
  revenue: p.revenue,
  netProfit: p.netProfit,
  reputation: p.reputation,
  cash: GAME_CONFIG.startingCash + Math.round(p.netProfit * 0.4),
  quarter: TOTAL_QUARTERS,
  status: 'Completed',
  source: 'sample',
}))

// Read the live demo game from localStorage and turn it into one player record.
function readLivePlayer() {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(DEMO_SAVE_KEY)
    if (!raw) return null
    const gs = JSON.parse(raw)
    const quarter = gs.overallQuarter || 1
    return {
      id: gs.playerId || 'demo-001',
      name: gs.playerName || 'Demo Learner',
      revenue: gs.totalRevenue || 0,
      netProfit: gs.netProfit || 0,
      reputation: gs.reputation || 0,
      cash: gs.cash != null ? gs.cash : GAME_CONFIG.startingCash,
      quarter,
      status: quarter >= TOTAL_QUARTERS ? 'Completed' : 'In progress',
      source: 'live',
    }
  } catch {
    return null
  }
}

export function getAllPlayers() {
  const live = readLivePlayer()
  const players = MOCK_PLAYERS.slice()
  if (live) players.unshift(live)
  return players
}

export function getKpis(players) {
  const n = players.length
  const avgNet = n ? Math.round(players.reduce((s, p) => s + p.netProfit, 0) / n) : 0
  const completed = players.filter((p) => p.status === 'Completed').length
  const completionRate = n ? Math.round((completed / n) * 100) : 0
  const qualified = players.filter((p) => p.reputation > QUALIFY).length
  return { total: n, avgNet, completionRate, qualified }
}

export function rankByNetProfit(players) {
  return players
    .slice()
    .sort((a, b) => b.netProfit - a.netProfit)
    .map((p, i) => ({ ...p, rank: i + 1, qualified: p.reputation > QUALIFY }))
}

export { getInitials, QUALIFY }
