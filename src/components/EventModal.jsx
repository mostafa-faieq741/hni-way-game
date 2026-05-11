/**
 * EventModal.jsx
 * Generic event modal. Renders one or more options.
 * If event.mandatory is true the only path is to choose the (single) option.
 */

import React from 'react'

export default function EventModal({ event, onResolve }) {
  if (!event) return null

  return (
    <>
      <div className="event-overlay" />

      <div className="event-modal" role="dialog" aria-modal="true" aria-label={event.title}>
        <div className="event-modal__icon" aria-hidden="true">{event.icon ?? '📌'}</div>

        <div className="section-label" style={{ color: 'var(--c-primary)' }}>
          {event.mandatory ? 'Mandatory event' : 'Decision required'}
        </div>

        <h2 className="event-modal__title">{event.title}</h2>
        <p className="event-modal__body">{event.body}</p>

        <div className="event-modal__options">
          {event.options.map((opt) => (
            <button
              key={opt.id}
              className="btn btn--primary event-modal__option"
              onClick={() => onResolve(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
