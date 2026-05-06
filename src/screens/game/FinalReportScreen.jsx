/**
 * FinalReportScreen.jsx
 * Shown after quarter 20. Full game summary with leaderboard qualification logic.
 */

import React from 'react'
import { mergeDepartments } from '../../data/departments.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function FinalReportScreen({ gs, onRestart }) {
  const departments = mergeDepartments(gs.departments)
  const activeDepts = departments.filter((d) => d.isActive)
  const totalEmployees = gs.departments.reduce((sum, d) => sum + d.specialists + d.consultants, 0)

  const qualified = gs.reputation > GAME_CONFIG.winReputationThreshold
  const mostUsedDept = activeDepts.sort((a, b) => (b.totalStaff ?? 0) - (a.totalStaff ?? 0))[0]

  const bestYear = gs.yearSummaries?.length
    ? gs.yearSummaries.reduce((best, y) => (y.netProfit > (best?.netProfit ?? -Infinity) ? y : best), null)
    : null

  // Overall strategic insight
  const overallInsight = qualified
    ? 'Outstanding performance! You built a company with strong reputation and solid financials. Your strategic decisions set you apart.'
    : gs.netProfit > 0
      ? 'Good financial discipline. However, reputation fell short of the leaderboard threshold. In future runs, prioritise delivering projects on time.'
      : 'A challenging game. Review your department costs and project choices to identify where cash was lost. Every quarter counts.'

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: 'var(--sp-6) var(--sp-4)' }}>
      {/* Hero header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-8)' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto var(--sp-4)',
          background: qualified ? 'var(--c-success)' : 'var(--c-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
        }}>
          {qualified ? '🏆' : '📊'}
        </div>
        <div className="section-label">Game Complete — 20 Quarters</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 32, fontWeight: 800, color: 'var(--c-rich-black)', margin: '8px 0' }}>
          Final Report
        </h1>

        {/* Leaderboard badge */}
        <div style={{ display: 'inline-block', marginTop: 12 }}>
          {qualified ? (
            <div style={{
              background: 'var(--c-success-bg)', border: '2px solid var(--c-success)',
              borderRadius: 'var(--r-full)', padding: '8px 24px',
              fontFamily: 'var(--f-heading)', fontSize: 14, fontWeight: 700, color: 'var(--c-success)',
            }}>
              🏆 Leaderboard Qualified — Reputation {gs.reputation}
            </div>
          ) : (
            <div style={{
              background: 'var(--c-error-bg)', border: '2px solid #fca5a5',
              borderRadius: 'var(--r-full)', padding: '8px 24px',
              fontFamily: 'var(--f-heading)', fontSize: 14, fontWeight: 700, color: 'var(--c-error)',
            }}>
              Not Qualified — Reputation {gs.reputation} (need &gt; {GAME_CONFIG.winReputationThreshold})
            </div>
          )}
        </div>
      </div>

      {/* Core KPIs */}
      <div className="summary-kpi-grid" style={{ marginBottom: 'var(--sp-6)' }}>
        <KpiCard label="Total Revenue" value={`$${gs.totalRevenue.toLocaleString()}`} positive />
        <KpiCard label="Total Expenses" value={`$${gs.totalCosts.toLocaleString()}`} />
        <KpiCard label="Total Profit" value={`$${gs.netProfit.toLocaleString()}`} positive={gs.netProfit >= 0} negative={gs.netProfit < 0} />
        <KpiCard label="Final Reputation" value={gs.reputation} positive={qualified} />
        <KpiCard label="Employees" value={totalEmployees} />
        <KpiCard label="Final Cash" value={`$${gs.cash.toLocaleString()}`} positive />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        {/* Project stats */}
        <div className="card">
          <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Project Summary</div>
          <StatRow label="Projects Accepted" value={gs.acceptedCount} />
          <StatRow label="Projects Rejected" value={gs.rejectedCount} />
          <StatRow label="Projects Delivered" value={gs.completedProjects?.length ?? 0} positive />
          <StatRow label="Delivered On Time" value={gs.completedProjects?.filter((p) => p.onTime).length ?? 0} positive />
        </div>

        {/* Department stats */}
        <div className="card">
          <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Department Summary</div>
          <StatRow label="Active Departments" value={activeDepts.length} />
          <StatRow label="Total Departments Available" value={12} />
          <StatRow label="Most Used Department" value={mostUsedDept ? `${mostUsedDept.icon} ${mostUsedDept.name}` : '—'} />
          {bestYear && <StatRow label="Best Year" value={`Year ${bestYear.year} ($${bestYear.netProfit.toLocaleString()})`} positive />}
        </div>
      </div>

      {/* Active departments list */}
      <div className="card" style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Departments Chosen</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {activeDepts.map((d) => (
            <div key={d.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--c-bg)', border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-full)', padding: '4px 12px',
              fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 600,
            }}>
              {d.icon} {d.name}
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                {d.specialists}S {d.consultants}C
              </span>
            </div>
          ))}
          {activeDepts.length === 0 && <span style={{ fontSize: 13, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>No active departments.</span>}
        </div>
      </div>

      {/* Strategic insight */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-5)', marginBottom: 'var(--sp-6)' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--c-primary)' }}>
          <div className="alert-box__label">Strategic Insight</div>
          <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7, marginTop: 6 }}>{overallInsight}</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--c-gold)', background: 'var(--c-gold-lt)' }}>
          <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a6900', marginBottom: 6 }}>
            Performance Chart
          </div>
          <div style={{ fontSize: 13, color: 'var(--c-dark-grey)', fontStyle: 'italic' }}>
            Year-by-year chart will be rendered here when the charting module is connected. Track your revenue and profit trends across all 5 years.
          </div>
        </div>
      </div>

      <SmartPlayTip category="finance" />

      {/* Restart button */}
      {onRestart && (
        <div style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          <button
            className="btn btn--primary btn--lg"
            onClick={onRestart}
            style={{ minWidth: 240 }}
          >
            ↺ Restart Prototype
          </button>
          <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 8 }}>
            Resets all progress and starts a new game from Year 1, Quarter 1.
          </p>
        </div>
      )}

      {/* Leaderboard note */}
      <div className="card" style={{ marginTop: 'var(--sp-6)', textAlign: 'center', background: qualified ? 'var(--c-success-bg)' : 'var(--c-bg)' }}>
        <div style={{ fontFamily: 'var(--f-heading)', fontSize: 16, fontWeight: 700, marginBottom: 8, color: qualified ? 'var(--c-success)' : 'var(--c-text-muted)' }}>
          {qualified ? '🏆 You are on the Leaderboard!' : 'Leaderboard: Not Qualified'}
        </div>
        <p style={{ fontSize: 13, color: 'var(--c-text-muted)', maxWidth: 480, margin: '0 auto' }}>
          {qualified
            ? `Your final net profit of $${gs.netProfit.toLocaleString()} will be ranked against other qualified players. Leaderboard rankings are determined by highest net profit among players with reputation above ${GAME_CONFIG.winReputationThreshold}.`
            : `To qualify for the leaderboard, reputation must exceed ${GAME_CONFIG.winReputationThreshold}. Your final reputation was ${gs.reputation}. Try again — focus on on-time project delivery and protecting reputation.`}
        </p>
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

function StatRow({ label, value, positive }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border)', fontSize: 14 }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: positive ? 'var(--c-success)' : 'var(--c-text)' }}>{value}</span>
    </div>
  )
}
