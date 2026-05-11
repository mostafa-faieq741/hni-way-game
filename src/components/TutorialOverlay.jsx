/**
 * TutorialOverlay.jsx
 * One-time tutorial banner per screen. Stored in localStorage.
 *
 * Usage:
 *   <TutorialOverlay screenId="home" title="Home" steps={[...]} />
 *
 * Also exports clearAllTutorials() for the reset flow.
 */

import React, { useEffect, useState } from 'react'

const STORAGE_KEY = 'hni_demo_tutorials_seen'

function loadSeen() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return {} }
}
function saveSeen(seen) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seen)) } catch {}
}

export function clearAllTutorials() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

export default function TutorialOverlay({ screenId, title, steps = [] }) {
  const [seen, setSeen]       = useState(() => loadSeen())
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!seen[screenId]) setVisible(true)
  }, [screenId, seen])

  if (!visible || steps.length === 0) return null

  const dismiss = (markSeen) => {
    setVisible(false)
    if (markSeen) {
      const next = { ...seen, [screenId]: true }
      setSeen(next)
      saveSeen(next)
    }
  }

  return (
    <div className="tutorial-overlay" role="dialog" aria-label={`${title} tutorial`}>
      <div className="tutorial-overlay__head">
        <div>
          <div className="section-label" style={{ color: 'var(--c-primary)' }}>Tutorial</div>
          <div className="tutorial-overlay__title">{title}</div>
        </div>
        <button
          className="tutorial-overlay__close"
          onClick={() => dismiss(true)}
          aria-label="Close tutorial"
        >×</button>
      </div>

      <ol className="tutorial-overlay__steps">
        {steps.map((s, i) => (
          <li key={i}>
            <span className="tutorial-overlay__num">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div className="tutorial-overlay__actions">
        <button className="btn btn--primary btn--sm" onClick={() => dismiss(true)}>
          Got it
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => dismiss(false)}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
