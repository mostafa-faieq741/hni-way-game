/**
 * lib/gamestateJson.js — local JSON adapter for saved games (dev only).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'api', 'data', 'gamestate.json')
const QUALIFY_REP = 100

async function readAll() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf-8')) }
  catch (e) { if (e.code === 'ENOENT') return {}; throw e }
}
async function writeAll(map) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(map, null, 2), 'utf-8')
}

export async function saveProgress(playerId, snapshot = {}) {
  if (!playerId) return { errors: { playerId: 'playerId required' } }
  const map = await readAll()
  map[playerId] = {
    player_id: playerId,
    state: snapshot,
    cash: snapshot.cash ?? 0,
    reputation: snapshot.reputation ?? 0,
    net_profit: snapshot.netProfit ?? 0,
    total_revenue: snapshot.totalRevenue ?? 0,
    overall_quarter: snapshot.overallQuarter ?? 1,
    game_status: snapshot.gameStatus ?? 'in_progress',
    qualified: (snapshot.reputation ?? 0) >= QUALIFY_REP,
    display_name: snapshot.playerName ?? map[playerId]?.display_name ?? 'Player',
    updated_at: new Date().toISOString(),
  }
  await writeAll(map)
  return { ok: true }
}

export async function loadProgress(playerId) {
  const map = await readAll()
  return map[playerId]?.state ?? null
}

export async function leaderboard() {
  const map = await readAll()
  return Object.values(map)
    .filter((r) => r.qualified)
    .sort((a, b) => (b.net_profit - a.net_profit) || (b.reputation - a.reputation))
    .map((r) => ({
      display_name: r.display_name, reputation: r.reputation,
      net_profit: r.net_profit, total_revenue: r.total_revenue,
    }))
}

const ACCOUNTS_FILE = path.join(__dirname, '..', 'api', 'data', 'accounts.json')
export async function allPlayerStats() {
  let accounts = []
  try { accounts = JSON.parse(await fs.readFile(ACCOUNTS_FILE, 'utf-8')) } catch {}
  const map = await readAll()
  return accounts
    .filter((a) => (a.role || 'player') === 'player')
    .map((a) => {
      const g = map[a.player_id]
      return {
        player_id: a.player_id, display_name: a.display_name,
        cash: g ? g.cash : null, reputation: g ? g.reputation : 0,
        net_profit: g ? g.net_profit : 0, total_revenue: g ? g.total_revenue : 0,
        game_status: g ? g.game_status : 'not_started', qualified: g ? !!g.qualified : false,
        played: !!g,
      }
    })
}
