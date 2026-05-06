import React from 'react'
import { objectives } from '../data/gameData.js'

/**
 * ObjectivesScreen
 * ─────────────────────────────────────────────────
 * Shows the win condition and game summary stats.
 */

// Trophy SVG icon
function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0012 0V2z" />
    </svg>
  )
}

// Stat icons
const statIcons = {
  'Quarters':        (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  'Departments':     (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  'Active Projects': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
}

export default function ObjectivesScreen() {
  return (
    <div className="screen">
      {/* Page header */}
      <div className="objectives-screen__header">
        <span className="section-label">{objectives.sectionLabel}</span>
        <h1 className="objectives-screen__page-title">Overview &amp; Objective</h1>
      </div>

      {/* Win condition card */}
      <div className="objective-card">
        <div className="objective-card__win-label">
          <TrophyIcon />
          {objectives.winConditionLabel}
        </div>
        <p className="objective-card__statement">{objectives.winStatement}</p>
        <ul className="objective-card__bullets">
          {objectives.bullets.map((b, i) => (
            <li key={i} className="objective-bullet">
              <span className="objective-bullet__dot" aria-hidden="true" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary stat cards */}
      <div className="stat-cards">
        {objectives.stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ marginBottom: 8 }}>
              {statIcons[s.label] || null}
            </div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
            {s.sub && <div className="stat-card__sub">{s.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
