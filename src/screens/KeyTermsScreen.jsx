import React, { useState, useRef, useEffect, useCallback } from 'react'
import { businessTerms, fixedCostTerms, shuffleArray } from '../data/keyTerms.js'
import Button from '../components/Button.jsx'

/* ─────────────────────────────────────────────────────────
   DragDropActivity
   A single matching group (terms ↔ definitions).
   Supports HTML5 drag-and-drop on desktop.
   Falls back to tap-to-select + tap-to-place on touch devices.
   ───────────────────────────────────────────────────────── */
function DragDropActivity({ terms, submitted, onMatchesUpdate }) {
  const [pool, setPool] = useState(() => shuffleArray(terms.map((t) => t.id)))
  const [matches, setMatches] = useState({})      // { defId: termId }
  const [dragId, setDragId] = useState(null)       // term being dragged
  const [dragOverId, setDragOverId] = useState(null) // def slot being hovered
  const [selected, setSelected] = useState(null)   // tap-selected term id

  // Detect touch-only devices
  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  // Notify parent whenever matches change
  useEffect(() => {
    onMatchesUpdate?.(matches)
  }, [matches]) // eslint-disable-line

  const getTerm = (id) => terms.find((t) => t.id === id)

  /* ── Place a term into a definition slot ── */
  const place = useCallback((defId, termId) => {
    setMatches((prevMatches) => {
      const existing = prevMatches[defId]
      // Return previously-placed term to pool (if any)
      if (existing && existing !== termId) {
        setPool((p) => [...p, existing])
      }
      return { ...prevMatches, [defId]: termId }
    })
    setPool((p) => p.filter((id) => id !== termId))
  }, [])

  /* ── Remove a matched term back to pool ── */
  const unplace = useCallback((defId) => {
    const termId = matches[defId]
    if (!termId) return
    setMatches((m) => {
      const n = { ...m }
      delete n[defId]
      return n
    })
    setPool((p) => [...p, termId])
  }, [matches])

  /* ══ Desktop: HTML5 drag-and-drop handlers ══ */
  const handleDragStart = (e, termId) => {
    setDragId(termId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', termId)
  }

  const handleDragEnd = () => {
    setDragId(null)
    setDragOverId(null)
  }

  const handleDragOver = (e, defId) => {
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
    if (termId) place(defId, termId)
    setDragId(null)
    setDragOverId(null)
  }

  /* ══ Mobile: tap-to-select + tap-to-place ══ */
  const handleTermTap = (termId) => {
    if (submitted) return
    setSelected((s) => (s === termId ? null : termId))
  }

  const handleSlotTap = (defId) => {
    if (submitted) return
    if (selected) {
      place(defId, selected)
      setSelected(null)
    }
  }

  /* ── Result helpers ── */
  const isCorrect = (defId) => matches[defId] === defId

  /* ── Render ── */
  return (
    <div className="dnd-activity">
      {/* ── Term Pool ── */}
      {!submitted && (
        <div className="dnd-pool">
          <p className="dnd-pool__label">
            {isTouchDevice
              ? 'Tap a term to select it, then tap the correct definition'
              : 'Drag terms to their matching definitions'}
          </p>
          <div className="dnd-pool__chips">
            {pool.length === 0 ? (
              <span className="dnd-pool__empty">
                ✓ All terms placed — review and submit when ready.
              </span>
            ) : (
              pool.map((termId) => (
                <div
                  key={termId}
                  className={[
                    'dnd-chip',
                    dragId === termId ? 'dnd-chip--dragging' : '',
                    selected === termId ? 'dnd-chip--selected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={!submitted}
                  onDragStart={(e) => handleDragStart(e, termId)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleTermTap(termId)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Term: ${getTerm(termId)?.term}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleTermTap(termId)}
                >
                  {getTerm(termId)?.term}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Definition Rows ── */}
      <div className="dnd-defs" role="list">
        {terms.map((term) => {
          const matchedTermId = matches[term.id]
          const matchedTerm = matchedTermId ? getTerm(matchedTermId) : null
          let rowClass = 'dnd-row'
          if (submitted) {
            if (!matchedTermId)      rowClass += ' dnd-row--unmatched'
            else if (isCorrect(term.id)) rowClass += ' dnd-row--correct'
            else                    rowClass += ' dnd-row--incorrect'
          }

          return (
            <div key={term.id} className={rowClass} role="listitem">
              {/* Definition text */}
              <div className="dnd-row__def">{term.definition}</div>

              {/* Drop slot */}
              <div
                className={[
                  'dnd-row__slot',
                  matchedTermId ? 'dnd-row__slot--filled' : 'dnd-row__slot--empty',
                  dragOverId === term.id ? 'dnd-row__slot--dragover' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragOver={(e) => !submitted && handleDragOver(e, term.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !submitted && handleDrop(e, term.id)}
                onClick={() => !submitted && handleSlotTap(term.id)}
                role="button"
                tabIndex={0}
                aria-label={
                  matchedTerm
                    ? `Matched: ${matchedTerm.term}`
                    : `Drop zone for: ${term.definition}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !submitted) handleSlotTap(term.id)
                }}
              >
                {matchedTerm ? (
                  <div className="dnd-slot__content">
                    <span className="dnd-slot__term">{matchedTerm.term}</span>
                    {submitted ? (
                      <span className="dnd-slot__icon" aria-hidden="true">
                        {isCorrect(term.id) ? '✓' : '✗'}
                      </span>
                    ) : (
                      <button
                        className="dnd-slot__remove"
                        aria-label={`Remove ${matchedTerm.term}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          unplace(term.id)
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="dnd-slot__placeholder">
                    {submitted ? '— not matched' : 'Drop here'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   KeyTermsScreen
   Two-tab matching activity (Business + Fixed Costs).
   Single "Submit All" button checks both groups at once.
   ───────────────────────────────────────────────────────── */
export default function KeyTermsScreen() {
  const [activeTab, setActiveTab] = useState(0) // 0 = Business, 1 = Fixed
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)        // { correct, total }

  // Store latest matches from each group via ref (avoids stale closure)
  const businessMatchesRef = useRef({})
  const fixedMatchesRef = useRef({})

  const handleBusinessUpdate = useCallback((m) => { businessMatchesRef.current = m }, [])
  const handleFixedUpdate    = useCallback((m) => { fixedMatchesRef.current    = m }, [])

  const handleSubmit = () => {
    const bm = businessMatchesRef.current
    const fm = fixedMatchesRef.current

    const bCorrect = businessTerms.filter((t) => bm[t.id] === t.id).length
    const fCorrect = fixedCostTerms.filter((t) => fm[t.id] === t.id).length
    const total   = businessTerms.length + fixedCostTerms.length

    setScore({ correct: bCorrect + fCorrect, total })
    setSubmitted(true)
  }

  const totalMatched =
    Object.keys(businessMatchesRef.current).length +
    Object.keys(fixedMatchesRef.current).length

  const isPass = score && score.correct >= Math.ceil(score.total * 0.7)

  return (
    <div className="screen">
      {/* Header */}
      <div className="keyterms-screen__header">
        <span className="section-label">HNI Way</span>
        <h1 className="keyterms-screen__title">Key Terms</h1>
        <p className="keyterms-screen__intro">
          Match each term with the correct definition before moving forward.
        </p>
      </div>

      {/* Score banner (after submit) */}
      {submitted && score && (
        <div className={`score-banner score-banner--${isPass ? 'pass' : 'fail'}`}>
          <span className="score-banner__icon">{isPass ? '🎉' : '📝'}</span>
          <div>
            <div className="score-banner__text">
              You matched {score.correct} out of {score.total} correctly.
            </div>
            <div className="score-banner__sub">
              {isPass
                ? 'Great work! You can continue to the next section.'
                : 'Some answers were incorrect — review the results below, then continue.'}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 0}
          className={`tab-btn ${activeTab === 0 ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          Business Terminology
          <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
            ({businessTerms.length})
          </span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          className={`tab-btn ${activeTab === 1 ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          Fixed Costs
          <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
            ({fixedCostTerms.length})
          </span>
        </button>
      </div>

      {/* Activity panels */}
      <div role="tabpanel" aria-label={activeTab === 0 ? 'Business Terminology' : 'Fixed Costs'}>
        {activeTab === 0 ? (
          <DragDropActivity
            key="business"
            terms={businessTerms}
            submitted={submitted}
            onMatchesUpdate={handleBusinessUpdate}
          />
        ) : (
          <DragDropActivity
            key="fixed"
            terms={fixedCostTerms}
            submitted={submitted}
            onMatchesUpdate={handleFixedUpdate}
          />
        )}
      </div>

      {/* Mobile interaction hint */}
      <p className="mobile-hint">
        Tip: Tap a term chip to select it, then tap a definition slot to match.
      </p>

      {/* Submit */}
      {!submitted && (
        <div className="keyterms-submit">
          <Button
            variant="primary"
            onClick={handleSubmit}
          >
            Submit All Answers
          </Button>
        </div>
      )}

      {submitted && (
        <div className="keyterms-submit" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
            Review your answers in each tab, then click Next.
          </span>
        </div>
      )}
    </div>
  )
}
