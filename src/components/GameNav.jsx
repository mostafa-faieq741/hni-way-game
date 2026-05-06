/**
 * GameNav.jsx
 * Bottom three-tab navigation bar shown on the main game screens
 * (Home, Forecast, Finance). Hidden on contextual screens.
 *
 * @prop {'home'|'forecast'|'finance'} activeScreen
 * @prop {function} onNavigate  – called with the tab id string
 */

import React from 'react'
import HNILogo from './HNILogo.jsx'

const TABS = [
  { id: 'home',     label: 'Home',     icon: HomeIcon },
  { id: 'forecast', label: 'Forecast', icon: ForecastIcon },
  { id: 'finance',  label: 'Finance',  icon: FinanceIcon },
]

export default function GameNav({ activeScreen, onNavigate }) {
  return (
    <nav className="app-nav" style={{ justifyContent: 'center', gap: 0, padding: '0 16px' }}>
      {TABS.map((tab) => {
        const isActive = activeScreen === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            4,
              flex:           1,
              maxWidth:       120,
              padding:        '8px 0',
              background:     'none',
              border:         'none',
              borderTop:      isActive ? '2px solid var(--c-primary)' : '2px solid transparent',
              cursor:         'pointer',
              transition:     'all 120ms ease',
              color:          isActive ? 'var(--c-primary)' : 'var(--c-text-muted)',
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <tab.icon active={isActive} />
            <span style={{
              fontFamily:  'var(--f-heading)',
              fontSize:    11,
              fontWeight:  isActive ? 700 : 600,
              letterSpacing: '0.04em',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ── Icon components ───────────────────────────────────────────────────────────

function HomeIcon({ active }) {
  const c = active ? 'var(--c-primary)' : 'var(--c-text-muted)'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12L12 3L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  )
}

function ForecastIcon({ active }) {
  const c = active ? 'var(--c-primary)' : 'var(--c-text-muted)'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function FinanceIcon({ active }) {
  const c = active ? 'var(--c-primary)' : 'var(--c-text-muted)'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8"/>
      <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke={c} strokeWidth="1.8"/>
      <line x1="12" y1="12" x2="12" y2="16" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="10" y1="14" x2="14" y2="14" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
