/**
 * lib/accountsSupabase.js — player accounts on Supabase (players table).
 * Needs columns: username (unique), password_hash, role (added by auth-schema.sql).
 */
import crypto from 'node:crypto'
import { hashPassword } from './auth.js'

let _client = null
async function client() {
  if (_client) return _client
  const { createClient } = await import('@supabase/supabase-js')
  _client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  })
  return _client
}
const publicView = (a) => a && {
  player_id: a.player_id, username: a.username, display_name: a.display_name,
  email: a.email || null, role: a.role || 'player', status: a.status || 'active',
  created_at: a.first_seen_at,
}

export async function createAccount({ username, password, displayName, email }) {
  const uname = String(username || '').trim().toLowerCase()
  if (!uname) return { errors: { username: 'Username is required.' } }
  if (!password || String(password).length < 4) return { errors: { password: 'Password must be at least 4 characters.' } }
  const db = await client()
  const { data: existing } = await db.from('players').select('player_id').eq('username', uname).maybeSingle()
  if (existing) return { errors: { username: 'Username already exists.' } }
  const row = {
    player_id: 'PLR-' + crypto.randomBytes(6).toString('hex'),
    username: uname, password_hash: hashPassword(password),
    display_name: String(displayName || username).trim(), email: email || null,
    role: 'player', status: 'active',
  }
  const { data, error } = await db.from('players').insert(row).select().single()
  if (error) throw new Error(error.message)
  return { account: publicView(data) }
}

export async function getAccountByUsername(username) {
  const db = await client()
  const { data, error } = await db.from('players').select('*')
    .eq('username', String(username || '').trim().toLowerCase()).maybeSingle()
  if (error) throw new Error(error.message)
  return data || null
}

export async function listAccounts() {
  const db = await client()
  const { data, error } = await db.from('players').select('*')
    .eq('role', 'player').order('first_seen_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || []).map(publicView)
}

export async function deleteAccount(playerId) {
  const db = await client()
  const { data, error } = await db.from('players').delete().eq('player_id', playerId).select().maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return { notFound: true }
  return { account: publicView(data) }
}

export async function ensureLmsAccount({ playerId, displayName }) {
  const db = await client()
  const row = { player_id: playerId, display_name: String(displayName || 'Learner'), role: 'player', status: 'active' }
  const { data, error } = await db.from('players').upsert(row, { onConflict: 'player_id' }).select().single()
  if (error) throw new Error(error.message)
  return { account: publicView(data) }
}
