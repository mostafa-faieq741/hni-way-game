/**
 * LeaderboardModal.jsx
 * Side-panel leaderboard. View-only. Mock data with optional current-player overlay.
 *
 * Columns: Rank · Player · Revenue · Net Profit · Reputation Tokens
 * Top 3: gold/silver/bronze badges. Current player row is highlighted.
 */

import React from 'react'
import { getRankedLeaderboard, getInitials } from '../data/leaderboard.js'

export default function LeaderboardModal({ open, onClose, currentPlayer }) {
  if (!open) return null
  const rows = getRankedLeaderboard(currentPlayer)

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

          {rows.map((row) => (
            <div
              key={`${row.rank}-${row.name}`}
              className={`leaderboard-row${row.isCurrentPlayer ? ' leaderboard-row--current' : ''}`}
            >
              <span className="leaderboard-rank">
                <RankBadge rank={row.rank} />
              </span>

              <span className="leaderboard-player">
                <span className={`leaderboard-avatar leaderboard-avatar--rank-${Math.min(row.rank, 3)}`}>
                  {getInitials(row.name)}
                </span>
                <span>
                  <span className="leaderboard-name">
                    {row.name}
                    {row.isCurrentPlayer && <span className="leaderboard-you">YOU</span>}
                  </span>
                </span>
              </span>

              <span className="leaderboard-revenue">${row.revenue.toLocaleString()}</span>
              <span className="leaderboard-netprofit">${row.netProfit.toLocaleString()}</span>
              <span className="leaderboard-reputation">{row.reputation}</span>
            </div>
          ))}
        </div>

        <p className="leaderboard-panel__footer">
          View-only. Mock data for the prototype — real leaderboard data will connect later.
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
