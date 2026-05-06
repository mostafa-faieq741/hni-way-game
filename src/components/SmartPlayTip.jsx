/**
 * SmartPlayTip.jsx
 * A subtle, reusable tip callout shown at the top of contextual game screens.
 * Picks one random tip per category on mount. Uses the existing .tip-box CSS class.
 *
 * @prop {'project'|'department'|'finance'} category
 */

import React, { useState } from 'react'
import { pickTip } from '../data/smartTips.js'

export default function SmartPlayTip({ category }) {
  const [tip] = useState(() => pickTip(category))
  if (!tip) return null

  return (
    <div className="tip-box" style={{ marginBottom: 0 }}>
      <div className="tip-box__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#8a6900" strokeWidth="1.8"/>
          <line x1="12" y1="11" x2="12" y2="17" stroke="#8a6900" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="7.5" r="1.2" fill="#8a6900"/>
        </svg>
      </div>
      <div className="tip-box__text">
        <div className="tip-box__label">Smart Play Tip</div>
        {tip}
      </div>
    </div>
  )
}
