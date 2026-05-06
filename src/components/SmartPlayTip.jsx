/**
 * SmartPlayTip.jsx
 * Shows a random tip as a modal popup when the screen first loads.
 * User clicks "Got it" to dismiss.
 *
 * @prop {'project'|'department'|'finance'} category
 */

import React, { useState } from 'react'
import { pickTip } from '../data/smartTips.js'

export default function SmartPlayTip({ category }) {
  const [tip]     = useState(() => pickTip(category))
  const [visible, setVisible] = useState(true)

  if (!tip || !visible) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setVisible(false)}
        style={styles.overlay}
        aria-label="Close tip"
      />

      {/* Modal */}
      <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Smart Play Tip">

        {/* Icon circle */}
        <div style={styles.iconCircle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="1.8"/>
            <line x1="12" y1="11" x2="12" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="7.5" r="1.2" fill="#fff"/>
          </svg>
        </div>

        {/* Label */}
        <div style={styles.label}>Smart Play Tip</div>

        {/* Tip text */}
        <p style={styles.text}>{tip}</p>

        {/* OK button */}
        <button
          className="btn btn--primary"
          onClick={() => setVisible(false)}
          style={{ minWidth: 140, marginTop: 8, alignSelf: 'center' }}
          autoFocus
        >
          Got it
        </button>
      </div>
    </>
  )
}

const styles = {
  overlay: {
    position:   'fixed',
    inset:      0,
    background: 'rgba(35, 31, 32, 0.45)',
    zIndex:     200,
    animation:  'tipFadeIn 180ms ease both',
  },
  modal: {
    position:        'fixed',
    top:             '50%',
    left:            '50%',
    transform:       'translate(-50%, -50%)',
    zIndex:          201,
    background:      'var(--c-surface)',
    borderRadius:    'var(--r-xl)',
    boxShadow:       '0 8px 40px rgba(35,31,32,0.22), 0 2px 8px rgba(145,25,90,0.1)',
    border:          '1px solid var(--c-border)',
    padding:         '36px 32px 28px',
    maxWidth:        420,
    width:           'calc(100vw - 40px)',
    display:         'flex',
    flexDirection:   'column',
    alignItems:      'center',
    textAlign:       'center',
    gap:             12,
    animation:       'tipPopIn 220ms cubic-bezier(0.175,0.885,0.32,1.275) both',
  },
  iconCircle: {
    width:           48,
    height:          48,
    borderRadius:    '50%',
    background:      'var(--c-gold)',
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    marginBottom:    4,
  },
  label: {
    fontFamily:      'var(--f-heading)',
    fontWeight:      700,
    fontSize:        11,
    letterSpacing:   '0.12em',
    textTransform:   'uppercase',
    color:           '#8a6900',
  },
  text: {
    fontSize:        15,
    color:           'var(--c-text)',
    lineHeight:      1.65,
    maxWidth:        340,
    margin:          0,
  },
}
