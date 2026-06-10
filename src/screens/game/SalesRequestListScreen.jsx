import React from 'react'
import { getProjectById, renderStars } from '../../data/projects.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'

export default function SalesRequestListScreen({ gs, onGoBack, onOpenProject }) {
  const acceptedIds = new Set(gs.activeProjects.map((p) => p.id))
  const completedIds = new Set((gs.completedProjects || []).map((p) => p.id))
  const rejectedIds = new Set(gs.quarterRejectedIds || [])

  // Sales capacity sets how many briefs are offered this quarter.
  // Specialist = 2 briefs; Consultant = 4 briefs. The set is fixed for the
  // quarter and never refills — once a brief is accepted or rejected it leaves
  // the list (accepted briefs move to Active Projects). More briefs appear only
  // when you hire additional Sales staff, or next quarter.
  const sales = gs.departments.find((d) => d.id === 'sales') || { specialists: 0, consultants: 0 }
  const salesCapacity = sales.specialists * 2 + sales.consultants * 4

  const offered = (gs.quarterBriefIds || []).map(getProjectById).filter(Boolean)
  // Show only briefs still awaiting a decision.
  const projects = offered.filter(
    (p) => !acceptedIds.has(p.id) && !rejectedIds.has(p.id) && !completedIds.has(p.id)
  )
  const handledAny = offered.length > 0 && projects.length === 0

  return (
    <div>
      <button className="back-btn" onClick={onGoBack}>Back to Home</button>

      <TutorialOverlay
        screenId="sales-requests"
        title="Sales Requests"
        steps={[
          'These are the project briefs your Sales department surfaced this quarter.',
          'How many briefs appear depends on your sales staff: specialist = 2 briefs, consultant = 4 briefs.',
          'Accepting or rejecting a brief removes it from this list — accepted briefs move to Active Projects. New briefs appear when you hire more Sales staff or next quarter.',
        ]}
      />

      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="section-label">Q{gs.yearQuarter}, Year {gs.currentYear}</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
          Sales Requests
        </h1>
        <p style={{ fontSize: 14, color: 'var(--c-text-muted)' }}>
          {projects.length} brief{projects.length !== 1 ? 's' : ''} awaiting a decision -{' '}
          sales capacity {salesCapacity} ({sales.specialists} specialist x 2 + {sales.consultants} consultant x 4) -{' '}
          {gs.activeProjects.length}/{MAX_ACTIVE_PROJECTS} project slots used
        </p>
      </div>

      <SmartPlayTip category="project" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-5)' }}>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>(none)</div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, marginBottom: 6 }}>
              {handledAny ? 'All briefs handled this quarter' : 'No briefs this quarter'}
            </div>
            <div style={{ fontSize: 13 }}>
              {salesCapacity === 0
                ? 'Hire a Sales specialist or consultant to start surfacing briefs.'
                : handledAny
                  ? 'Hire more Sales staff to surface more briefs now, or end the quarter for a fresh set.'
                  : 'Check back next quarter, or invest in your Forecast to anticipate upcoming opportunities.'}
            </div>
          </div>
        )}

        {projects.map((proj) => (
          <button
            key={proj.id}
            className="project-card"
            onClick={() => onOpenProject(proj)}
            style={{ textAlign: 'left', fontFamily: 'inherit', position: 'relative' }}
          >
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
              <div className="project-card__revenue">{proj.revenue.toLocaleString()} Ħ</div>
              <div className="project-card__duration">{proj.durationQuarters} qtr</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
