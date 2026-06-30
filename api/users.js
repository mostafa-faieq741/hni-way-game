/**
 * /api/users  (admin only — requires a valid admin bearer token)
 *   GET    -> list player accounts
 *   POST   -> create a player account { username, password, displayName, email }
 *   DELETE -> remove a player account ?playerId=...
 */
import { listAccounts, createAccount, deleteAccount } from '../lib/accounts.js'
import { tokenFromReq } from '../lib/auth.js'

export default async function handler(req, res) {
  const auth = tokenFromReq(req)
  if (!auth || auth.role !== 'admin') return res.status(401).json({ error: 'Admin authorization required.' })
  try {
    if (req.method === 'GET') {
      return res.status(200).json({ users: await listAccounts() })
    }
    if (req.method === 'POST') {
      const result = await createAccount(req.body || {})
      if (result.errors) return res.status(400).json({ errors: result.errors })
      return res.status(201).json({ user: result.account })
    }
    if (req.method === 'DELETE') {
      const result = await deleteAccount(req.query.playerId)
      if (result.notFound) return res.status(404).json({ error: 'User not found' })
      return res.status(200).json({ user: result.account })
    }
    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
