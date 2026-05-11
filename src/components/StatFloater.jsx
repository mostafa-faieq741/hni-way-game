/**
 * StatFloater.jsx
 * Renders a stack of small floating "+/-" indicators that fade out.
 *
 * Driven by a `floats` array: [{ id, text, type:'positive'|'negative'|'neutral' }]
 */

import React from 'react'

export default function StatFloater({ floats = [] }) {
  if (!floats.length) return null
  return (
    <div className="stat-floater-stack" aria-live="polite">
      {floats.map((f) => (
        <div
          key={f.id}
          className={`stat-floater stat-floater--${f.type}`}
          role="status"
        >
          {f.text}
        </div>
      ))}
    </div>
  )
}
