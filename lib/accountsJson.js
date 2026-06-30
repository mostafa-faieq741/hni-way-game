/**
 * lib/accountsJson.js — local JSON adapter for player accounts (dev only).
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { hashPassword } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '..', 'api', 'data', 'accounts.json')

async function readAll() {
  try { return JSON.parse(await fs.readFile(DATA_FILE, 'utf-8')) }
  catch (e) { if (e.code === 'ENOENT') return []; throw e }
}
async function writeAll(list) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8')
}
const publicView = (a) => a && {
  player_id: a.player_id, username: a.username, display_name: a.display_name,
  email: a.email || null, role: a.role || 'player', status: a.status || 'active',
  created_at: a.created_at,
}

export async function createAccount({ username, password, displayName, email }) {
  const all = await readAll()
  const uname = String(username || '').trim().toLowerCase()
  if (!uname) return { errors: { username: 'Username is required.' } }
  if (!password || String(password).length < 4) return { errors: { password: 'Password must be at least 4 characters.' } }
  if (all.some((a) => a.username === uname)) return { errors: { username: 'Username already exists.' } }
  const now = new Date().toISOString()
  const account = {
    player_id: 'PLR-' + crypto.randomBytes(6).toString('hex'),
    username: uname, password_hash: hashPassword(password),
    display_name: String(displayName || username).trim(), email: email || null,
    role: 'player', status: 'active', created_at: now,
  }
  all.push(account)
  await writeAll(all)
  return { account: publicView(account) }
}

export async function getAccountByUsername(username) {
  const all = await readAll()
  return all.find((a) => a.username === String(username || '').trim().toLowerCase()) || null
}

export async function listAccounts() {
  return (await readAll()).map(publicView)
}

export async function deleteAccount(playerId) {
  const all = await readAll()
  const idx = all.findIndex((a) => a.player_id === playerId)
  if (idx === -1) return { notFound: true }
  const [removed] = all.splice(idx, 1)
  await writeAll(all)
  return { account: publicView(removed) }
}

export async function ensureLmsAccount({ playerId, displayName }) {
  const all = await readAll()
  const existing = all.find((a) => a.player_id === playerId)
  if (existing) {
    if (displayName && existing.display_name !== displayName) {
      existing.display_name = displayName; await writeAll(all)
    }
    return { account: publicView(existing) }
  }
  const account = {
    player_id: playerId, username: null, password_hash: null,
    display_name: String(displayName || 'Learner'), email: null,
    role: 'player', status: 'active', created_at: new Date().toISOString(),
  }
  all.push(account); await writeAll(all)
  return { account: publicView(account) }
}
