/**
 * SalesRequestListScreen.jsx
 * Shows available project briefs for the current quarter.
 * Clicking a card opens ProjectDetailScreen.
 */

import React from 'react'
import { getProjectsForQuarter, renderStars } from '../../data/projects.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function SalesRequestListScreen({ gs, onGoBack, onOpenProject }) {
  const projects = getProjectsForQuarter(gs.overallQuarter)
  const acceptedIds = new Set(gs.activeProjects.map((p) => p.id))

  return (
    <div>
      {/* Back */}
      <button className="back-btn" onClick={onGoBack}>← Back to Home</button>

      {/* Header */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div className="section-label">Q{gs.yearQuarter}, Year {gs.currentYear}</div>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
          Sales Requests
        </h1>
        <p style={{ fontSize: 14, color: 'var(--c-text-muted)' }}>
          {projects.length} project brief{projects.length !== 1 ? 's' : ''} available this quarter. You can accept more than one.
        </p>
      </div>

      <SmartPlayTip category="project" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginTop: 'var(--sp-5)' }}>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, marginBottom: 6 }}>No briefs available this quarter</div>
            <div style={{ fontSize: 13 }}>Check back next quarter or invest in your Forecast to anticipate upcoming opportunities.</div>
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
                  ✓ Accepted
                </div>
              )}
              <div>
                <div className="project-card__code">{proj.code}</div>
                <div className="project-card__title">{proj.title}</div>
                <div className="project-card__meta">
                  <span className="project-card__stars">{renderStars(proj.stars)}</span>
                  <span>· {proj.durationQuarters} quarter{proj.durationQuarters !== 1 ? 's' : ''}</span>
                  <span>· Min rep: {proj.minReputation}</span>
                  <span>· {proj.matchedDepartments.length} dept{proj.matchedDepartments.length !== 1 ? 's' : ''}</span>
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
