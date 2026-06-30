/**
 * GET /api/stats  (admin only)
 * All player accounts with their latest game stats — powers the admin
 * Player Statistics dashboard.
 */
import { allPlayerStats } from '../lib/gamestate.js'
import { tokenFromReq } from '../lib/auth.js'

export default async function handler(req, res) {
  const auth = tokenFromReq(req)
  if (!auth || auth.role !== 'admin') return res.status(401).json({ error: 'Admin authorization required.' })
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    return res.status(200).json({ players: await allPlayerStats() })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
