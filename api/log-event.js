/**
 * /api/log-event
 * ─────────────────────────────────────────────────────────────────────────────
 * POST handler – Append a player action to the events_log sheet for audit
 * and debugging purposes.
 *
 * Request body:
 *   {
 *     playerId: string,
 *     event: {
 *       action_type:      string,   // e.g. 'accepted_sales_request'
 *       action_payload:   string,   // JSON string of extra context
 *       screen:           string,
 *       quarter:          number,
 *       turn_step:        string,
 *       cash_after:       number,
 *       reputation_after: number,
 *       net_profit_after: number,
 *     }
 *   }
 *
 * Response:
 *   { success: boolean }
 *
 * Google Sheet: events_log
 * Columns: timestamp, player_id, action_type, action_payload, screen,
 *          quarter, turn_step, cash_after, reputation_after, net_profit_after
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

  const { playerId, event } = req.body || {}

  if (!playerId || !event) {
    return res.status(400).json({ error: 'playerId and event are required' })
  }

  try {
    // ── MOCK IMPLEMENTATION ─────────────────────────────────────────────────
    // TODO: append a new row to the "events_log" Google Sheet.
    //
    // Real implementation pattern:
    //   const jwt = new JWT({ ... })
    //   const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, jwt)
    //   await doc.loadInfo()
    //   const sheet = doc.sheetsByTitle['events_log']
    //   await sheet.addRow({
    //     timestamp:        new Date().toISOString(),
    //     player_id:        playerId,
    //     action_type:      event.action_type,
    //     action_payload:   event.action_payload,
    //     screen:           event.screen,
    //     quarter:          event.quarter,
    //     turn_step:        event.turn_step,
    //     cash_after:       event.cash_after,
    //     reputation_after: event.reputation_after,
    //     net_profit_after: event.net_profit_after,
    //   })

    console.info('[/api/log-event] Mock event log:', { playerId, event })
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('[/api/log-event] Error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
