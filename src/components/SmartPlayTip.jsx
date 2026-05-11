/**
 * SmartPlayTip.jsx
 * Non-blocking smart-play tip card. Dismissible, does not cover the screen.
 */

import React, { useState } from 'react'
import { pickTip } from '../data/smartTips.js'

export default function SmartPlayTip({ category }) {
  const [tip] = useState(() => pickTip(category))
  const [visible, setVisible] = useState(true)

  if (!tip || !visible) return null

  return (
    <div className="smart-tip" role="status" aria-label="Smart Play Tip">
      <div className="smart-tip__icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx="12" cy="7.5" r="1.2" fill="currentColor"/>
        </svg>
      </div>
      <div className="smart-tip__body">
        <div className="smart-tip__label">Smart Play Tip</div>
        <div className="smart-tip__text">{tip}</div>
      </div>
      <button
        className="smart-tip__close"
        onClick={() => setVisible(false)}
        aria-label="Dismiss tip"
        title="Dismiss"
      >
        x
      </button>
    </div>
  )
}
