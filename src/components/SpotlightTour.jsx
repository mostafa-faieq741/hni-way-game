/**
 * SpotlightTour.jsx
 * An interactive, dim-the-screen / spotlight-one-element guided tour.
 *
 * Each step targets an element by a `data-tour="<key>"` attribute. The rest of
 * the screen is dimmed; the target is highlighted; a tooltip explains it. The
 * player advances with Next (or Back / Skip). Steps may declare a `tab` so the
 * host can switch the active game tab before the element is measured.
 *
 * The host (GameContainer) owns step state so it can drive tab navigation.
 */

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

const PAD = 8          // breathing room around the highlighted element
const TIP_W = 320      // tooltip width
const GAP = 14         // gap between target and tooltip
const MARGIN = 12      // min distance the tooltip keeps from any viewport edge

function measure(key) {
  if (!key) return null
  const el = document.querySelector('[data-tour="' + key + '"]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width === 0 && r.height === 0) return null
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

export default function SpotlightTour({
  steps = [],
  stepIndex = 0,
  onNext,
  onBack,
  onSkip,
  onFinish,
  tabLabel,
}) {
  const step = steps[stepIndex]
  const [rect, setRect] = useState(null)
  const tipRef = useRef(null)
  const [tipStyle, setTipStyle] = useState({ left: 0, top: 0, opacity: 0 })

  // Re-measure the target. Tab switches need a tick for the DOM to paint, so we
  // retry a few times until the element shows up.
  const remeasure = useCallback(() => {
    if (!step) return
    let tries = 0
    const tick = () => {
      const r = measure(step.key)
      if (r) { setRect(r); return }
      if (tries++ < 12) requestAnimationFrame(tick)
      else setRect(null) // fall back to a centered card
    }
    tick()
  }, [step])

  useLayoutEffect(() => { remeasure() }, [remeasure])

  useEffect(() => {
    const on = () => remeasure()
    window.addEventListener('resize', on)
    window.addEventListener('scroll', on, true)
    const id = setInterval(on, 400) // keep up with animated/late layout
    return () => {
      window.removeEventListener('resize', on)
      window.removeEventListener('scroll', on, true)
      clearInterval(id)
    }
  }, [remeasure])

  const isLast = stepIndex === steps.length - 1
  const advance = () => { isLast ? (onFinish && onFinish()) : (onNext && onNext()) }

  // Highlight box (clamped to viewport)
  const hl = rect
    ? {
        left: Math.max(4, rect.left - PAD),
        top: Math.max(4, rect.top - PAD),
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null

  // Place the tooltip AFTER it renders so we know its real height and can keep
  // it fully on-screen (prefer below the target, flip above, else clamp).
  useLayoutEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const h = tipRef.current ? tipRef.current.offsetHeight : 220
    let left, top
    if (hl) {
      left = Math.min(Math.max(MARGIN, hl.left), vw - TIP_W - MARGIN)
      const below = hl.top + hl.height + GAP
      const above = hl.top - GAP - h
      if (below + h <= vh - MARGIN) top = below          // fits below
      else if (above >= MARGIN) top = above              // fits above
      else top = vh - h - MARGIN                         // pin to bottom edge
    } else {
      left = vw / 2 - TIP_W / 2
      top = vh / 2 - h / 2
    }
    top = Math.min(Math.max(MARGIN, top), Math.max(MARGIN, vh - h - MARGIN))
    left = Math.min(Math.max(MARGIN, left), Math.max(MARGIN, vw - TIP_W - MARGIN))
    setTipStyle({ left, top, opacity: 1 })
  }, [rect, stepIndex, hl && hl.top, hl && hl.left, hl && hl.height])

  // Keyboard: Enter/→ next, ← back, Esc skip.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); advance() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onBack && onBack() }
      else if (e.key === 'Escape') { e.preventDefault(); onSkip && onSkip() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }) // re-bind each render so `advance` is fresh

  if (!step) return null

  return createPortal((
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="Game tour">
      {/* full-screen click blocker so the game can't be poked mid-tour */}
      <div className="tour-blocker" onClick={(e) => e.stopPropagation()} />

      {/* the lit cut-out (box-shadow dims everything else) */}
      {hl && (
        <div
          className="tour-hole"
          style={{ left: hl.left, top: hl.top, width: hl.width, height: hl.height }}
        />
      )}
      {!hl && <div className="tour-dim-fallback" />}

      <div
        ref={tipRef}
        className="tour-tip"
        style={{ left: tipStyle.left, top: tipStyle.top, opacity: tipStyle.opacity, width: TIP_W }}
      >
        <div className="tour-tip__top">
          <span className="tour-tip__count">{stepIndex + 1} / {steps.length}</span>
          {step.tab && tabLabel && (
            <span className="tour-tip__chip">📍 {tabLabel} tab</span>
          )}
          <button className="tour-tip__skip" onClick={() => onSkip && onSkip()}>Skip tour</button>
        </div>

        <div className="tour-tip__title">{step.title}</div>
        <div className="tour-tip__body">{step.body}</div>
        {step.hint && <div className="tour-tip__hint">👆 {step.hint}</div>}

        <div className="tour-tip__actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => onBack && onBack()}
            disabled={stepIndex === 0}
            style={{ opacity: stepIndex === 0 ? 0.4 : 1 }}
          >
            Back
          </button>
          <button className="btn btn--primary btn--sm" onClick={advance}>
            {isLast ? 'Got it — let’s play' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  ), document.body)
}
