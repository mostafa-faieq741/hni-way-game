/**
 * /api/load-progress
 * ─────────────────────────────────────────────────────────────────────────────
 * GET handler – Load the latest saved game state for a player.
 *
 * Query params:
 *   playerId (string, required)
 *
 * Response:
 *   { gameState: object | null }
 *   gameState is null if no saved state exists (new player).
 *
 * Environment variables required:
 *   GOOGLE_SHEET_ID
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   GOOGLE_PRIVATE_KEY
 * ─────────────────────────────────────────────────────────────────────────────
 */

// TODO: import { GoogleSpreadsheet } from 'google-spreadsheet'
// TODO: import { JWT } from 'google-auth-library'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { playerId } = req.query

  if (!playerId) {
    return res.status(400).json({ error: 'playerId query param is required' })
  }

  try {
    // ── MOCK IMPLEMENTATION ─────────────────────────────────────────────────
    // TODO: query the "game_state" sheet in Google Sheets for a row where
    //       player_id === playerId. Return that row as gameState, or null
    //       if no row exists.
    //
    // Real implementation pattern:
    //   const jwt = new JWT({ ... })
    //   const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)
    //   await doc.loadInfo()
    //   const sheet = doc.sheetsByTitle['game_state']
    //   const rows  = await sheet.getRows()
    //   const row   = rows.find(r => r.get('player_id') === playerId)
    //   const gameState = row ? mapRowToGameState(row) : null
    //   return res.status(200).json({ gameState })

    // Mock: return null (no saved state) for any player
    return res.status(200).json({ gameState: null })
  } catch (err) {
    console.error('[/api/load-progress] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
