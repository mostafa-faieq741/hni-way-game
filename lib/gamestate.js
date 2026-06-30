/**
 * lib/gamestate.js — per-player save/resume + leaderboard storage selector.
 */
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
const adapter = useSupabase
  ? await import('./gamestateSupabase.js')
  : await import('./gamestateJson.js')

export const STORAGE_BACKEND = useSupabase ? 'supabase' : 'json'
export const { saveProgress, loadProgress, leaderboard, allPlayerStats } = adapter
