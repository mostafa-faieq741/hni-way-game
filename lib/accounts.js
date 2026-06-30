/**
 * lib/accounts.js — player-account storage selector (Supabase or local JSON).
 */
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY)
const adapter = useSupabase
  ? await import('./accountsSupabase.js')
  : await import('./accountsJson.js')

export const STORAGE_BACKEND = useSupabase ? 'supabase' : 'json'
export const { createAccount, getAccountByUsername, listAccounts, deleteAccount, ensureLmsAccount } = adapter
