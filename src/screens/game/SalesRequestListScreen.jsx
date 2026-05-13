import React from 'react'
import { getProjectsForQuarter, renderStars } from '../../data/projects.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'

export default function SalesRequestListScreen({ gs, onGoBack, onOpenProject }) {
  const allProjects = getProjectsForQuarter(gs.overallQuarter)
  const acceptedIds = new Set(gs.activeProjects.map((p) => p.id))
  const completedIds = new Set((gs.completedProjects || []).map((p) => p.id))
  const rejectedIds = new Set(gs.rejectedIds || [])

  // Sales capacity caps how many briefs surface this quarter.
  // Specialist = 2 briefs; Consultant = 4 briefs.
  const sales = gs.departments.find((d) => d.id === 'sales') || { specialists: 0, consultants: 0 }
  const salesCapacity = sales.specialists * 2 + sales.consultants * 4

  const filtered = allProjects.filter((p) =>
    !rejectedIds.has(p.id) && !completedIds.has(p.id)
  )
  // Slice by capacity but keep already-accepted briefs visible too
  const visibleNew = filtered.filter((p) => !acceptedIds.has(p.id)).slice(0, salesCapacity)
  const visibleAccepted = filtered.filter((p) => acceptedIds.has(p.id))
  const projects = [...visibleNew, ...visibleAccepted]

  return (
    <div>
      <button className="back-btn" onClick={onGoBack}>Back to Home</button>

      <TutorialOverlay
        screenId="sales-requests"
        title="Sales Requests"
        steps={[
          'These are project briefs your Sales team has surfaced this quarter.',
          'How many briefs appear depends on your sales staff: specialist = 2 briefs, consultant = 4 briefs.',
          'Rejected briefs disappear from the list. You can hold up to 8 active projects at the same time.',
        ]}
      />

      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="section-label">Q{gs.yearQuarter}, Year {gs.currentYear}</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
          Sales Requests
        </h1>
        <p style={{ fontSize: 14, color: 'var(--c-text-muted)' }}>
          {projects.length} brief{projects.length !== 1 ? 's' : ''} available -{' '}
          sales capacity {salesCapacity} ({sales.specialists} specialist x 2 + {sales.consultants} consultant x 4) -{' '}
          {gs.activeProjects.length}/{MAX_ACTIVE_PROJECTS} project slots used
        </p>
      </div>

      <SmartPlayTip category="project" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-5)' }}>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>(none)</div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, marginBottom: 6 }}>No briefs available this quarter</div>
            <div style={{ fontSize: 13 }}>
              {salesCapacity === 0
                ? 'Hire a Sales specialist or consultant to start generating briefs.'
                : 'Check back next quarter or invest in your Forecast to anticipate upcoming opportunities.'}
            </div>
          </div>
        )}

        {projects.map((proj) => {
          const isAccepted = acceptedIds.has(proj.id)
          return (
            <button
              key={proj.id}
              className="project-card"
              onClick={() => onOpenProject(proj)}
              style={{ textAlign: 'left', fontFamily: 'inherit', position: 'relative' }}
            >
              {isAccepted && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'var(--c-success-bg)', border: '1px solid #a7d8bc',
                  borderRadius: 'var(--r-full)', padding: '2px 10px',
                  fontFamily: 'var(--f-heading)', fontSize: 11, fontWeight: 700, color: 'var(--c-success)',
                }}>
                  Accepted
                </div>
              )}
              <div>
                <div className="project-card__code">{proj.code}</div>
                <div className="project-card__title">{proj.title}</div>
                <div className="project-card__meta">
                  <span className="project-card__stars">{renderStars(proj.stars)}</span>
                  <span>- {proj.durationQuarters} quarter{proj.durationQuarters !== 1 ? 's' : ''}</span>
                  <span>- Min rep: {proj.minReputation}</span>
                </div>
              </div>
              <div>
                <div className="project-card__revenue">${proj.revenue.toLocaleString()}</div>
                <div className="project-card__duration">{proj.durationQuarters} qtr</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
