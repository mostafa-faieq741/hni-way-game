import React, { useState } from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { computeFixedExpenses } from '../../data/projectLifecycle.js'

export default function FinanceScreen({ gs, onSubmitQuarter, onShowToast }) {
  const [confirming, setConfirming] = useState(false)

  const fixedExpenses = computeFixedExpenses(gs.departments)
  const endingThisQtr = gs.activeProjects.filter((p) => p.quartersLeft <= 1 || p.status === 'overdue')
  const expectedRevenue = endingThisQtr.reduce((s, p) => s + p.revenue, 0)
  const expectedExtraCosts = gs.activeProjects
    .filter((p) => p.status === 'overdue')
    .reduce((s, p) => s + Math.round(p.cost * 0.10), 0)

  const handleSubmit = () => {
    setConfirming(false)
    onSubmitQuarter()
    onShowToast?.('Quarter submitted. Reviewing the resolution panel...')
  }

  const last = gs.lastResolution

  return (
    <div>
      <TutorialOverlay
        screenId="finance"
        title="Finance / Quarter Center"
        steps={[
          'Submit Quarter resolves everything: fixed expenses paid, revenue auto-collected for delivered projects, penalties applied.',
          'You do not need to collect revenue manually.',
          'You will be asked to confirm before the quarter is submitted.',
        ]}
      />

      <div className="card card--accent" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-4)' }}>
          <div>
            <div className="section-label">Quarter Center</div>
            <h2 style={{ fontFamily: 'var(--f-heading)', fontSize: 24, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
              Year {gs.currentYear} - Quarter {gs.yearQuarter}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
              Overall Q{gs.overallQuarter} of {GAME_CONFIG.totalQuarters} - {GAME_CONFIG.totalQuarters - gs.overallQuarter} quarter(s) remaining
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button className="btn btn--primary btn--md" onClick={() => setConfirming(true)}>
              Submit Quarter
            </button>
          </div>
        </div>
      </div>

      <div className="finance-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Quarter Entry
            </div>
            <KpiRow label="Fixed Expenses (Staff)" value={'-$' + fixedExpenses.toLocaleString()} />
            <KpiRow label="Projects ending this quarter" value={endingThisQtr.length} />
            <KpiRow label="Revenue if all deliver" value={'$' + expectedRevenue.toLocaleString()} positive />
            {expectedExtraCosts > 0 && (
              <KpiRow label="Overdue penalty risk" value={'-$' + expectedExtraCosts.toLocaleString()} />
            )}
          </div>

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
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                      {proj.status === 'overdue'
                        ? 'Overdue - ' + proj.overdueQuarters + ' qtr'
                        : proj.quartersLeft + ' qtr left'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--f-heading)', fontSize: 14, fontWeight: 700, color: proj.status === 'overdue' ? 'var(--c-error)' : 'var(--c-success)' }}>
                      ${proj.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {last && (
            <div className="card" style={{ borderLeft: '4px solid var(--c-primary)' }}>
              <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>Last Quarter Resolution</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <li>Fixed expenses paid: <strong>-${last.fixedExpenses.toLocaleString()}</strong></li>
                {last.revenueGained > 0 && <li>Revenue collected: <strong style={{ color: 'var(--c-success)' }}>+${last.revenueGained.toLocaleString()}</strong></li>}
                {last.extraCostsAdded > 0 && <li>Overdue penalties: <strong style={{ color: 'var(--c-error)' }}>-${last.extraCostsAdded.toLocaleString()}</strong></li>}
                {last.reputationDelta !== 0 && <li>Reputation change: <strong>{last.reputationDelta > 0 ? '+' : ''}{last.reputationDelta}</strong></li>}
                {last.deliveredCodes?.length > 0 && <li>Delivered: {last.deliveredCodes.join(', ')}</li>}
                {last.overdueCodes?.length > 0 && <li>Overdue: {last.overdueCodes.join(', ')}</li>}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Year {gs.currentYear} Summary Preview
            </div>
            <KpiRow label="Total Revenue (YTD)" value={'$' + gs.totalRevenue.toLocaleString()} positive />
            <KpiRow label="Total Expenses (YTD)" value={'$' + gs.totalCosts.toLocaleString()} />
            <KpiRow label="Net Profit (YTD)" value={'$' + gs.netProfit.toLocaleString()} highlight positive={gs.netProfit >= 0} />
            <KpiRow label="Reputation" value={gs.reputation} />
            <KpiRow label="Current Cash" value={'$' + gs.cash.toLocaleString()} positive />
          </div>

          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>
              Approvals, Flags & Insight
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <FlagItem icon="A" label="Approvals" text="No pending approvals this quarter." color="var(--c-success)" />
              <FlagItem
                icon="!"
                label="Flags"
                text={
                  gs.cash < fixedExpenses * 2
                    ? 'Cash runway is short - consider trimming staff costs.'
                    : gs.activeProjects.filter((p) => p.status === 'overdue').length > 0
                      ? 'You have overdue projects. Each overdue quarter applies -1 reputation and +10% extra cost.'
                      : 'No active flags.'
                }
                color={gs.cash < fixedExpenses * 2 ? 'var(--c-error)' : 'var(--c-text-muted)'}
              />
              <FlagItem
                icon="i"
                label="Insight"
                text={
                  gs.activeProjects.length === 0
                    ? 'No active projects - visit Sales Requests to start the pipeline.'
                    : gs.activeProjects.length + ' active project(s). Check Active Projects for delivery status.'
                }
                color="var(--c-primary)"
              />
            </div>
          </div>

          <SmartPlayTip category="finance" />
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="End this quarter?"
        body={'You are about to resolve Year ' + gs.currentYear + ', Q' + gs.yearQuarter + '. Fixed expenses will be paid, revenue will be collected on delivered projects, and overdue penalties will be applied. Continue?'}
        confirmLabel="Yes, submit quarter"
        cancelLabel="Not yet"
        onConfirm={handleSubmit}
        onCancel={() => setConfirming(false)}
      />
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
          color: highlight ? (positive ? 'var(--c-success)' : 'var(--c-error)') : positive ? 'var(--c-success)' : 'var(--c-text)',
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
