/**
 * LeaderboardModal.jsx
 * Side-panel leaderboard. Live data from the backend (/api/leaderboard):
 * players who passed 100 reputation, ranked by net profit. The current player
 * always sees their own standing pinned at the bottom — including their
 * provisional rank and how far they are from qualifying.
 */

import React, { useEffect, useState } from 'react'
import { fetchLeaderboard } from '../services/authClient.js'
import { getInitials } from '../data/leaderboard.js'

const QUALIFY_REP = 100

export default function LeaderboardModal({ open, onClose, currentPlayer }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true); setError(null)
    fetchLeaderboard()
      .then((list) => { if (!cancelled) setRows(Array.isArray(list) ? list : []) })
      .catch(() => { if (!cancelled) setError('Could not load the leaderboard.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open])

  if (!open) return null

  const me = currentPlayer
  const meName = me?.name
  const meNet = Number(me?.netProfit || 0)
  const meRep = Number(me?.reputation || 0)
  const meQualified = meRep >= QUALIFY_REP
  const meInList = !!meName && rows.some((r) => (r.display_name || '') === meName)
  // Provisional rank = where the player's net profit slots into the standings.
  const provisionalRank = rows.filter((r) => Number(r.net_profit || 0) > meNet).length + 1

  return (
    <>
      <div className="leaderboard-overlay" onClick={onClose} />

      <aside className="leaderboard-panel" role="dialog" aria-modal="true" aria-label="Leaderboard">
        <div className="leaderboard-panel__head">
          <div>
            <div className="section-label" style={{ color: 'var(--c-primary)' }}>Live Standings</div>
            <h2 className="leaderboard-panel__title">Leaderboard</h2>
            <p className="leaderboard-panel__sub">Ranked by net profit. Players above 100 reputation tokens qualify.</p>
          </div>
          <button className="leaderboard-panel__close" onClick={onClose} aria-label="Close leaderboard">×</button>
        </div>

        <div className="leaderboard-table">
          <div className="leaderboard-row leaderboard-row--head">
            <span>Rank</span>
            <span>Player</span>
            <span>Revenue</span>
            <span>Net Profit</span>
            <span>Reputation Tokens</span>
          </div>

          {loading && <div className="leaderboard-row"><span /><span>Loading…</span></div>}
          {!loading && error && <div className="leaderboard-row"><span /><span>{error}</span></div>}
          {!loading && !error && rows.length === 0 && (
            <div className="leaderboard-row"><span /><span>No qualified players yet — reach 100 reputation to top the board.</span></div>
          )}

          {!loading && !error && rows.map((row, i) => {
            const rank = i + 1
            const name = row.display_name || 'Player'
            const isMe = meName && name === meName
            return (
              <div key={rank + '-' + name} className={`leaderboard-row${isMe ? ' leaderboard-row--current' : ''}`}>
                <span className="leaderboard-rank"><RankBadge rank={rank} /></span>
                <span className="leaderboard-player">
                  <span className={`leaderboard-avatar leaderboard-avatar--rank-${Math.min(rank, 3)}`}>{getInitials(name)}</span>
                  <span><span className="leaderboard-name">{name}{isMe && <span className="leaderboard-you">YOU</span>}</span></span>
                </span>
                <span className="leaderboard-revenue">${Number(row.total_revenue || 0).toLocaleString()}</span>
                <span className="leaderboard-netprofit">${Number(row.net_profit || 0).toLocaleString()}</span>
                <span className="leaderboard-reputation">{row.reputation}</span>
              </div>
            )
          })}
        </div>

        {/* Your standing — always shown so the player sees where they are. */}
        {me && !meInList && (
          <div style={{
            margin: '14px 0 4px', padding: '12px 14px',
            border: '1px solid var(--c-primary)', borderRadius: 'var(--r-lg)',
            background: 'var(--c-primary-lt)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 15, color: 'var(--c-primary)', minWidth: 36 }}>
                {meQualified ? '#' + provisionalRank : '#' + provisionalRank}
              </span>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {getInitials(meName || 'You')}
              </span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
                {meName || 'You'} <span className="leaderboard-you">YOU</span>
              </span>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, fontSize: 14 }}>${meNet.toLocaleString()}</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--c-text)' }}>
              {meQualified ? (
                <span><strong>Qualified ★</strong> — finish your run to lock in your place.</span>
              ) : (
                <>
                  <span>{meRep} / {QUALIFY_REP} reputation — <strong>{QUALIFY_REP - meRep} to qualify</strong>.</span>
                  <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: 'var(--c-surface)', overflow: 'hidden' }}>
                    <div style={{ width: Math.max(3, Math.min(100, (meRep / QUALIFY_REP) * 100)) + '%', height: '100%', background: 'var(--c-primary)' }} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <p className="leaderboard-panel__footer">
          View-only. Live standings update as players finish their quarters.
        </p>
      </aside>
    </>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="rank-badge rank-badge--gold">1</span>
  if (rank === 2) return <span className="rank-badge rank-badge--silver">2</span>
  if (rank === 3) return <span className="rank-badge rank-badge--bronze">3</span>
  return <span className="rank-badge rank-badge--plain">{rank}</span>
}
