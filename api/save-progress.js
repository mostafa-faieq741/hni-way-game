/**
 * /api/save-progress
 * ─────────────────────────────────────────────────────────────────────────────
 * POST handler – Persist the player's current game state to Google Sheets.
 * Called from the frontend after every meaningful player action.
 *
 * Request body:
 *   {
 *     playerId: string,
 *     gameState: {
 *       current_screen:     string,
 *       current_game_phase: string,
 *       current_quarter:    number,
 *       current_turn_step:  string,
 *       cash:               number,
 *       reputation:         number,
 *       net_profit:         number,
 *       total_revenue:      number,
 *       total_costs:        number,
 *       qualified_for_leaderboard: boolean,
 *       game_status:        string,
 *     }
 *   }
 *
 * Response:
 *   { success: boolean }
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { playerId, gameState } = req.body || {}

  if (!playerId || !gameState) {
    return res.status(400).json({ error: 'playerId and gameState are required' })
  }

  try {
    // ── MOCK IMPLEMENTATION ─────────────────────────────────────────────────
    // TODO: find existing game_state row for playerId and update it in-place.
    //       If no row exists, add a new row.
    //
    // Real implementation pattern:
    //   const jwt = new JWT({ ... })
    //   const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)
    //   await doc.loadInfo()
    //   const sheet = doc.sheetsByTitle['game_state']
    //   const rows  = await sheet.getRows()
    //   const row   = rows.find(r => r.get('player_id') === playerId)
    //   const now   = new Date().toISOString()
    //
    //   if (row) {
    //     Object.entries(gameState).forEach(([k, v]) => row.set(k, v))
    //     row.set('updated_at', now)
    //     await row.save()
    //   } else {
    //     await sheet.addRow({ player_id: playerId, ...gameState, updated_at: now })
    //   }
    //
    //   return res.status(200).json({ success: true })

    console.info('[/api/save-progress] Mock save for player:', playerId, gameState)
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[/api/save-progress] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
