/**
 * lib/gamestateSupabase.js — per-player save/resume + leaderboard on Supabase.
 * Uses the game_state table (state jsonb + denormalised columns) joined to players.
 */
let _client = null
async function client() {
  if (_client) return _client
  const { createClient } = await import('@supabase/supabase-js')
  _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
  return _client
}
const QUALIFY_REP = 100

export async function saveProgress(playerId, snapshot = {}) {
  if (!playerId) return { errors: { playerId: 'playerId required' } }
  const db = await client()
  const row = {
    player_id: playerId,
    state: snapshot,
    cash: snapshot.cash ?? 0,
    reputation: snapshot.reputation ?? 0,
    net_profit: snapshot.netProfit ?? 0,
    total_revenue: snapshot.totalRevenue ?? 0,
    overall_quarter: snapshot.overallQuarter ?? 1,
    game_status: snapshot.gameStatus ?? 'in_progress',
    qualified: (snapshot.reputation ?? 0) >= QUALIFY_REP,
    updated_at: new Date().toISOString(),
  }
  const { error } = await db.from('game_state').upsert(row, { onConflict: 'player_id' })
  if (error) throw new Error(error.message)
  return { ok: true }
}

export async function loadProgress(playerId) {
  const db = await client()
  const { data, error } = await db.from('game_state').select('state').eq('player_id', playerId).maybeSingle()
  if (error) throw new Error(error.message)
  return data?.state ?? null
}

export async function leaderboard() {
  const db = await client()
  const { data, error } = await db
    .from('game_state')
    .select('reputation, net_profit, total_revenue, players(display_name)')
    .eq('qualified', true)
    .order('net_profit', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  return (data || []).map((r) => ({
    display_name: r.players?.display_name || 'Player',
    reputation: r.reputation, net_profit: r.net_profit, total_revenue: r.total_revenue,
  }))
}
