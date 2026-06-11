/**
 * ThemeToggle – flips between the dark game theme (default) and light mode.
 * Persists to localStorage('hni_theme'); applied via <html data-theme>.
 */
import React, { useCallback, useState } from 'react'
import { play } from '../services/sounds.js'

export default function ThemeToggle({ style }) {
  const [theme, setTheme] = useState(() => {
    try { return document.documentElement.dataset.theme || 'dark' } catch { return 'dark' }
  })

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      try { localStorage.setItem('hni_theme', next) } catch {}
      return next
    })
    play('click')
  }, [])

  return (
    <button
      className="hud-iconbtn"
      style={style}
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle light/dark mode"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  )
}
