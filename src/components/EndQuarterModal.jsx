/**
 * EndQuarterModal.jsx
 * Two related "moments" around ending a quarter:
 *
 *  mode="preview"  → Shown BEFORE committing. Previews exactly what will
 *                    happen (payroll, deliveries, revenue, reputation,
 *                    projected cash) so ending a quarter is a deliberate,
 *                    informed choice — never a surprise.
 *
 *  mode="summary"  → Shown AFTER committing. A clear recap of what changed,
 *                    replacing the old fading toast.
 *
 * The preview is computed with the same pure resolver the real submit uses,
 * so what the player sees is what they get.
 */

import React from 'react'
import { GAME_CONFIG } from '../data/gameConfig.js'
import {
  computeFixedExpenses,
  resolveProjectsForQuarter,
} from '../data/projectLifecycle.js'

const money = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString() + ''

export default function EndQuarterModal({ mode = 'preview', gs, summary, onConfirm, onCancel, onClose }) {
  if (mode === 'summary') {
    return <SummaryView gs={gs} summary={summary} onClose={onClose} />
  }
  return <PreviewView gs={gs} onConfirm={onConfirm} onCancel={onCancel} />
}

function PreviewView({ gs, onConfirm, onCancel }) {
  const fixedExpenses = computeFixedExpenses(gs.departments)
  const recurring = gs.recurringExpenses || 0
  const r = resolveProjectsForQuarter(gs)
  const projectedCash = gs.cash - fixedExpenses - recurring + r.revenueGained - r.extraCostsAdded
  const deliveringCodes = r.completedThisQtr.map((p) => p.code)
  const overdueCodes = r.updatedProjects
    .filter((p) => p.status === 'overdue')
    .map((p) => p.code)
  const isFinal = gs.overallQuarter >= GAME_CONFIG.totalQuarters

  return (
    <div className="eqm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel?.() }}>
      <div className="eqm" role="dialog" aria-modal="true" aria-label="End quarter review">
        <div className="eqm__head">
          <div>
            <div className="eqm__eyebrow">Review before you commit</div>
            <div className="eqm__title">End Year {gs.currentYear}, Q{gs.yearQuarter}?</div>
          </div>
          <button className="eqm__x" onClick={onCancel} aria-label="Close">×</button>
        </div>

        <div className="eqm__body">
          <p className="eqm__lead">
            Here is exactly what will happen when this quarter closes. Nothing is final until you confirm.
          </p>

          <SumLine icon="💸" label="Payroll for the quarter" value={money(-fixedExpenses)} tone="neg" />
          {recurring > 0 && (
            <SumLine icon="🏢" label="Recurring expenses" value={money(-recurring)} tone="neg" />
          )}
          <SumLine
            icon="📦"
            label="Projects delivering"
            sub={deliveringCodes.length ? deliveringCodes.join(', ') : 'none this quarter'}
            value={r.revenueGained ? money(r.revenueGained) : '—'}
            tone={r.revenueGained ? 'pos' : 'muted'}
          />
          {r.extraCostsAdded > 0 && (
            <SumLine
              icon="⚠️"
              label="Overdue penalties"
              sub={overdueCodes.join(', ')}
              value={money(-r.extraCostsAdded)}
              tone="neg"
            />
          )}
          <SumLine
            icon="⭐"
            label="Reputation change"
            value={(r.reputationDelta > 0 ? '+' : '') + (r.reputationDelta || 0)}
            tone={r.reputationDelta >= 0 ? 'pos' : 'neg'}
          />
          <SumLine icon="💰" label="Projected cash after" value={money(projectedCash)} tone={projectedCash >= 0 ? '' : 'neg'} />

          {projectedCash < 0 && (
            <div className="eqm__warn">
              ⚠ This quarter would put your cash below zero. You can still proceed, but consider trimming payroll or delivering more first.
            </div>
          )}
        </div>

        <div className="eqm__foot">
          <button className="btn btn--secondary btn--md" onClick={onCancel}>Keep playing</button>
          <button className="btn btn--primary btn--md" onClick={onConfirm}>
            {isFinal ? 'Finish & see final report' : 'Confirm & end quarter'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryView({ gs, summary, onClose }) {
  const s = summary || {}
  return (
    <div className="eqm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="eqm" role="dialog" aria-modal="true" aria-label="Quarter summary">
        <div className="eqm__head">
          <div>
            <div className="eqm__eyebrow eqm__eyebrow--ok">Quarter closed ✓</div>
            <div className="eqm__title">Here's what changed</div>
          </div>
          <button className="eqm__x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="eqm__body">
          <SumLine icon="📦" label="Projects delivered" value={String(s.deliveredCodes?.length || 0)} />
          <SumLine icon="💰" label="Revenue earned" value={money(s.revenueGained || 0)} tone="pos" />
          <SumLine icon="💸" label="Payroll paid" value={money(-(s.fixedExpenses || 0))} tone="neg" />
          {s.recurringExpenses > 0 && (
            <SumLine icon="🏢" label="Recurring expenses" value={money(-s.recurringExpenses)} tone="neg" />
          )}
          {s.extraCostsAdded > 0 && (
            <SumLine icon="⚠️" label="Overdue penalties" value={money(-(s.extraCostsAdded))} tone="neg" />
          )}
          <SumLine
            icon="⭐"
            label="Reputation"
            value={(s.reputationDelta > 0 ? '+' : '') + (s.reputationDelta || 0)}
            sub={'now ' + gs.reputation + ' / ' + GAME_CONFIG.winReputationThreshold}
            tone={(s.reputationDelta || 0) >= 0 ? 'pos' : 'neg'}
          />
          <SumLine icon="🎯" label="Now entering" value={'Year ' + gs.currentYear + ', Q' + gs.yearQuarter} />

          <p className="eqm__note">
            {gs.reputation > GAME_CONFIG.winReputationThreshold
              ? '🏆 You have passed the reputation threshold — you qualify for the leaderboard!'
              : 'Keep delivering higher-star projects to grow reputation toward ' + GAME_CONFIG.winReputationThreshold + '.'}
          </p>
        </div>

        <div className="eqm__foot">
          <button className="btn btn--primary btn--md" onClick={onClose}>
            Start Q{gs.yearQuarter} →
          </button>
        </div>
      </div>
    </div>
  )
}

function SumLine({ icon, label, sub, value, tone = '' }) {
  const cls = tone === 'pos' ? 'eqm-line__v--pos' : tone === 'neg' ? 'eqm-line__v--neg' : tone === 'muted' ? 'eqm-line__v--muted' : ''
  return (
    <div className="eqm-line">
      <div className="eqm-line__l">
        <span className="eqm-line__icon" aria-hidden="true">{icon}</span>
        <div>
          <div className="eqm-line__label">{label}</div>
          {sub && <div className="eqm-line__sub">{sub}</div>}
        </div>
      </div>
      <div className={'eqm-line__v ' + cls}>{value}</div>
    </div>
  )
}
