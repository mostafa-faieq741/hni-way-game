/**
 * HomeScreen.jsx – "Command Center" layout v2.
 *
 * Projects (briefs + active quests) live front-and-center in the main
 * column with the big pipeline cards; departments are compact unit cards
 * in the sidebar. Stat bar (cash/quarter/employees/reputation) is back on
 * top. End Quarter floats bottom-right. The quarter checklist stays as an
 * opt-in "?" tooltip, hidden by default.
 */

import React, { useEffect, useRef, useState } from 'react'
import { mergeDepartments } from '../../data/departments.js'
import { getProjectById } from '../../data/projects.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import ContractCard from '../../components/ContractCard.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import HireModal from '../../components/HireModal.jsx'
import { play } from '../../services/sounds.js'

export default function HomeScreen({ gs, onNavigate, onHire, onShowToast, onRequestEndQuarter, quarterProgress = {} }) {
  const [showHire, setShowHire] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [showLocked, setShowLocked] = useState(false)
  const guideRef = useRef(null)

  // Close the quarter guide when clicking anywhere else.
  useEffect(() => {
    if (!showGuide) return
    const close = (e) => {
      if (guideRef.current && !guideRef.current.contains(e.target)) setShowGuide(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showGuide])

  const departments = mergeDepartments(gs.departments)
  const acceptedIds = new Set(gs.activeProjects.map((p) => p.id))
  const completedIds = new Set((gs.completedProjects || []).map((p) => p.id))
  const rejectedIds = new Set(gs.quarterRejectedIds || [])

  const sales = gs.departments.find((d) => d.id === 'sales') || { specialists: 0, consultants: 0 }
  const salesCapacity = sales.specialists * 2 + sales.consultants * 4

  const quarterBriefs = gs.quarterBriefs || []
  const salesRequests = quarterBriefs.filter(
    (p) => !acceptedIds.has(p.id) && !rejectedIds.has(p.id) && !completedIds.has(p.id)
  )

  const activeDepts = departments.filter((d) => d.isActive)
  const lockedDepts = departments.filter((d) => !d.isActive)
  const totalEmployees = gs.departments.reduce((sum, d) => sum + d.specialists + d.consultants, 0)
  const fixedExpenses = gs.departments.reduce(
    (sum, d) => sum +
      d.specialists * GAME_CONFIG.specialistCostPerQuarter +
      d.consultants * GAME_CONFIG.consultantCostPerQuarter,
    0
  )
  const overdueCount = gs.activeProjects.filter((p) => p.status === 'overdue').length

  const lastQtrCashFlow = gs.lastResolution
    ? (gs.lastResolution.revenueGained || 0)
      - (gs.lastResolution.fixedExpenses || 0)
      - (gs.lastResolution.extraCostsAdded || 0)
    : null
  const cashRunway = fixedExpenses > 0 ? Math.floor(gs.cash / fixedExpenses) : null

  // Quarter guide steps (the old checklist, now opt-in)
  const forecastDone = !!quarterProgress.forecast || !!gs.forecastPurchasedByYear?.[gs.currentYear]
  const steps = [
    { done: forecastDone, title: 'Review the forecast', meta: 'See what client demand is coming this year' },
    {
      done: !!quarterProgress.accept,
      title: 'Accept project briefs',
      meta: salesCapacity > 0
        ? salesRequests.length + ' brief' + (salesRequests.length !== 1 ? 's' : '') + ' waiting'
        : 'Hire a Sales specialist to surface briefs',
    },
    { done: !!quarterProgress.staff, title: 'Staff your departments', meta: 'Hire to unlock bigger projects' },
  ]

  return (
    <div>
      <TutorialOverlay
        screenId="home"
        title="Command Center"
        steps={[
          'The top bar is your HUD: level, cash, reputation, XP and HP bars. The session caps at 30 minutes.',
          'Departments are your units. Locked units activate when you hire into them - HR must be first.',
          'The right panel shows your active quests (projects) and waiting briefs.',
          'Stuck? Press the ? button next to Departments for the quarter guide.',
          'Press the End Quarter button (bottom right) when you are ready - nothing resolves until you choose to.',
        ]}
      />

      <div className="game-stat-bar">
        <StatCard icon="🪙" label="Cash" value={'$' + gs.cash.toLocaleString() + ''} sub="Available" />
        <StatCard
          icon="📅"
          label="Quarter"
          value={gs.practiceMode ? 'Q0' : 'Q' + gs.yearQuarter}
          sub={gs.practiceMode ? 'Practice round · nothing counts yet' : 'Year ' + gs.currentYear + ' of 5 · Overall Q' + gs.overallQuarter}
          progress={gs.overallQuarter / GAME_CONFIG.totalQuarters}
        />
        <StatCard icon="👥" label="Employees" value={totalEmployees} sub={'$' + fixedExpenses.toLocaleString() + ' / qtr payroll'} />
        <StatCard
          icon="🛡️"
          label="Reputation"
          value={gs.reputation}
          sub={gs.reputation > GAME_CONFIG.winReputationThreshold
            ? 'Leaderboard qualified'
            : gs.reputation + ' / ' + GAME_CONFIG.winReputationThreshold + ' to qualify'}
          progress={Math.min(1, gs.reputation / GAME_CONFIG.winReputationThreshold)}
          progressTone="gold"
        />
      </div>

      <div className="home-layout home-layout--cc">
        <div className="home-side-left">
          <div className="totals-panel" data-tour="departments">
            <div className="totals-panel__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Departments</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="qguide" ref={guideRef} data-tour="guide">
                  <button
                    className={'qguide__btn' + (showGuide ? ' qguide__btn--open' : '')}
                    onClick={() => { play('click'); setShowGuide((v) => !v) }}
                    title="Quarter guide"
                    aria-label="Quarter guide"
                    aria-expanded={showGuide}
                  >
                    ?
                  </button>
                  {showGuide && (
                    <div className="qguide__pop" role="dialog" aria-label="Quarter guide">
                      <div className="qguide__title">Quarter guide</div>
                      {steps.map((st, i) => (
                        <div key={i} className={'qguide__step' + (st.done ? ' qguide__step--done' : '')}>
                          <div className="qguide__tick">{st.done ? '✓' : ''}</div>
                          <div>
                            <div className="qguide__t">{st.title}</div>
                            <div className="qguide__m">{st.meta}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="btn btn--primary btn--sm" data-tour="hire" onClick={() => setShowHire(true)} title="Hire into any department">
                  + Hire
                </button>
              </div>
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--c-text-muted)', letterSpacing: '0.06em', marginBottom: 2 }}>
              {activeDepts.length} ACTIVE · {departments.length - activeDepts.length} LOCKED
            </div>
            <div className="unit-grid unit-grid--side">
              {activeDepts.map((dept) => {
                const staff = (dept.specialists || 0) + (dept.consultants || 0)
                const elite = staff >= 4
                return (
                  <button
                    key={dept.id}
                    className={'unit-card' + (elite ? ' unit-card--elite' : '')}
                    onClick={() => { play('nav'); onNavigate('dept-detail', { dept }) }}
                    title={'Open ' + dept.name}
                  >
                    <div className="unit-card__icon" aria-hidden="true">{dept.icon}</div>
                    <div className="unit-card__name">{dept.name}</div>
                    <div className="unit-card__lvl">
                      {staff} STAFF{elite ? ' · ELITE' : ''}
                    </div>
                    <div className="unit-card__pips" aria-label={staff + ' staff'}>
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={'unit-pip' + (i < Math.min(4, staff) ? ' unit-pip--f' : '')} />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {lockedDepts.length > 0 && (
              <div className="locked-section">
                <button
                  className={'locked-section__toggle' + (showLocked ? ' is-open' : '')}
                  onClick={() => { play('click'); setShowLocked((v) => !v) }}
                  aria-expanded={showLocked}
                >
                  <span className="locked-section__caret" aria-hidden="true">{showLocked ? '▾' : '▸'}</span>
                  <span className="locked-section__count">{lockedDepts.length} locked</span>
                  <span className="locked-section__hint">{showLocked ? 'Hide' : 'Hire to unlock'}</span>
                </button>
                {showLocked && (
                  <div className="locked-strip">
                    {lockedDepts.map((dept) => (
                      <button
                        key={dept.id}
                        className="locked-chip"
                        onClick={() => { play('nav'); setShowHire(true) }}
                        title={'Hire to unlock ' + dept.name}
                      >
                        <span className="locked-chip__icon" aria-hidden="true">{dept.icon}</span>
                        <span className="locked-chip__name">{dept.name}</span>
                        <span className="locked-chip__lock" aria-hidden="true">🔒</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="home-main">
          <div className="quest-board">
            <div className="qb-panel" data-tour="sales">
              <button className="qb-head qb-head--briefs" onClick={() => { play('nav'); onNavigate('sales-requests') }}>
                <div>
                  <div className="qb-head__label">Open Opportunities</div>
                  <div className="qb-head__title">Sales Requests</div>
                  <div className="qb-head__sub">{salesCapacity > 0 ? 'Capacity ' + salesCapacity + ' · tap to view all' : 'Hire sales to unlock briefs'}</div>
                </div>
                <div className="qb-head__count">{salesRequests.length}</div>
              </button>
              <div className="qb-body">
                {salesRequests.length === 0 && (
                  <div className="qb-empty">
                    {salesCapacity > 0 ? 'No briefs left this quarter.' : 'Hire a Sales specialist to surface briefs.'}
                  </div>
                )}
                {salesRequests.slice(0, 4).map((p) => (
                  <ContractCard
                    key={p.id}
                    project={p}
                    cta="Review"
                    onOpen={(proj) => { play('nav'); onNavigate('project-detail', { project: proj }) }}
                  />
                ))}
                {salesRequests.length > 4 && (
                  <button
                    className="btn btn--secondary btn--sm"
                    style={{ width: '100%', marginTop: 6 }}
                    onClick={() => { play('nav'); onNavigate('sales-requests') }}
                  >
                    View all briefs
                  </button>
                )}
              </div>
            </div>

            <div className="qb-panel" data-tour="active">
              <button className="qb-head qb-head--active" onClick={() => { play('nav'); onNavigate('active-projects') }}>
                <div>
                  <div className="qb-head__label">Pipeline</div>
                  <div className="qb-head__title">Active Projects</div>
                  <div className="qb-head__sub">{gs.activeProjects.length}/{MAX_ACTIVE_PROJECTS} active · {overdueCount} overdue</div>
                </div>
                <div className="qb-head__count">{gs.activeProjects.length}</div>
              </button>
              <div className="qb-body">
                {gs.activeProjects.length === 0 && (
                  <div className="qb-empty">No active projects yet - accept a brief to start your first quest.</div>
                )}
                {gs.activeProjects.slice(0, 4).map((proj) => {
                  const dur = proj.durationQuarters || 1
                  const pct = proj.status === 'overdue' ? 100 : Math.round(((dur - (proj.quartersLeft || 0)) / dur) * 100)
                  return (
                    <button
                      key={proj.id}
                      className={'quest-row' + (proj.status === 'overdue' ? ' quest-row--late' : '')}
                      onClick={() => { play('nav'); onNavigate('active-project-detail', { activeProject: proj }) }}
                    >
                      <span className="quest-row__code">{proj.code}</span>
                      <span className="quest-row__bar"><i style={{ width: Math.max(4, Math.min(100, pct)) + '%' }} /></span>
                      <span className="quest-row__meta">
                        {proj.status === 'overdue'
                          ? 'Overdue · ' + proj.overdueQuarters + ' qtr'
                          : proj.quartersLeft + ' qtr left'}
                      </span>
                    </button>
                  )
                })}
                {gs.activeProjects.length > 4 && (
                  <button
                    className="btn btn--secondary btn--sm"
                    style={{ width: '100%', marginTop: 6 }}
                    onClick={() => { play('nav'); onNavigate('active-projects') }}
                  >
                    View all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="home-sidebar">
                    <div className="totals-panel">
            <div className="totals-panel__title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Company Health</span>
              <button className="totals-toggle" onClick={() => setShowDetails((v) => !v)}>
                <span aria-hidden="true">{showDetails ? '▴' : '▾'}</span> {showDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>
            <div className="totals-row">
              <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">📈</i>Net Profit</span>
              <span className={'totals-row__value ' + (gs.netProfit >= 0 ? 'totals-row__value--positive' : 'totals-row__value--negative')}>
                ${gs.netProfit.toLocaleString()}
                <span className={'trow-dot ' + (gs.netProfit >= 0 ? 'trow-dot--good' : 'trow-dot--bad')} aria-hidden="true" />
              </span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">⛽</i>Cash Runway</span>
              <span className="totals-row__value">{cashRunway === null ? '∞' : cashRunway + ' qtr'}
                <span className={'trow-dot ' + (cashRunway === null || cashRunway >= 4 ? 'trow-dot--good' : cashRunway >= 2 ? 'trow-dot--warn' : 'trow-dot--bad')} aria-hidden="true" />
              </span>
            </div>
            {showDetails && (
              <>
                <div className="totals-row">
                  <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">🔁</i>Cash Flow (last qtr)</span>
                  <span className={'totals-row__value ' + (lastQtrCashFlow === null ? '' : (lastQtrCashFlow >= 0 ? 'totals-row__value--positive' : 'totals-row__value--negative'))}>
                    {lastQtrCashFlow === null
                      ? '-'
                      : (lastQtrCashFlow >= 0 ? '+' : '-') + '$' + Math.abs(lastQtrCashFlow).toLocaleString() + ''}
                  </span>
                </div>
                <div className="totals-row">
                  <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">🏢</i>Fixed Expenses / Qtr</span>
                  <span className="totals-row__value">${fixedExpenses.toLocaleString()}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">💰</i>Total Revenue</span>
                  <span className="totals-row__value totals-row__value--positive">${gs.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-row__label"><i className="trow-ic" aria-hidden="true">🧾</i>Total Costs</span>
                  <span className="totals-row__value">${gs.totalCosts.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <SmartPlayTip category="department" />
        </div>
      </div>

      <button className="end-turn-fab" data-tour="endquarter" onClick={onRequestEndQuarter} title="End the quarter whenever you're ready">
        ▶ End Quarter
      </button>

      <HireModal
        open={showHire}
        onClose={() => setShowHire(false)}
        gs={gs}
        onHire={onHire}
        onShowToast={onShowToast}
      />
    </div>
  )
}

function StatCard({ label, value, sub, progress, progressTone, icon }) {
  return (
    <div className="game-stat-card">
      {icon && <div className="game-stat-card__icon" aria-hidden="true">{icon}</div>}
      <div className="game-stat-card__body">
      <div className="game-stat-card__label">{label}</div>
      <div className="game-stat-card__value">{value}</div>
      {sub && <div className="game-stat-card__sub">{sub}</div>}
      {typeof progress === 'number' && (
        <div className={'stat-progress' + (progressTone ? ' stat-progress--' + progressTone : '')}>
          <i style={{ width: Math.max(0, Math.min(100, progress * 100)) + '%' }} />
        </div>
      )}
      </div>
    </div>
  )
}
