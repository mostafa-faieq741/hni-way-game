/**
 * EventModal.jsx
 * Generic event modal. Renders each option with a clear breakdown of
 * cost / benefit underneath the action button.
 */

import React from 'react'

function formatEffect(effect = {}) {
  const rows = []
  if (effect.cash) {
    const sign = effect.cash > 0 ? '+' : '-'
    rows.push({
      text: sign + '$' + Math.abs(effect.cash).toLocaleString() + ' cash',
      tone: effect.cash > 0 ? 'positive' : 'negative',
    })
  }
  if (effect.reputation) {
    const sign = effect.reputation > 0 ? '+' : ''
    rows.push({
      text: sign + effect.reputation + ' reputation',
      tone: effect.reputation > 0 ? 'positive' : 'negative',
    })
  }
  if (effect.fixedExpenses) {
    const sign = effect.fixedExpenses > 0 ? '+' : '-'
    rows.push({
      text: sign + '$' + Math.abs(effect.fixedExpenses).toLocaleString() + ' fixed expenses/qtr',
      tone: 'negative',
    })
  }
  if (rows.length === 0) {
    rows.push({ text: 'No financial impact', tone: 'neutral' })
  }
  return rows
}

export default function EventModal({ event, onResolve }) {
  if (!event) return null

  return (
    <>
      <div className="event-overlay" />

      <div className="event-modal" role="dialog" aria-modal="true" aria-label={event.title}>
        <div className="event-modal__icon" aria-hidden="true">{event.icon || '!'}</div>

        <div className="section-label" style={{ color: 'var(--c-primary)' }}>
          {event.mandatory ? 'Mandatory event' : 'Decision required'}
        </div>

        <h2 className="event-modal__title">{event.title}</h2>
        <p className="event-modal__body">{event.body}</p>

        <div className="event-modal__options">
          {event.options.map((opt) => {
            const effects = formatEffect(opt.effect)
            return (
              <button
                key={opt.id}
                className="btn btn--primary event-modal__option"
                onClick={() => onResolve(opt)}
                style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '10px 14px' }}
              >
                <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 14 }}>
                  {opt.label}
                </span>
                <div className="event-option-effect">
                  {effects.map((row, i) => (
                    <span
                      key={i}
                      className={'event-option-effect__row event-option-effect__row--' + row.tone}
                    >
                      {row.text}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
