/**
 * GlossaryModal.jsx
 * In-game terms reference. Read-only.
 */

import React from 'react'
import { BUSINESS_TERMS, FIXED_COSTS } from '../data/glossary.js'

export default function GlossaryModal({ open, onClose }) {
  if (!open) return null

  return (
    <>
      <div className="glossary-overlay" onClick={onClose} />

      <div className="glossary-modal" role="dialog" aria-modal="true" aria-label="Glossary">
        <div className="glossary-modal__head">
          <div>
            <div className="section-label">Reference</div>
            <h2 className="glossary-modal__title">Terms &amp; Glossary</h2>
            <p className="glossary-modal__sub">A quick reference to the business terminology used in the game.</p>
          </div>
          <button className="glossary-modal__close" onClick={onClose} aria-label="Close glossary">×</button>
        </div>

        <div className="glossary-modal__body">
          <section className="glossary-section">
            <h3 className="glossary-section__title">Business Terminology</h3>
            <ul className="glossary-list">
              {BUSINESS_TERMS.map((t) => (
                <li key={t.term} className="glossary-item">
                  <span className="glossary-item__term">{t.term}</span>
                  <span className="glossary-item__def">{t.def}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glossary-section">
            <h3 className="glossary-section__title">Fixed Costs</h3>
            <ul className="glossary-list">
              {FIXED_COSTS.map((t) => (
                <li key={t.term} className="glossary-item">
                  <span className="glossary-item__term">{t.term}</span>
                  <span className="glossary-item__def">{t.def}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
