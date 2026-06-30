/**
 * SessionTimer.jsx
 * Global play-time cap. Counts ACTUAL play time (only while the tab is visible),
 * starting from the already-played seconds restored with the save. It reports
 * progress via onPersist so the elapsed time is saved — closing the tab pauses
 * the count, and it resumes from where it left off next time (no wall-clock burn).
 *
 * Fires onWarn once near the end and onExpire once at zero.
 */
import React, { useEffect, useRef, useState } from 'react'

export default function SessionTimer({
  playedSeconds = 0, totalSeconds, onExpire, onWarn, onPersist, onFlush,
  warnAtSeconds = 120, stopped = false,
}) {
  const usedRef = useRef(playedSeconds)
  const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - playedSeconds))
  const firedRef = useRef(false)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (stopped) return
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return // pause in background
      usedRef.current += 1
      const r = Math.max(0, totalSeconds - usedRef.current)
      setRemaining(r)
      if (usedRef.current % 5 === 0) onPersist?.(usedRef.current)
      if (r <= warnAtSeconds && r > 0 && !warnedRef.current) { warnedRef.current = true; onWarn?.(r) }
      if (r <= 0 && !firedRef.current) { firedRef.current = true; onFlush?.(usedRef.current); onExpire?.() }
    }
    const id = setInterval(tick, 1000)
    // Synchronous, unload-safe save (sendBeacon) when the player leaves/closes.
    const flush = () => onFlush?.(usedRef.current)
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      clearInterval(id)
      onFlush?.(usedRef.current)
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', flush)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped, totalSeconds])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const urgent = remaining <= 300 && remaining > 60
  const critical = remaining <= 60

  return (
    <div
      className={'session-timer' + (urgent ? ' session-timer--urgent' : '') + (critical ? ' session-timer--critical' : '')}
      title="Total play time left in this session. Time only counts while you are playing — it pauses when you leave and resumes next time."
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
