/**
 * POST /api/auth  { action: 'login', username, password }
 * Admin logs in against env creds (ADMIN_USERNAME / ADMIN_PASSWORD, default admin/admin).
 * Players log in against their stored account (hashed password).
 * Returns { account, token }.
 */
import { getAccountByUsername, ensureLmsAccount } from '../lib/accounts.js'
import { verifyPassword, signToken } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const { action = 'login', username, password } = req.body || {}

    // LMS/SCORM launch: trust the learner identity from the wrapper and mint a
    // session (no password). NOTE: harden with a signed LTI/launch check before
    // using with a real LMS in production.
    if (action === 'lms') {
      const learnerId = String(req.body.learnerId || '').trim()
      const learnerName = String(req.body.learnerName || 'Learner').trim()
      if (!learnerId) return res.status(400).json({ error: 'learnerId is required.' })
      const playerId = 'lms-' + learnerId
      await ensureLmsAccount({ playerId, displayName: learnerName })
      const account = { player_id: playerId, display_name: learnerName, role: 'player', lms: true }
      return res.status(200).json({ account, token: signToken({ sub: playerId, role: 'player' }) })
    }

    if (action !== 'login') return res.status(400).json({ error: 'Unknown action' })
    const uname = String(username || '').trim().toLowerCase()
    if (!uname || !password) return res.status(400).json({ error: 'Username and password are required.' })

    const adminUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase()
    const adminPass = process.env.ADMIN_PASSWORD || 'admin'
    if (uname === adminUser && String(password) === adminPass) {
      const account = { player_id: 'admin', username: adminUser, display_name: 'Admin', role: 'admin' }
      return res.status(200).json({ account, token: signToken({ sub: 'admin', role: 'admin' }) })
    }

    const acc = await getAccountByUsername(uname)
    if (!acc || !verifyPassword(password, acc.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password.' })
    }
    if (acc.status && acc.status !== 'active') return res.status(403).json({ error: 'Account is disabled.' })
    const account = {
      player_id: acc.player_id, username: acc.username,
      display_name: acc.display_name, email: acc.email || null, role: acc.role || 'player',
    }
    return res.status(200).json({ account, token: signToken({ sub: acc.player_id, role: account.role }) })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
