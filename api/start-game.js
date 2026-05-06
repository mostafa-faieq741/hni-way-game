/**
 * /api/start-game
 * ─────────────────────────────────────────────────────────────────────────────
 * POST handler – Identify the player, load existing progress, or create a new
 * game state. All Google Sheets and TalentLMS calls happen here (server-side).
 *
 * Request body:
 *   { learnerId: string, learnerName: string }
 *
 * Response:
 *   { player: object, gameState: object, isNewPlayer: boolean }
 *
 * Environment variables required (set in Vercel / Netlify dashboard):
 *   GOOGLE_SHEET_ID             – ID of the Google Sheet (from the URL)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL – Service account email with Sheets access
 *   GOOGLE_PRIVATE_KEY          – Service account private key (newlines as \n)
 *   TALENTLMS_DOMAIN            – e.g. yourcompany.talentlms.com
 *   TALENTLMS_API_KEY           – TalentLMS REST API key
 *
 * Google Sheet data model:
 *   Sheet "players":    player_id, talentlms_user_id, talentlms_username,
 *                       email, display_name, first_seen_at, last_seen_at, status
 *   Sheet "game_state": player_id, current_screen, current_game_phase,
 *                       current_quarter, current_turn_step, cash, reputation,
 *                       net_profit, total_revenue, total_costs,
 *                       qualified_for_leaderboard, game_status, updated_at
 * ─────────────────────────────────────────────────────────────────────────────
 */

// TODO: import google-auth-library and googleapis when ready
// import { GoogleSpreadsheet } from 'google-spreadsheet'
// import { JWT } from 'google-auth-library'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { learnerId, learnerName } = req.body || {}

  if (!learnerId) {
    return res.status(400).json({ error: 'learnerId is required' })
  }

  try {
    // ── MOCK IMPLEMENTATION ─────────────────────────────────────────────────
    // TODO: replace with real Google Sheets calls using the pattern below.
    //
    // Real implementation pattern:
    //   1. Authenticate with Google Sheets API using service account:
    //      const jwt = new JWT({ email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    //                            key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    //                            scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
    //      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)
    //      await doc.loadInfo()
    //
    //   2. findPlayerByLearnerId(learnerId) – search players sheet
    //   3. If not found: createPlayer({ learnerId, learnerName })
    //   4. loadGameState(playerId) – search game_state sheet
    //   5. If not found: createInitialGameState(playerId) and write to sheet
    //   6. Return player + gameState + isNewPlayer

    const now = new Date().toISOString()

    // Mock player record
    const player = {
      player_id:          learnerId,
      talentlms_user_id:  learnerId,
      talentlms_username: learnerName,
      email:              '',
      display_name:       learnerName,
      first_seen_at:      now,
      last_seen_at:       now,
      status:             'active',
    }

    // Mock: always treat as new player (no saved state)
    // TODO: check Google Sheets for existing game_state row
    const isNewPlayer = true

    const gameState = {
      player_id:                learnerId,
      current_screen:           'player_setup',
      current_game_phase:       'game',
      current_quarter:          1,
      current_turn_step:        'open_sales_request',
      cash:                     100000,
      reputation:               0,
      net_profit:               0,
      total_revenue:            0,
      total_costs:              0,
      qualified_for_leaderboard: false,
      game_status:              'in_progress',
      updated_at:               now,
    }

    return res.status(200).json({ player, gameState, isNewPlayer })
  } catch (err) {
    console.error('[/api/start-game] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
