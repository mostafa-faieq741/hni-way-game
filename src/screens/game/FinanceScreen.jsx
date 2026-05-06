/**
 * FinanceScreen.jsx
 * Quarter Center: review financials, submit the quarter, collect revenues.
 * Triggers YearSummary after Q4 of each year, FinalReport after Q20.
 */

import React, { useState } from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function FinanceScreen({ gs, onUpdateGs, onSubmitQuarter, onShowToast }) {
  const [revenuesCollected, setRevenuesCollected] = useState(false)

  const fixedExpenses = gs.departments.reduce(
    (sum, d) =>
      sum +
      d.specialists * GAME_CONFIG.specialistCostPerQuarter +
      d.consultants * GAME_CONFIG.consultantCostPerQuarter,
    0
  )

  const quarterRevenue = gs.quarterRevenue ?? 0
  const quarterCOGS   = gs.quarterCOGS   ?? 0
  const grossProfit   = quarterRevenue - quarterCOGS
  const netThisQtr    = grossProfit - fixedExpenses

  const handleCollectRevenues = () => {
    if (revenuesCollected) {
      onShowToast('Revenues already collected this quarter.')
      return
    }
    const revenueGain = quarterRevenue
    onUpdateGs({
      cash:         gs.cash + revenueGain,
      totalRevenue: gs.totalRevenue + revenueGain,
    })
    setRevenuesCollected(true)
    onShowToast(`✅ Revenues collected: +$${revenueGain.toLocaleString()}`)
  }

  const handleSubmit = () => {
    setRevenuesCollected(false)
    onSubmitQuarter()
  }

  return (
    <div>
      {/* Quarter header */}
      <div className="card card--accent" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <div className="section-label">Quarter Center</div>
            <h2 style={{ fontFamily: 'var(--f-heading)', fontSize: 24, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
              Year {gs.currentYear} · Quarter {gs.yearQuarter}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
              Overall Q{gs.overallQuarter} of {GAME_CONFIG.totalQuarters} ·{' '}
              {GAME_CONFIG.totalQuarters - gs.overallQuarter} quarter{gs.overallQuarter !== GAME_CONFIG.totalQuarters - 1 ? 's' : ''} remaining
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button
              className="btn btn--secondary btn--md"
              onClick={handleCollectRevenues}
              disabled={revenuesCollected || quarterRevenue === 0}
            >
              {revenuesCollected ? '✓ Revenues Collected' : 'Collect Revenues'}
            </button>
            <button
              className="btn btn--primary btn--md"
              onClick={handleSubmit}
            >
              Submit Quarter →
            </button>
          </div>
        </div>
      </div>

      <div className="finance-grid">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {/* Quarter P&L */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Quarter {gs.yearQuarter} — P&amp;L
            </div>
            <KpiRow label="Revenue"      value={`$${quarterRevenue.toLocaleString()}`} positive />
            <KpiRow label="COGS"         value={`-$${quarterCOGS.toLocaleString()}`} />
            <KpiRow label="Gross Profit" value={`$${grossProfit.toLocaleString()}`} highlight positive={grossProfit >= 0} />
            <KpiRow label="Fixed Expenses (Staff)" value={`-$${fixedExpenses.toLocaleString()}`} />
            <KpiRow label="Net This Quarter" value={`$${netThisQtr.toLocaleString()}`} highlight positive={netThisQtr >= 0} />
          </div>

          {/* Active projects */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Active Projects
            </div>
            {gs.activeProjects.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
                No active projects this quarter.
              </div>
            ) : (
              gs.activeProjects.map((proj) => (
                <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 700 }}>{proj.code}</div>
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{proj.quartersLeft} qtr{proj.quartersLeft !== 1 ? 's' : ''} left</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--f-heading)', fontSize: 14, fontWeight: 700, color: 'var(--c-success)' }}>
                      ${proj.revenue?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {/* Year summary preview */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Year {gs.currentYear} Summary Preview
            </div>
            <KpiRow label="Total Revenue"   value={`$${gs.totalRevenue.toLocaleString()}`} positive />
            <KpiRow label="Total Expenses"  value={`$${gs.totalCosts.toLocaleString()}`} />
            <KpiRow label="Net Profit"      value={`$${gs.netProfit.toLocaleString()}`} highlight positive={gs.netProfit >= 0} />
            <KpiRow label="Reputation"      value={gs.reputation} />
            <KpiRow label="Current Cash"    value={`$${gs.cash.toLocaleString()}`} positive />
          </div>

          {/* Approvals, Flags & Insight */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Approvals, Flags &amp; Insight
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <FlagItem icon="✅" label="Approvals" text="No pending approvals this quarter." color="var(--c-success)" />
              <FlagItem icon="🚩" label="Flags" text={gs.cash < fixedExpenses * 2 ? 'Cash is low. Consider reducing staff costs.' : 'No active flags.'} color={gs.cash < fixedExpenses * 2 ? 'var(--c-error)' : 'var(--c-text-muted)'} />
              <FlagItem icon="💡" label="Insight" text={gs.activeProjects.length === 0 ? 'No active projects. Visit Sales Requests to find new opportunities.' : `You have ${gs.activeProjects.length} active project${gs.activeProjects.length > 1 ? 's' : ''}. Stay on track for on-time delivery.`} color="var(--c-primary)" />
            </div>
          </div>

          <SmartPlayTip category="finance" />
        </div>
      </div>
    </div>
  )
}

function KpiRow({ label, value, highlight, positive }) {
  return (
    <div className="finance-kpi-row">
      <span className="finance-kpi-row__label">{label}</span>
      <span
        className="finance-kpi-row__value"
        style={{
          fontWeight: highlight ? 800 : 700,
          color: highlight
            ? (positive ? 'var(--c-success)' : 'var(--c-error)')
            : positive
              ? 'var(--c-success)'
              : 'var(--c-text)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

function FlagItem({ icon, label, text, color }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div>
        <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color, marginRight: 6 }}>{label}:</span>
        <span style={{ color: 'var(--c-text-muted)' }}>{text}</span>
      </div>
    </div>
  )
}
