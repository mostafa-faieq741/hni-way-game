/**
 * PlayerSetupScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles player identity and game-state initialisation before the actual
 * game simulation begins.
 *
 * Phase flow:
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ DEV MODE (VITE_DEV_MOCK_SCORM=true)                                      │
 * │   mount → 'mock-picker'                                                  │
 * │     user picks a mock identity and clicks Simulate                       │
 * │     → 'identifying' → callBackend() → 'ready'                            │
 * │                                                                          │
 * │ PRODUCTION                                                               │
 * │   mount → 'waiting'                                                      │
 * │     SCORM postMessage arrives  → 'identifying' → callBackend() → 'ready' │
 * │     SCORM timeout              → 'manual'                                │
 * │       user submits manual form → 'identifying' → callBackend() → 'ready' │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * @prop {function} onGameReady – called when the player is identified and
 *                                game state is loaded; receives
 *                                { player, gameState, isNewPlayer }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback } from 'react'
import Button from '../components/Button.jsx'
import HNILogo from '../components/HNILogo.jsx'
import {
  receiveScormLearnerIdentity,
  isMockScormMode,
} from '../services/scormService.js'
import { startGame } from '../services/apiClient.js'
import { initGameState } from '../services/gameStateService.js'

// ─────────────────────────────────────────────────────────────────────────────
// Mock identity catalogue (dev mode only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The four mock identities available in the dev picker.
 * learnerId must match the seeds in mockPlayerService.js / mockGameStateService.js.
 */
const MOCK_IDENTITIES = [
  {
    learnerId:   'new-learner-001',
    learnerName: 'New Learner',
    label:       'New Learner',
    tag:         'new',
    desc:        'No saved progress — starts a fresh game',
  },
  {
    learnerId:   'returning-001',
    learnerName: 'Alex Chen',
    label:       'Alex Chen',
    tag:         'Q3',
    desc:        'Returning · Q3 of 20 · Early game · $85 k cash',
  },
  {
    learnerId:   'returning-002',
    learnerName: 'Jordan Kim',
    label:       'Jordan Kim',
    tag:         'Q10',
    desc:        'Returning · Q10 of 20 · Mid game · $120 k cash',
  },
  {
    learnerId:   'returning-003',
    learnerName: 'Sam Rivera',
    label:       'Sam Rivera',
    tag:         'Q18 ⭐',
    desc:        'Returning · Q18 of 20 · Late game · Leaderboard qualified',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayerSetupScreen({ onGameReady }) {
  /**
   * Phase of the setup flow.
   * 'mock-picker' | 'waiting' | 'manual' | 'identifying' | 'ready' | 'error'
   */
  const [phase, setPhase] = useState('waiting')

  /** Learner identity resolved from SCORM, manual form, or mock picker */
  const [identity, setIdentity]     = useState(null)

  /** Game start result from backend (or mock) */
  const [gameResult, setGameResult] = useState(null)

  /** Manual fallback form input */
  const [manualInput, setManualInput] = useState('')

  /** Selected mock identity learnerId (dev picker) */
  const [selectedMockId, setSelectedMockId] = useState(MOCK_IDENTITIES[0].learnerId)

  /** Error message */
  const [errorMsg, setErrorMsg] = useState('')

  // ── Step 1: on mount, determine entry point ─────────────────────────────────
  useEffect(() => {
    let cancelled = false

    if (isMockScormMode) {
      // Dev mode: show the mock identity picker instead of auto-resolving
      setPhase('mock-picker')
      return
    }

    // Production: wait for SCORM postMessage
    setPhase('waiting')
    receiveScormLearnerIdentity({ timeoutMs: 8000 })
      .then((id) => {
        if (cancelled) return
        setIdentity(id)
        callBackend(id)
      })
      .catch((err) => {
        if (cancelled) return
        console.warn('[PlayerSetup] SCORM identity not received:', err.message)
        setPhase('manual')
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Step 2: call mock/real backend to load or create player ────────────────
  const callBackend = useCallback(async (id) => {
    setPhase('identifying')
    setErrorMsg('')
    try {
      const result = await startGame(id)

      // Initialise the frontend game state service with data from the backend
      initGameState({
        playerId:                result.gameState.player_id,
        currentScreen:           result.gameState.current_screen,
        currentGamePhase:        result.gameState.current_game_phase,
        currentQuarter:          result.gameState.current_quarter,
        currentTurnStep:         result.gameState.current_turn_step,
        cash:                    result.gameState.cash,
        reputation:              result.gameState.reputation,
        netProfit:               result.gameState.net_profit,
        totalRevenue:            result.gameState.total_revenue,
        totalCosts:              result.gameState.total_costs,
        qualifiedForLeaderboard: result.gameState.qualified_for_leaderboard,
        gameStatus:              result.gameState.game_status,
        updatedAt:               result.gameState.updated_at,
      })

      setGameResult(result)
      setPhase('ready')
    } catch (err) {
      console.error('[PlayerSetup] Backend error:', err)
      setErrorMsg('Could not connect to the game server. Please try again.')
      setPhase('error')
    }
  }, [])

  // ── Mock picker: Simulate button clicked ───────────────────────────────────
  const handleMockSimulate = () => {
    const mockId = MOCK_IDENTITIES.find((m) => m.learnerId === selectedMockId)
    if (!mockId) return
    const id = { learnerId: mockId.learnerId, learnerName: mockId.learnerName }
    setIdentity(id)
    callBackend(id)
  }

  // ── Manual form submit ─────────────────────────────────────────────────────
  const handleManualSubmit = (e) => {
    e.preventDefault()
    const trimmed = manualInput.trim()
    if (!trimmed) return
    const id = { learnerId: trimmed, learnerName: trimmed }
    setIdentity(id)
    callBackend(id)
  }

  // ── "Start / Resume Game" clicked ─────────────────────────────────────────
  const handleStartGame = () => {
    if (gameResult && onGameReady) {
      onGameReady(gameResult)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="app-main">
      <div className="player-setup-screen screen" style={styles.screen}>

        {/* ── Dev banner (shown in mock mode for all phases) ── */}
        {isMockScormMode && (
          <div style={styles.devBanner}>
            🛠 Dev Mode — SCORM &amp; API are simulated (no backend required)
          </div>
        )}

        {/* ── Card ── */}
        <div style={styles.card}>
          <HNILogo height={32} style={{ margin: '0 auto 20px' }} />

          {/* ── MOCK PICKER (dev mode entry point) ── */}
          {phase === 'mock-picker' && (
            <div>
              <h2 style={styles.title}>Simulate Player Identity</h2>
              <p style={styles.subtext}>
                Choose a mock learner to test the setup flow. New Learner
                starts fresh; the others resume from seeded game states.
              </p>

              <div style={styles.pickerList}>
                {MOCK_IDENTITIES.map((m) => (
                  <label
                    key={m.learnerId}
                    style={{
                      ...styles.pickerOption,
                      ...(selectedMockId === m.learnerId
                        ? styles.pickerOptionSelected
                        : {}),
                    }}
                  >
                    <input
                      type="radio"
                      name="mock-identity"
                      value={m.learnerId}
                      checked={selectedMockId === m.learnerId}
                      onChange={() => setSelectedMockId(m.learnerId)}
                      style={{ marginRight: 10, accentColor: 'var(--c-primary)', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={styles.pickerLabel}>
                        {m.label}
                        <span style={styles.pickerTag}>{m.tag}</span>
                      </div>
                      <div style={styles.pickerDesc}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleMockSimulate}
                style={{ width: '100%', marginTop: 8 }}
              >
                Simulate →
              </Button>
            </div>
          )}

          {/* ── WAITING for SCORM postMessage ── */}
          {phase === 'waiting' && (
            <div style={styles.center}>
              <Spinner />
              <p style={styles.subtext}>Connecting to the learning system…</p>
            </div>
          )}

          {/* ── MANUAL fallback form ── */}
          {phase === 'manual' && (
            <div>
              <h2 style={styles.title}>Identify Yourself</h2>
              <p style={styles.subtext}>
                We couldn't automatically detect your learner identity.
                Please enter your TalentLMS email or username to continue.
              </p>
              <form onSubmit={handleManualSubmit} style={styles.form}>
                <input
                  type="text"
                  placeholder="TalentLMS email or username"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  required
                  style={styles.input}
                  autoFocus
                />
                <Button variant="primary" size="md" type="submit">
                  Continue
                </Button>
              </form>
            </div>
          )}

          {/* ── IDENTIFYING / loading from backend ── */}
          {phase === 'identifying' && (
            <div style={styles.center}>
              <Spinner />
              <p style={styles.subtext}>
                {identity
                  ? `Looking up your progress, ${identity.learnerName}…`
                  : 'Loading your game data…'}
              </p>
            </div>
          )}

          {/* ── READY — show welcome message and start button ── */}
          {phase === 'ready' && gameResult && (
            <div style={styles.center}>
              {/* Status icon */}
              <div style={styles.iconCircle}>
                {gameResult.isNewPlayer ? (
                  // Star: new player
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="white" stroke="white" strokeWidth="0"
                    />
                  </svg>
                ) : (
                  // Checkmark: returning player
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="20 6 9 17 4 12"
                      stroke="white" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Welcome message */}
              <h2 style={styles.title}>
                {gameResult.isNewPlayer
                  ? `Welcome, ${gameResult.player.display_name}!`
                  : `Welcome back, ${gameResult.player.display_name}.`}
              </h2>
              <p style={styles.subtext}>
                {gameResult.isNewPlayer
                  ? 'A new game will be started for you.'
                  : "We found your saved progress. You'll resume where you left off."}
              </p>

              {/* Progress badge for returning players */}
              {!gameResult.isNewPlayer && (
                <div style={styles.progressBadge}>
                  <span style={styles.badgeItem}>
                    📅 Quarter {gameResult.gameState.current_quarter} of 20
                  </span>
                  <span style={styles.badgeItem}>
                    💵 ${gameResult.gameState.cash?.toLocaleString()}
                  </span>
                  <span style={styles.badgeItem}>
                    ⭐ Rep: {gameResult.gameState.reputation}
                  </span>
                </div>
              )}

              {/* CTA */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartGame}
                style={{ marginTop: 8 }}
              >
                {gameResult.isNewPlayer ? 'Start Game' : 'Resume Game'}
              </Button>

              {/* Dev: back to picker */}
              {isMockScormMode && (
                <button
                  onClick={() => {
                    setPhase('mock-picker')
                    setGameResult(null)
                    setIdentity(null)
                  }}
                  style={styles.devBackLink}
                >
                  ← Pick a different identity
                </button>
              )}
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <div style={styles.center}>
              <div style={{ ...styles.iconCircle, background: 'var(--c-error)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="6"  y1="6" x2="18" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={styles.title}>Something went wrong</h2>
              <p style={{ ...styles.subtext, color: 'var(--c-error)' }}>{errorMsg}</p>
              <Button
                variant="primary"
                size="md"
                onClick={() =>
                  identity ? callBackend(identity) : setPhase(isMockScormMode ? 'mock-picker' : 'manual')
                }
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={spinnerStyles.wrapper} aria-label="Loading">
      <div style={spinnerStyles.ring} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = {
  screen: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      '100%',
    padding:        '24px 16px',
    gap:            16,
  },
  devBanner: {
    background:   '#fdf8e1',
    border:       '1px solid #f1bd19',
    borderRadius: 8,
    padding:      '8px 16px',
    fontSize:     12,
    fontWeight:   600,
    color:        '#7a5c00',
    fontFamily:   'var(--f-heading)',
    maxWidth:     480,
    width:        '100%',
    textAlign:    'center',
  },
  card: {
    background:   'var(--c-surface)',
    borderRadius: 'var(--r-xl)',
    boxShadow:    'var(--sh-card)',
    border:       '1px solid var(--c-border)',
    padding:      '40px 32px',
    maxWidth:     480,
    width:        '100%',
  },
  center: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    textAlign:      'center',
    gap:            16,
  },
  title: {
    fontFamily: 'var(--f-heading)',
    fontWeight: 700,
    fontSize:   22,
    color:      'var(--c-text)',
    lineHeight: 1.3,
    margin:     0,
  },
  subtext: {
    fontSize:   14,
    color:      'var(--c-text-muted)',
    lineHeight: 1.6,
    maxWidth:   340,
    margin:     0,
  },
  form: {
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
    marginTop:     20,
  },
  input: {
    padding:      '10px 14px',
    borderRadius: 'var(--r-md)',
    border:       '1.5px solid var(--c-border-dk)',
    fontSize:     14,
    fontFamily:   'var(--f-body)',
    color:        'var(--c-text)',
    background:   'var(--c-bg)',
    outline:      'none',
    width:        '100%',
    boxSizing:    'border-box',
  },
  iconCircle: {
    width:          56,
    height:         56,
    borderRadius:   '50%',
    background:     'var(--c-primary)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },
  progressBadge: {
    display:        'flex',
    flexWrap:       'wrap',
    gap:            8,
    justifyContent: 'center',
    padding:        '12px 16px',
    background:     'var(--c-bg)',
    borderRadius:   'var(--r-lg)',
    border:         '1px solid var(--c-border)',
  },
  badgeItem: {
    fontSize:   13,
    fontWeight: 600,
    color:      'var(--c-text)',
    fontFamily: 'var(--f-heading)',
  },
  // Mock picker styles
  pickerList: {
    display:       'flex',
    flexDirection: 'column',
    gap:           8,
    marginTop:     20,
    marginBottom:  20,
  },
  pickerOption: {
    display:      'flex',
    alignItems:   'flex-start',
    gap:          0,
    padding:      '12px 14px',
    borderRadius: 'var(--r-md)',
    border:       '1.5px solid var(--c-border)',
    cursor:       'pointer',
    background:   'var(--c-bg)',
    transition:   'border-color 0.15s, background 0.15s',
  },
  pickerOptionSelected: {
    borderColor: 'var(--c-primary)',
    background:  'color-mix(in srgb, var(--c-primary) 6%, var(--c-bg))',
  },
  pickerLabel: {
    display:    'flex',
    alignItems: 'center',
    gap:        8,
    fontFamily: 'var(--f-heading)',
    fontWeight: 700,
    fontSize:   14,
    color:      'var(--c-text)',
  },
  pickerTag: {
    fontSize:     11,
    fontWeight:   600,
    fontFamily:   'var(--f-heading)',
    color:        'var(--c-primary)',
    background:   'color-mix(in srgb, var(--c-primary) 12%, transparent)',
    padding:      '2px 7px',
    borderRadius: 20,
  },
  pickerDesc: {
    fontSize:   12,
    color:      'var(--c-text-muted)',
    marginTop:  3,
    lineHeight: 1.4,
  },
  devBackLink: {
    background:  'none',
    border:      'none',
    cursor:      'pointer',
    fontSize:    12,
    color:       'var(--c-text-muted)',
    padding:     0,
    marginTop:   4,
    fontFamily:  'var(--f-body)',
    textDecoration: 'underline',
  },
}

const spinnerStyles = {
  wrapper: {
    width:          48,
    height:         48,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  },
  ring: {
    width:        40,
    height:       40,
    border:       '3px solid var(--c-border-dk)',
    borderTop:    '3px solid var(--c-primary)',
    borderRadius: '50%',
    animation:    'spin 0.8s linear infinite',
  },
}
