/**
 * HomeScreen.jsx
 * Main game dashboard.
 */

import React, { useState } from 'react'
import { mergeDepartments } from '../../data/departments.js'
import { getProjectsForQuarter } from '../../data/projects.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import HireModal from '../../components/HireModal.jsx'

export default function HomeScreen({ gs, onNavigate, onHire, onShowToast }) {
  const [showHire, setShowHire] = useState(false)
  const departments = mergeDepartments(gs.departments)
  const allProjects = getProjectsForQuarter(gs.overallQuarter)
  const acceptedIds = new Set(gs.activeProjects.map((p) => p.id))
  const completedIds = new Set((gs.completedProjects || []).map((p) => p.id))
  const rejectedIds = new Set(gs.rejectedIds || [])

  // Sales capacity: specialist = 2 briefs/qtr, consultant = 4 briefs/qtr.
  const sales = gs.departments.find((d) => d.id === 'sales') || { specialists: 0, consultants: 0 }
  const salesCapacity = sales.specialists * 2 + sales.consultants * 4

  const availablePool = allProjects.filter((p) =>
    !rejectedIds.has(p.id) && !completedIds.has(p.id) && !acceptedIds.has(p.id)
  )
  // Cap the visible request count by sales staff capacity.
  const salesRequests = availablePool.slice(0, salesCapacity)

  const activeDepts = departments.filter((d) => d.isActive)

  const totalEmployees = gs.departments.reduce(
    (sum, d) => sum + d.specialists + d.consultants, 0
  )
  const fixedExpenses = gs.departments.reduce(
    (sum, d) => sum +
      d.specialists * GAME_CONFIG.specialistCostPerQuarter +
      d.consultants * GAME_CONFIG.consultantCostPerQuarter,
    0
  )

  const overdueCount = gs.activeProjects.filter((p) => p.status === 'overdue').length

  // Cash flow for the last quarter = revenue - fixed expenses - overdue penalties
  const lastQtrCashFlow = gs.lastResolution
    ? (gs.lastResolution.revenueGained || 0)
      - (gs.lastResolution.fixedExpenses || 0)
      - (gs.lastResolution.extraCostsAdded || 0)
    : null

  return (
    <div>
      <TutorialOverlay
        screenId="home"
        title="Home"
        steps={[
          'This is your dashboard. The top bar shows cash, quarter, employees, reputation, and the quarter timer.',
          'Open Sales Requests to accept new project briefs.',
          'Use the Hire button to activate inactive departments by hiring directly from Home. HR must be your first hire.',
          'Click any active department to manage staffing in detail.',
          'Visit Active Projects to see what is in delivery.',
        ]}
      />

      <div className="game-stat-bar">
        <StatCard label="Cash" value={'$' + gs.cash.toLocaleString()} sub="Available" />
        <StatCard
          label="Quarter"
          value={'Q' + gs.yearQuarter}
          sub={'Year ' + gs.currentYear + ' of 5 - Overall Q' + gs.overallQuarter}
        />
        <StatCard label="Employees" value={totalEmployees} sub="Active staff" />
        <StatCard
          label="Reputation"
          value={gs.reputation}
          sub={gs.reputation > GAME_CONFIG.winReputationThreshold
            ? 'Leaderboard qualified'
            : 'Need >' + GAME_CONFIG.winReputationThreshold + ' to qualify'}
        />
      </div>

      <div className="home-layout">
        <div className="home-main">
          <button className="sales-request-card" onClick={() => onNavigate('sales-requests')}>
            <div>
              <div className="sales-request-card__label">Open Opportunities</div>
              <div className="sales-request-card__title">Sales Requests</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                {salesRequests.length} brief{salesRequests.length !== 1 ? 's' : ''} this quarter
                {salesCapacity > 0
                  ? ' (sales capacity ' + salesCapacity + ')'
                  : ' (hire sales to surface briefs)'}
              </div>
            </div>
            <div className="sales-request-card__count">{salesRequests.length}</div>
          </button>

          <button
            className="sales-request-card sales-request-card--alt"
            onClick={() => onNavigate('active-projects')}
            style={{ marginTop: 'var(--sp-4)' }}
          >
            <div>
              <div className="sales-request-card__label" style={{ color: 'rgba(255,255,255,0.85)' }}>Pipeline</div>
              <div className="sales-request-card__title">Active Projects</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                {gs.activeProjects.length}/{MAX_ACTIVE_PROJECTS} active - {overdueCount} overdue
              </div>
            </div>
            <div className="sales-request-card__count">{gs.activeProjects.length}</div>
          </button>

          <div className="game-section-header" style={{ marginTop: 'var(--sp-6)' }}>
            <span className="game-section-title">Departments</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                {activeDepts.length} active - {departments.length - activeDepts.length} inactive
              </span>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => setShowHire(true)}
                title="Hire into any department"
              >
                + Hire
              </button>
            </div>
          </div>

          <div className="dept-grid">
            {departments.map((dept) => (
              <button
                key={dept.id}
                className={'dept-card' + (dept.isActive ? '' : ' dept-card--inactive')}
                onClick={() =>
                  dept.isActive
                    ? onNavigate('dept-detail', { dept })
                    : setShowHire(true)
                }
                title={dept.isActive ? 'Open ' + dept.name : 'Hire to activate ' + dept.name}
                style={{ textAlign: 'left', fontFamily: 'inherit' }}
              >
                {dept.isActive && <div className="dept-card__active-dot" />}
                <div className="dept-card__icon">{dept.icon}</div>
                <div className="dept-card__name">{dept.name}</div>
                <div className="dept-card__staff">
                  {dept.isActive ? dept.specialists + 'S - ' + dept.consultants + 'C' : 'Tap to hire'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="home-sidebar">
          <div className="totals-panel">
            <div className="totals-panel__title">Company Totals</div>
            <div className="totals-row">
              <span className="totals-row__label">Net Profit</span>
              <span className={'totals-row__value ' + (gs.netProfit >= 0 ? 'totals-row__value--positive' : 'totals-row__value--negative')}>
                ${gs.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Cash Flow (last qtr)</span>
              <span className={'totals-row__value ' + (lastQtrCashFlow === null ? '' : (lastQtrCashFlow >= 0 ? 'totals-row__value--positive' : 'totals-row__value--negative'))}>
                {lastQtrCashFlow === null
                  ? '—'
                  : (lastQtrCashFlow >= 0 ? '+$' : '-$') + Math.abs(lastQtrCashFlow).toLocaleString()}
              </span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Fixed Expenses / Qtr</span>
              <span className="totals-row__value">${fixedExpenses.toLocaleString()}</span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Total Revenue</span>
              <span className="totals-row__value totals-row__value--positive">
                ${gs.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Total Costs</span>
              <span className="totals-row__value">${gs.totalCosts.toLocaleString()}</span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Active Projects</span>
              <span className="totals-row__value">{gs.activeProjects.length}/{MAX_ACTIVE_PROJECTS}</span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Active Departments</span>
              <span className="totals-row__value">{activeDepts.length}</span>
            </div>
          </div>

          {gs.activeProjects.length > 0 && (
            <div className="totals-panel">
              <div className="totals-panel__title">Active Projects</div>
              {gs.activeProjects.slice(0, 5).map((proj) => (
                <div key={proj.id} className="totals-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 700 }}>
                    {proj.code}
                  </span>
                  <span style={{ fontSize: 11, color: proj.status === 'overdue' ? 'var(--c-error)' : 'var(--c-text-muted)' }}>
                    {proj.status === 'overdue'
                      ? 'Overdue - ' + proj.overdueQuarters + ' qtr'
                      : proj.quartersLeft + ' qtr left'}
                  </span>
                </div>
              ))}
              {gs.activeProjects.length > 5 && (
                <button
                  onClick={() => onNavigate('active-projects')}
                  style={{
                    background: 'none', border: 'none', color: 'var(--c-primary)',
                    fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700,
                    padding: '6px 0', cursor: 'pointer',
                  }}
                >
                  View all
                </button>
              )}
            </div>
          )}

          <SmartPlayTip category="department" />
        </div>
      </div>

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

function StatCard({ label, value, sub }) {
  return (
    <div className="game-stat-card">
      <div className="game-stat-card__label">{label}</div>
      <div className="game-stat-card__value">{value}</div>
      {sub && <div className="game-stat-card__sub">{sub}</div>}
    </div>
  )
}
