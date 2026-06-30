/**
 * YearSummaryScreen.jsx
 * Annual review shown after every 4th quarter of a year.
 * "Continue to Next Year" returns the player to the Home screen.
 */

import React from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import { diagnoseYear } from '../../data/yearInsights.js'

export default function YearSummaryScreen({ gs, completedYear, onContinue }) {
  const year = completedYear ?? gs.currentYear - 1

  const totalEmployees = gs.departments.reduce(
    (sum, d) => sum + d.specialists + d.consultants, 0
  )

  // Adaptive year-end diagnostic (mirrors the deck's 12 what-if scenarios).
  const diagnosis = diagnoseYear(gs)
  const toneAccent = {
    positive: 'var(--c-success, #0c6e3a)',
    caution:  'var(--c-gold, #c79200)',
    critical: 'var(--c-danger, #c0392b)',
  }[diagnosis.tone] || 'var(--c-primary)'

  // Reputation progress note kept as a secondary line.
  const repNote = gs.reputation >= GAME_CONFIG.winReputationThreshold
    ? 'Reputation is above 100 — you are leaderboard qualified. Keep it there.'
    : `${GAME_CONFIG.winReputationThreshold - gs.reputation} more reputation points to qualify for the leaderboard.`

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--c-primary)', margin: '0 auto var(--sp-4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
        }}>
          📋
        </div>
        <div className="section-label">Annual Review</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 32, fontWeight: 800, color: 'var(--c-rich-black)', margin: '8px 0' }}>
          Year {year} Complete
        </h1>
        <p style={{ fontSize: 15, color: 'var(--c-text-muted)', maxWidth: 480, margin: '0 auto' }}>
          Here's how your company performed over the last four quarters.
        </p>
      </div>

      {/* KPI grid */}
      <div className="summary-kpi-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <KpiCard label="Total Revenue" value={`$${gs.totalRevenue.toLocaleString()}`} positive />
        <KpiCard label="Total Expenses" value={`$${gs.totalCosts.toLocaleString()}`} />
        <KpiCard label="Net Profit" value={`$${gs.netProfit.toLocaleString()}`} positive={gs.netProfit >= 0} negative={gs.netProfit < 0} />
        <KpiCard label="Reputation" value={gs.reputation} />
        <KpiCard label="Employees" value={totalEmployees} />
        <KpiCard label="Active Projects" value={gs.activeProjects.length} />
      </div>

      {/* Adaptive strategic insight */}
      <div className="card" style={{ borderLeft: `4px solid ${toneAccent}`, marginBottom: 'var(--sp-5)' }}>
        <div className="alert-box__label">Strategic Insight</div>
        <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 17, color: 'var(--c-rich-black)', margin: '4px 0 6px' }}>
          {diagnosis.title}
        </div>
        <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7, margin: 0 }}>{diagnosis.insight}</p>
      </div>

      {/* Recommendations */}
      <div className="card" style={{ background: 'var(--c-gold-lt)', borderLeft: '4px solid var(--c-gold)', marginBottom: 'var(--sp-6)' }}>
        <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a6900', marginBottom: 10 }}>
          Recommendations
        </div>
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {diagnosis.recommendations.map((rec, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: 'var(--c-dark-grey)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--c-gold, #c79200)', fontWeight: 800, flexShrink: 0 }}>→</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
        <div style={{ fontSize: 12.5, color: 'var(--c-text-muted)', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          {repNote}
        </div>
      </div>

      <SmartPlayTip category="finance" />

      {/* Continue CTA */}
      <div style={{ textAlign: 'center', marginTop: 'var(--sp-8)' }}>
        <button className="btn btn--primary btn--lg" onClick={onContinue}>
          Continue to Year {year + 1} →
        </button>
        <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 12 }}>
          {GAME_CONFIG.totalYears - year} year{GAME_CONFIG.totalYears - year !== 1 ? 's' : ''} remaining
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, positive, negative }) {
  return (
    <div className="summary-kpi-card">
      <div className="summary-kpi-card__label">{label}</div>
      <div className={`summary-kpi-card__value${positive ? ' summary-kpi-card__value--positive' : negative ? ' summary-kpi-card__value--negative' : ''}`}>
        {value}
      </div>
    </div>
  )
}
