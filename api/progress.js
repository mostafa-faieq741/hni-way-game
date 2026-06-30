/**
 * /api/progress  (requires a bearer token; player may only touch their own save)
 *   GET  ?playerId=...           -> load saved game (or null)
 *   POST { playerId, snapshot }  -> save game state
 */
import { saveProgress, loadProgress } from '../lib/gamestate.js'
import { tokenFromReq } from '../lib/auth.js'

function allowed(auth, playerId) {
  return auth && (auth.role === 'admin' || auth.sub === playerId)
}

export default async function handler(req, res) {
  const auth = tokenFromReq(req)
  try {
    if (req.method === 'GET') {
      const playerId = req.query.playerId
      if (!allowed(auth, playerId)) return res.status(401).json({ error: 'Not authorized for this player.' })
      return res.status(200).json({ state: await loadProgress(playerId) })
    }
    if (req.method === 'POST') {
      const { playerId, snapshot } = req.body || {}
      if (!allowed(auth, playerId)) return res.status(401).json({ error: 'Not authorized for this player.' })
      const result = await saveProgress(playerId, snapshot || {})
      if (result.errors) return res.status(400).json({ errors: result.errors })
      return res.status(200).json({ ok: true })
    }
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
