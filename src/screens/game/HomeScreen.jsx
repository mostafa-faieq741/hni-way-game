/**
 * HomeScreen.jsx
 * Main game dashboard — stat bar, sales request CTA, department grid,
 * and company totals sidebar.
 */

import React from 'react'
import { mergeDepartments } from '../../data/departments.js'
import { getProjectsForQuarter } from '../../data/projects.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function HomeScreen({ gs, onNavigate }) {
  const departments = mergeDepartments(gs.departments)
  const salesRequests = getProjectsForQuarter(gs.overallQuarter)
  const activeDepts = departments.filter((d) => d.isActive)

  const totalEmployees = gs.departments.reduce(
    (sum, d) => sum + d.specialists + d.consultants, 0
  )
  const fixedExpenses = gs.departments.reduce(
    (sum, d) =>
      sum +
      d.specialists * GAME_CONFIG.specialistCostPerQuarter +
      d.consultants * GAME_CONFIG.consultantCostPerQuarter,
    0
  )

  return (
    <div>
      {/* ── Top stat bar ── */}
      <div className="game-stat-bar">
        <StatCard label="Cash" value={`$${gs.cash.toLocaleString()}`} sub="Available" />
        <StatCard
          label="Quarter"
          value={`Q${gs.yearQuarter}`}
          sub={`Year ${gs.currentYear} of 5 · Overall Q${gs.overallQuarter}`}
        />
        <StatCard label="Employees" value={totalEmployees} sub="Active staff" />
        <StatCard
          label="Reputation"
          value={gs.reputation}
          sub={gs.reputation >= GAME_CONFIG.winReputationThreshold ? '✅ Leaderboard qualified' : `Need ${GAME_CONFIG.winReputationThreshold} to qualify`}
        />
      </div>

      {/* ── Main layout ── */}
      <div className="home-layout">
        {/* Left: main content */}
        <div className="home-main">
          {/* Sales request CTA */}
          <button
            className="sales-request-card"
            onClick={() => onNavigate('sales-requests')}
          >
            <div>
              <div className="sales-request-card__label">Open Opportunities</div>
              <div className="sales-request-card__title">Sales Requests</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                Review and accept project briefs for this quarter
              </div>
            </div>
            <div className="sales-request-card__count">
              {salesRequests.length}
            </div>
          </button>

          {/* Department grid */}
          <div className="game-section-header">
            <span className="game-section-title">Departments</span>
            <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
              {activeDepts.length} active · {departments.length - activeDepts.length} inactive
            </span>
          </div>

          <div className="dept-grid">
            {departments.map((dept) => (
              <button
                key={dept.id}
                className={`dept-card${dept.isActive ? '' : ' dept-card--inactive'}`}
                onClick={() => dept.isActive && onNavigate('dept-detail', { dept })}
                title={dept.isActive ? `Open ${dept.name}` : `Hire staff to activate ${dept.name}`}
                style={{ textAlign: 'left', fontFamily: 'inherit' }}
              >
                {dept.isActive && <div className="dept-card__active-dot" />}
                <div className="dept-card__icon">{dept.icon}</div>
                <div className="dept-card__name">{dept.name}</div>
                <div className="dept-card__staff">
                  {dept.isActive
                    ? `${dept.specialists}S · ${dept.consultants}C`
                    : 'Inactive'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="home-sidebar">
          {/* Company totals */}
          <div className="totals-panel">
            <div className="totals-panel__title">Company Totals</div>
            <div className="totals-row">
              <span className="totals-row__label">Net Profit</span>
              <span className={`totals-row__value ${gs.netProfit >= 0 ? 'totals-row__value--positive' : 'totals-row__value--negative'}`}>
                ${gs.netProfit.toLocaleString()}
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
              <span className="totals-row__value">{gs.activeProjects.length}</span>
            </div>
            <div className="totals-row">
              <span className="totals-row__label">Active Departments</span>
              <span className="totals-row__value">{activeDepts.length}</span>
            </div>
          </div>

          {/* Active projects list */}
          {gs.activeProjects.length > 0 && (
            <div className="totals-panel">
              <div className="totals-panel__title">Active Projects</div>
              {gs.activeProjects.map((proj) => (
                <div key={proj.id} className="totals-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span style={{ fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 700 }}>
                    {proj.code}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>
                    {proj.quartersLeft} quarter{proj.quartersLeft !== 1 ? 's' : ''} remaining
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Smart tip */}
          <SmartPlayTip category="department" />
        </div>
      </div>
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
