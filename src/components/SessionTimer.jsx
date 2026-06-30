/**
 * SessionTimer.jsx
 * Global play-time cap. Counts DOWN total elapsed game time from
 * `startedAt` and guarantees a single session never exceeds the limit
 * (default 30 minutes, set in GAME_CONFIG.sessionMinutes).
 *
 * It does NOT end individual quarters. It fires `onWarn` once when the
 * remaining time first drops to `warnAtSeconds` (a "wrap up" heads-up), and
 * fires `onExpire` once at zero so the whole game ends gracefully at the
 * final report. Remaining time is derived from a stored timestamp, so the
 * cap (and the warning) hold even across a page reload.
 */

import React, { useEffect, useRef, useState } from 'react'

export default function SessionTimer({ startedAt, totalSeconds, playedSeconds = 0, onExpire, onWarn, warnAtSeconds = 120, stopped = false }) {
  // Remaining = total cap minus (time already played in prior sessions +
  // time played since this session opened). Closing the tab stops the count;
  // it resumes from the saved `playedSeconds` next time.
  const compute = () => {
    const started = startedAt || Date.now()
    const sinceStart = Math.max(0, Math.floor((Date.now() - started) / 1000))
    return Math.max(0, totalSeconds - ((playedSeconds || 0) + sinceStart))
  }

  const [remaining, setRemaining] = useState(compute)
  const firedRef = useRef(false)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (stopped) return
    const tick = () => {
      const r = compute()
      setRemaining(r)
      if (r <= warnAtSeconds && r > 0 && !warnedRef.current) {
        warnedRef.current = true
        onWarn?.(r)
      }
      if (r <= 0 && !firedRef.current) {
        firedRef.current = true
        onExpire?.()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, totalSeconds, playedSeconds, stopped])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const urgent = remaining <= 300 && remaining > 60
  const critical = remaining <= 60

  return (
    <div
      className={'session-timer' + (urgent ? ' session-timer--urgent' : '') + (critical ? ' session-timer--critical' : '')}
      title="Total time left in this session. The game ends automatically and shows your final report when this reaches zero."
      aria-label={'Session time remaining ' + mm + ':' + ss}
    >
      <span className="session-timer__icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="session-timer__label">Time left</span>
      <span className="session-timer__value">{mm}:{ss}</span>
    </div>
  )
}
