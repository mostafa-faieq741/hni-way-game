/**
 * YearSummaryScreen.jsx
 * Annual review shown after every 4th quarter of a year.
 * "Continue to Next Year" returns the player to the Home screen.
 */

import React from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function YearSummaryScreen({ gs, completedYear, onContinue }) {
  const year = completedYear ?? gs.currentYear - 1

  const totalEmployees = gs.departments.reduce(
    (sum, d) => sum + d.specialists + d.consultants, 0
  )

  // Strategic insight logic
  const insight = gs.netProfit >= 50_000
    ? 'Strong financial performance. Your department investments are paying off. Continue building your team for next year.'
    : gs.netProfit >= 0
      ? 'Solid foundations. You broke even or made a small profit. Focus on securing higher-value projects next year to grow cash reserves.'
      : 'Cash pressure is real. Review your fixed costs and consider whether all active departments are earning their keep.'

  const recommendation = gs.reputation < 50
    ? 'Focus on delivering existing projects on time to build reputation. Reputation unlocks more valuable opportunities.'
    : gs.reputation >= GAME_CONFIG.winReputationThreshold
      ? 'Excellent reputation! You are leaderboard qualified. Keep it above 100 through the final year.'
      : `You need ${GAME_CONFIG.winReputationThreshold - gs.reputation} more reputation points to qualify for the leaderboard.`

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

      {/* Insight + recommendation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--c-primary)' }}>
          <div className="alert-box__label">Strategic Insight</div>
          <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7, marginTop: 6 }}>{insight}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--c-gold)', background: 'var(--c-gold-lt)' }}>
          <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a6900', marginBottom: 6 }}>
            Recommendation
          </div>
          <p style={{ fontSize: 14, color: 'var(--c-dark-grey)', lineHeight: 1.7 }}>{recommendation}</p>
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
