import React, { useState, useRef, useCallback } from 'react'
import { businessTerms, fixedCostTerms, shuffleArray } from '../data/keyTerms.js'
import Button from '../components/Button.jsx'

/* ─────────────────────────────────────────────────────────
   DragDropActivity
   A single matching group (terms ↔ definitions).
   Grading = "check & retry": on Check, correct matches lock in
   place; incorrect matches are removed and their term chips go
   back to the pool so the user retries — until everything is
   correct. Correct answers are never revealed.
   Supports HTML5 drag-and-drop, with tap-to-select fallback.
   ───────────────────────────────────────────────────────── */
function DragDropActivity({ terms, onComplete }) {
  const allIds = terms.map((t) => t.id)
  const [pool, setPool] = useState(() => shuffleArray(allIds.slice()))
  const [matches, setMatches] = useState({})   // defId -> termId (unconfirmed)
  const [locked, setLocked] = useState({})     // defId -> true (confirmed correct)
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // { wrong } after a Check
  const [complete, setComplete] = useState(false)

  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  const getTerm = (id) => terms.find((t) => t.id === id)

  const place = useCallback((defId, termId) => {
    if (locked[defId]) return
    setFeedback(null)
    setMatches((prev) => {
      const existing = prev[defId]
      if (existing && existing !== termId) setPool((p) => [...p, existing])
      return { ...prev, [defId]: termId }
    })
    setPool((p) => p.filter((id) => id !== termId))
  }, [locked])

  const unplace = useCallback((defId) => {
    if (locked[defId]) return
    setMatches((m) => {
      const termId = m[defId]
      if (!termId) return m
      setPool((p) => [...p, termId])
      const n = { ...m }; delete n[defId]; return n
    })
  }, [locked])

  const handleDragStart = (e, termId) => {
    setDragId(termId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', termId)
  }
  const handleDragEnd = () => { setDragId(null); setDragOverId(null) }
  const handleDragOver = (e, defId) => {
    if (locked[defId]) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(defId)
  }
  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) setDragOverId(null)
  }
  const handleDrop = (e, defId) => {
    e.preventDefault()
    const termId = e.dataTransfer.getData('text/plain') || dragId
    if (termId && !locked[defId]) place(defId, termId)
    setDragId(null); setDragOverId(null)
  }

  const handleTermTap = (termId) => {
    setSelected((s) => (s === termId ? null : termId))
  }
  const handleSlotTap = (defId) => {
    if (locked[defId]) return
    if (selected) { place(defId, selected); setSelected(null) }
  }

  const lockedCount = Object.keys(locked).length
  const allFilled = pool.length === 0 // every term placed somewhere

  const handleCheck = () => {
    if (!allFilled || complete) return
    let wrong = 0
    const newlyLocked = {}
    const cleared = []
    Object.entries(matches).forEach(([defId, termId]) => {
      if (termId === defId) newlyLocked[defId] = true
      else { wrong++; cleared.push(termId) }
    })
    const nextLocked = { ...locked, ...newlyLocked }
    setLocked(nextLocked)
    setMatches({})
    setPool((p) => [...p, ...cleared])
    setSelected(null)
    if (Object.keys(nextLocked).length === terms.length) {
      setComplete(true); setFeedback(null); onComplete?.()
    } else {
      setFeedback({ wrong })
    }
  }

  return (
    <div className="dnd-activity">
      {!complete && (
        <div className="dnd-pool">
          <p className="dnd-pool__label">
            {isTouchDevice
              ? 'Tap a term to select it, then tap the correct definition'
              : 'Drag terms to their matching definitions'}
          </p>
          <div className="dnd-pool__chips">
            {pool.length === 0 ? (
              <span className="dnd-pool__empty">
                All terms placed — click “Check answers” below.
              </span>
            ) : (
              pool.map((termId) => (
                <div
                  key={termId}
                  className={[
                    'dnd-chip',
                    dragId === termId ? 'dnd-chip--dragging' : '',
                    selected === termId ? 'dnd-chip--selected' : '',
                  ].filter(Boolean).join(' ')}
                  draggable
                  onDragStart={(e) => handleDragStart(e, termId)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTermTap(termId)}
                  role="button"
                  tabIndex={0}
                  aria-label={'Term: ' + getTerm(termId)?.term}
                  onKeyDown={(e) => e.key === 'Enter' && handleTermTap(termId)}
                >
                  {getTerm(termId)?.term}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {feedback && feedback.wrong > 0 && (
        <div
          role="status"
          style={{
            background: 'var(--c-error-bg)', border: '1px solid #fca5a5',
            color: 'var(--c-error)', padding: '10px 14px',
            borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600,
            margin: '12px 0',
          }}
        >
          {feedback.wrong === 1
            ? '1 match was incorrect and was removed. Try it again.'
            : feedback.wrong + ' matches were incorrect and were removed. Try them again.'}
        </div>
      )}

      <div className="dnd-defs" role="list">
        {terms.map((term) => {
          const isLocked = !!locked[term.id]
          const matchedTermId = matches[term.id]
          const shownTermId = isLocked ? term.id : matchedTermId
          const shownTerm = shownTermId ? getTerm(shownTermId) : null
          const rowClass = 'dnd-row' + (isLocked ? ' dnd-row--correct' : '')

          return (
            <div key={term.id} className={rowClass} role="listitem">
              <div className="dnd-row__def">{term.definition}</div>
              <div
                className={[
                  'dnd-row__slot',
                  shownTerm ? 'dnd-row__slot--filled' : 'dnd-row__slot--empty',
                  dragOverId === term.id ? 'dnd-row__slot--dragover' : '',
                ].filter(Boolean).join(' ')}
                onDragOver={(e) => !isLocked && handleDragOver(e, term.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !isLocked && handleDrop(e, term.id)}
                onClick={() => !isLocked && handleSlotTap(term.id)}
                role="button"
                tabIndex={0}
                aria-label={shownTerm ? 'Matched: ' + shownTerm.term : 'Drop zone for: ' + term.definition}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isLocked) handleSlotTap(term.id) }}
              >
                {shownTerm ? (
                  <div className="dnd-slot__content" style={{ alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                    <span className="dnd-slot__term">{shownTerm.term}</span>
                    {isLocked ? (
                      <span className="dnd-slot__icon" aria-hidden="true">✓</span>
                    ) : (
                      <button
                        className="dnd-slot__remove"
                        aria-label={'Remove ' + shownTerm.term}
                        onClick={(e) => { e.stopPropagation(); unplace(term.id) }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="dnd-slot__placeholder">Drop here</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {!complete && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--sp-5)' }}>
          <Button variant="primary" onClick={handleCheck} disabled={!allFilled}>
            Check answers
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   KeyTermsScreen
   Two-step flow: Business Terminology first, then Fixed Costs.
   Each section uses check-&-retry until all matches are correct.
   ───────────────────────────────────────────────────────── */
export default function KeyTermsScreen({ onContinue }) {
  const [stage, setStage] = useState(0) // 0 = business, 1 = fixed
  const [businessDone, setBusinessDone] = useState(false)
  const [fixedDone, setFixedDone] = useState(false)

  const isBusiness = stage === 0
  const currentDone = isBusiness ? businessDone : fixedDone

  const steps = [
    { n: 1, label: 'Business Terminology', active: isBusiness,  done: businessDone },
    { n: 2, label: 'Fixed Costs',          active: !isBusiness, done: fixedDone },
  ]

  return (
    <div className="screen">
      <div className="keyterms-screen__header">
        <span className="section-label">HNI Way</span>
        <h1 className="keyterms-screen__title">Key Terms</h1>
        <p className="keyterms-screen__intro">
          Match each term with the correct definition. Correct matches lock in;
          incorrect ones are returned so you can try again until all are right.
        </p>
      </div>

      {/* Step indicator — one section at a time */}
      <div role="list" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {steps.map((s) => (
          <div
            key={s.n}
            role="listitem"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 'var(--r-full)',
              fontSize: 13, fontWeight: 700,
              border: '1px solid ' + (s.active ? 'var(--c-primary)' : 'var(--c-border)'),
              background: s.active ? 'var(--c-primary-lt)' : 'transparent',
              color: s.active ? 'var(--c-primary)' : 'var(--c-text-muted)',
              opacity: (!s.active && !s.done) ? 0.6 : 1,
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: '50%', fontSize: 12,
              background: s.done ? 'var(--c-success)' : (s.active ? 'var(--c-primary)' : 'var(--c-border)'),
              color: (s.done || s.active) ? '#fff' : 'var(--c-text-muted)',
            }}>
              {s.done ? '✓' : s.n}
            </span>
            {s.label}
          </div>
        ))}
      </div>

      {/* Success banner once the current section is fully correct */}
      {currentDone && (
        <div className="score-banner score-banner--pass">
          <span className="score-banner__icon">★</span>
          <div>
            <div className="score-banner__text">All terms matched correctly!</div>
            <div className="score-banner__sub">
              {isBusiness
                ? 'Great work! Continue to the Fixed Costs section.'
                : 'Great work! You can continue to the next section.'}
            </div>
          </div>
        </div>
      )}

      {/* Activity — only the current stage is shown */}
      <div aria-label={isBusiness ? 'Business Terminology' : 'Fixed Costs'}>
        {isBusiness ? (
          <DragDropActivity
            key="business"
            terms={businessTerms}
            onComplete={() => setBusinessDone(true)}
          />
        ) : (
          <DragDropActivity
            key="fixed"
            terms={fixedCostTerms}
            onComplete={() => setFixedDone(true)}
          />
        )}
      </div>

      <p className="mobile-hint">
        Tip: Tap a term chip to select it, then tap a definition slot to match.
      </p>

      {/* BUSINESS stage actions */}
      {isBusiness && !businessDone && (
        <div className="keyterms-submit" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => { setBusinessDone(true); setStage(1) }}>
            Skip (Test)
          </Button>
        </div>
      )}
      {isBusiness && businessDone && (
        <div className="keyterms-submit" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <Button variant="primary" onClick={() => setStage(1)}>
            Continue to Fixed Costs
          </Button>
        </div>
      )}

      {/* FIXED COSTS stage actions */}
      {!isBusiness && !fixedDone && (
        <div className="keyterms-submit" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => onContinue?.()}>
            Skip (Test)
          </Button>
        </div>
      )}
      {!isBusiness && fixedDone && (
        <div className="keyterms-submit" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <Button variant="primary" onClick={() => onContinue?.()}>
            Continue to next section
          </Button>
        </div>
      )}
    </div>
  )
}
