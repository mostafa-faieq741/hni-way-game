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
  const [matches, setMatches] = useState({})
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [selected, setSelected] = useState(null)

  const isTouchDevice = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  useEffect(() => { onMatchesUpdate?.(matches) }, [matches]) // eslint-disable-line

  const getTerm = (id) => terms.find((t) => t.id === id)

  const place = useCallback((defId, termId) => {
    setMatches((prevMatches) => {
      const existing = prevMatches[defId]
      if (existing && existing !== termId) {
        setPool((p) => [...p, existing])
      }
      return { ...prevMatches, [defId]: termId }
    })
    setPool((p) => p.filter((id) => id !== termId))
  }, [])

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

  const handleDragStart = (e, termId) => {
    setDragId(termId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', termId)
  }
  const handleDragEnd = () => { setDragId(null); setDragOverId(null) }
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
    setDragId(null); setDragOverId(null)
  }

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

  const isCorrect = (defId) => matches[defId] === defId

  return (
    <div className="dnd-activity">
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
                All terms placed — review and submit when ready.
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
                  draggable={!submitted}
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

      <div className="dnd-defs" role="list">
        {terms.map((term) => {
          const matchedTermId = matches[term.id]
          const matchedTerm = matchedTermId ? getTerm(matchedTermId) : null
          let rowClass = 'dnd-row'
          if (submitted) {
            if (!matchedTermId)          rowClass += ' dnd-row--unmatched'
            else if (isCorrect(term.id)) rowClass += ' dnd-row--correct'
            else                         rowClass += ' dnd-row--incorrect'
          }

          return (
            <div key={term.id} className={rowClass} role="listitem">
              <div className="dnd-row__def">{term.definition}</div>
              <div
                className={[
                  'dnd-row__slot',
                  matchedTermId ? 'dnd-row__slot--filled' : 'dnd-row__slot--empty',
                  dragOverId === term.id ? 'dnd-row__slot--dragover' : '',
                ].filter(Boolean).join(' ')}
                onDragOver={(e) => !submitted && handleDragOver(e, term.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !submitted && handleDrop(e, term.id)}
                onClick={() => !submitted && handleSlotTap(term.id)}
                role="button"
                tabIndex={0}
                aria-label={matchedTerm ? 'Matched: ' + matchedTerm.term : 'Drop zone for: ' + term.definition}
                onKeyDown={(e) => { if (e.key === 'Enter' && !submitted) handleSlotTap(term.id) }}
              >
                {matchedTerm ? (
                  <div className="dnd-slot__content" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: 'var(--sp-2)' }}>
                      <span className="dnd-slot__term" style={{ textDecoration: submitted && !isCorrect(term.id) ? 'line-through' : 'none', color: submitted && !isCorrect(term.id) ? 'var(--c-text-muted)' : 'inherit' }}>
                        {matchedTerm.term}
                      </span>
                      {submitted ? (
                        <span className="dnd-slot__icon" aria-hidden="true">
                          {isCorrect(term.id) ? '✓' : '✗'}
                        </span>
                      ) : (
                        <button
                          className="dnd-slot__remove"
                          aria-label={'Remove ' + matchedTerm.term}
                          onClick={(e) => { e.stopPropagation(); unplace(term.id) }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {submitted && !isCorrect(term.id) && (
                      <div style={{ fontSize: '12px', color: 'var(--c-success)', marginTop: '4px', fontWeight: 700 }}>
                        Correct: {term.term}
                      </div>
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
   ───────────────────────────────────────────────────────── */
export default function KeyTermsScreen({ onContinue }) {
  const [activeTab, setActiveTab] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const [businessMatches, setBusinessMatches] = useState({})
  const [fixedMatches, setFixedMatches] = useState({})

  const businessMatchesRef = useRef({})
  const fixedMatchesRef = useRef({})

  const handleBusinessUpdate = useCallback((m) => {
    businessMatchesRef.current = m
    setBusinessMatches(m)
  }, [])
  const handleFixedUpdate = useCallback((m) => {
    fixedMatchesRef.current = m
    setFixedMatches(m)
  }, [])

  const businessMatchedCount = Object.keys(businessMatches).length
  const fixedMatchedCount    = Object.keys(fixedMatches).length
  const businessComplete = businessMatchedCount === businessTerms.length
  const fixedComplete    = fixedMatchedCount    === fixedCostTerms.length
  const allMatched = businessComplete && fixedComplete

  const handleSubmit = () => {
    if (!allMatched) return
    const bm = businessMatchesRef.current
    const fm = fixedMatchesRef.current
    const bCorrect = businessTerms.filter((t) => bm[t.id] === t.id).length
    const fCorrect = fixedCostTerms.filter((t) => fm[t.id] === t.id).length
    const total = businessTerms.length + fixedCostTerms.length
    setScore({ correct: bCorrect + fCorrect, total })
    setSubmitted(true)
  }

  const isPass = score && score.correct >= Math.ceil(score.total * 0.7)

  return (
    <div className="screen">
      <div className="keyterms-screen__header">
        <span className="section-label">HNI Way</span>
        <h1 className="keyterms-screen__title">Key Terms</h1>
        <p className="keyterms-screen__intro">
          Match each term with the correct definition before moving forward.
        </p>
      </div>

      {/* Two-section banner — makes it clear there are 2 tabs to complete */}
      <div className="alert-box" style={{ marginBottom: 24, marginTop: 0 }} role="note">
        <svg className="alert-box__icon" style={{ flexShrink: 0, marginTop: 2 }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div className="alert-box__text">
          <div className="alert-box__label">
            This activity has two sections
          </div>
          <div>
            Complete <strong>Business Terminology</strong> <em>and</em> <strong>Fixed Costs</strong> before continuing.
            Use the tabs below to switch between them.
          </div>
        </div>
      </div>

      {submitted && score && (
        <div className={'score-banner score-banner--' + (isPass ? 'pass' : 'fail')}>
          <span className="score-banner__icon">{isPass ? '★' : '✎'}</span>
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

      {/* Tabs — highlighted with progress badges */}
      <div className="tabs tabs--highlighted" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 0}
          className={'tab-btn tab-btn--highlight ' + (activeTab === 0 ? 'tab-btn--active' : '') + (businessComplete ? ' tab-btn--complete' : '')}
          onClick={() => setActiveTab(0)}
        >
          <span className="tab-btn__index">1</span>
          <span className="tab-btn__label">Business Terminology</span>
          <span className={'tab-btn__progress' + (businessComplete ? ' tab-btn__progress--done' : '')}>
            {businessMatchedCount}/{businessTerms.length}
          </span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          className={'tab-btn tab-btn--highlight ' + (activeTab === 1 ? 'tab-btn--active' : '') + (fixedComplete ? ' tab-btn--complete' : '')}
          onClick={() => setActiveTab(1)}
        >
          <span className="tab-btn__index">2</span>
          <span className="tab-btn__label">Fixed Costs</span>
          <span className={'tab-btn__progress' + (fixedComplete ? ' tab-btn__progress--done' : '')}>
            {fixedMatchedCount}/{fixedCostTerms.length}
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

      {/* Helper hint — only shown before submit */}
      {!allMatched && !submitted && (
        <div className="keyterms-blocker" role="status">
          {!businessComplete && !fixedComplete
            ? 'Place every term in both sections to enable the Submit button.'
            : !businessComplete
              ? 'Finish placing terms in the Business Terminology section.'
              : 'Finish placing terms in the Fixed Costs section.'}
        </div>
      )}

      <p className="mobile-hint">
        Tip: Tap a term chip to select it, then tap a definition slot to match.
      </p>

      {/* Submit (pre-submit) — enabled only once all 22 terms are placed */}
      {!submitted && (
        <div className="keyterms-submit" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={() => onContinue?.()}
          >
            Skip (Test)
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!allMatched}
          >
            Submit All Answers
          </Button>
        </div>
      )}

      {/* Continue (post-submit) — moves to the next screen */}
      {submitted && (
        <div className="keyterms-submit" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <Button
            variant="primary"
            onClick={() => onContinue?.()}
          >
            Continue to next section
          </Button>
          <span style={{ fontSize: 13, color: 'var(--c-text-muted)', textAlign: 'center' }}>
            Review your answers in each tab if you want, then click Continue.
          </span>
        </div>
      )}
    </div>
  )
}
