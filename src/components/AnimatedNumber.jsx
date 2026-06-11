/**
 * AnimatedNumber – counts toward `value` whenever it changes (game juice).
 */
import React, { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, duration = 600, format }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === value) return
    const start = performance.now()
    cancelAnimationFrame(rafRef.current)
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const cur = Math.round(from + (value - from) * eased)
      setDisplay(cur)
      if (p < 1) rafRef.current = requestAnimationFrame(step)
      else fromRef.current = value
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <>{format ? format(display) : display.toLocaleString()}</>
}
