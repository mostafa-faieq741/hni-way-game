/**
 * GET /api/leaderboard
 * Players who passed 100 reputation, ranked by net profit (then reputation).
 */
import { leaderboard } from '../lib/gamestate.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    return res.status(200).json({ leaderboard: await leaderboard() })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
