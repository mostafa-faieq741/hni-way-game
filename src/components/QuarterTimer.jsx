/**
 * QuarterTimer.jsx
 * 3-minute countdown that auto-fires onExpire() at zero.
 * Resets when the `quarterKey` prop changes (used for Q+Y resets).
 *
 * Visually urgent under 30s but stays on-brand.
 */

import React, { useEffect, useRef, useState } from 'react'

const DEFAULT_DURATION = 3 * 60 // 180 seconds

export default function QuarterTimer({ quarterKey, onExpire, paused = false, durationSec = DEFAULT_DURATION }) {
  const [secondsLeft, setSecondsLeft] = useState(durationSec)
  const expiredRef = useRef(false)

  // Reset when the quarter changes
  useEffect(() => {
    setSecondsLeft(durationSec)
    expiredRef.current = false
  }, [quarterKey, durationSec])

  // Tick every second
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true
            // Defer to next tick to avoid setState-in-render warnings
            setTimeout(() => onExpire?.(), 0)
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [paused, onExpire])

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const urgent = secondsLeft <= 30

  return (
    <div
      className={`quarter-timer${urgent ? ' quarter-timer--urgent' : ''}`}
      title={`Time remaining this quarter: ${mm}:${ss}`}
      aria-label={`Quarter timer: ${mm}:${ss}`}
    >
      <span className="quarter-timer__icon" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M12 9v4l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span className="quarter-timer__value">{mm}:{ss}</span>
    </div>
  )
}
