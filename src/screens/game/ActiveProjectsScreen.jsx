/**
 * ActiveProjectsScreen.jsx
 * List of currently active + overdue projects.
 * Delivered/rejected projects are NOT shown here.
 */

import React from 'react'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import { renderStars } from '../../data/projects.js'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'

export default function ActiveProjectsScreen({ gs, onGoBack, onOpenActive }) {
  const projects = gs.activeProjects ?? []

  return (
    <div>
      <button className="back-btn" onClick={onGoBack}>← Back to Home</button>

      <TutorialOverlay
        screenId="active-projects"
        title="Active Projects"
        steps={[
          'These are the projects you have already accepted that are still running.',
          'Each tile shows the planned end quarter and any overdue penalties.',
          'You can hold up to 8 projects at the same time. Deliver them before taking on more.',
        ]}
      />

      <div style={{ marginBottom: 'var(--sp-5)' }}>
        <div className="section-label">Pipeline</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
          Active Projects
        </h1>
        <p style={{ fontSize: 14, color: 'var(--c-text-muted)' }}>
          {projects.length} of {MAX_ACTIVE_PROJECTS} max concurrent active. Delivered &amp; rejected projects are tracked in your reports.
        </p>
      </div>

      <SmartPlayTip category="project" />

      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, marginBottom: 6 }}>No active projects</div>
          <div style={{ fontSize: 13 }}>Visit Sales Requests to accept new project briefs.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-5)' }}>
          {projects.map((p) => {
            const overdue = p.status === 'overdue'
            return (
              <button
                key={p.id}
                className="active-proj-card"
                onClick={() => onOpenActive?.(p)}
                style={{ textAlign: 'left', fontFamily: 'inherit' }}
              >
                <div className="active-proj-card__head">
                  <div>
                    <div className="project-card__code">{p.code}</div>
                    <div className="project-card__title">{p.title}</div>
                  </div>
                  <span className={`status-pill status-pill--${overdue ? 'overdue' : 'active'}`}>
                    {overdue ? 'Overdue' : 'Active'}
                  </span>
                </div>

                <div className="active-proj-card__meta">
                  <span>{renderStars(p.stars)}</span>
                  <span>· {p.durationQuarters} qtr planned</span>
                  <span>· {Math.max(0, p.quartersLeft)} left</span>
                  {overdue && <span style={{ color: 'var(--c-error)' }}>· {p.overdueQuarters} overdue qtr{p.overdueQuarters !== 1 ? 's' : ''}</span>}
                </div>

                <div className="active-proj-card__grid">
                  <Stat label="Cost paid"      value={`$${p.cost.toLocaleString()}`} />
                  <Stat label="Expected revenue" value={`$${p.revenue.toLocaleString()}`} positive />
                  <Stat label="Reputation impact" value={`+${p.reputationImpact}`} />
                  <Stat label="Extra cost so far" value={`$${(p.extraCosts ?? 0).toLocaleString()}`} negative={p.extraCosts > 0} />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, positive, negative }) {
  return (
    <div className="active-proj-stat">
      <div className="active-proj-stat__label">{label}</div>
      <div
        className="active-proj-stat__value"
        style={{
          color: positive ? 'var(--c-success)' : negative ? 'var(--c-error)' : 'var(--c-text)',
        }}
      >
        {value}
      </div>
    </div>
  )
}
