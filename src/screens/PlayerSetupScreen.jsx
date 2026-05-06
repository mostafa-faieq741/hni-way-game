/**
 * PlayerSetupScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Handles player identity and game-state initialisation before the actual
 * game simulation begins.
 *
 * Identity resolution order:
 *   1. Wait for SCORM postMessage from the LMS wrapper (production path).
 *   2. In dev mode (VITE_DEV_MOCK_SCORM=true), resolve immediately with mock data.
 *   3. If SCORM message doesn't arrive within the timeout, show a manual
 *      fallback form asking for TalentLMS email or username.
 *
 * After identity is resolved:
 *   • Calls the backend POST /api/start-game to find or create the player.
 *   • Shows "Welcome back" (saved state found) or "New game" message.
 *   • "Start / Resume Game" button advances to the game proper.
 *
 * @prop {function} onGameReady – called when the player is identified and
 *                                game state is loaded; receives { player, gameState, isNewPlayer }
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
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayerSetupScreen({ onGameReady }) {
  /** Phase of the setup flow */
  const [phase, setPhase] = useState('waiting') // 'waiting' | 'manual' | 'identifying' | 'ready' | 'error'

  /** Learner identity (from SCORM or manual entry) */
  const [identity, setIdentity]       = useState(null)  // { learnerId, learnerName }

  /** Game start result from backend */
  const [gameResult, setGameResult]   = useState(null)  // { player, gameState, isNewPlayer }

  /** Manual form fields */
  const [manualInput, setManualInput] = useState('')

  /** Error message */
  const [errorMsg, setErrorMsg]       = useState('')

  // ─── Step 1: try to receive SCORM identity on mount ───────────────────────
  useEffect(() => {
    let cancelled = false

    receiveScormLearnerIdentity({ timeoutMs: 8000 })
      .then((id) => {
        if (cancelled) return
        setIdentity(id)
        setPhase('identifying')
        return callBackend(id)
      })
      .catch((err) => {
        if (cancelled) return
        // Timeout or no SCORM wrapper – fall back to manual entry
        console.warn('[PlayerSetup] SCORM identity not received:', err.message)
        setPhase('manual')
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Step 2: call the backend to load or create the player ────────────────
  const callBackend = useCallback(async (id) => {
    setPhase('identifying')
    setErrorMsg('')
    try {
      // TODO: replace mock with real call when backend is wired:
      //   const result = await startGame(id)
      // Mock result for development:
      const result = await startGame(id)

      // Initialise frontend game state service
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

  // ─── Manual form submit ───────────────────────────────────────────────────
  const handleManualSubmit = (e) => {
    e.preventDefault()
    const trimmed = manualInput.trim()
    if (!trimmed) return

    const id = {
      learnerId:   trimmed,
      learnerName: trimmed,
    }
    setIdentity(id)
    callBackend(id)
  }

  // ─── "Start / Resume Game" click ──────────────────────────────────────────
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

        {/* ── Dev banner ── */}
        {isMockScormMode && (
          <div style={styles.devBanner}>
            🛠 Dev Mode — SCORM identity is simulated (mock data)
          </div>
        )}

        {/* ── Card ── */}
        <div style={styles.card}>
          <HNILogo height={32} style={{ margin: '0 auto 20px' }} />

          {/* ── WAITING for SCORM ── */}
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
                  // Star icon for new players
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill="white" stroke="white" strokeWidth="0"
                    />
                  </svg>
                ) : (
                  // Checkmark for returning players
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
                  : 'We found your saved progress. You\'ll resume where you left off.'}
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
                onClick={() => identity ? callBackend(identity) : setPhase('manual')}
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
// Inline styles (mirrors the app's CSS variable system)
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
    background:  '#fdf8e1',
    border:      '1px solid #f1bd19',
    borderRadius: 8,
    padding:     '8px 16px',
    fontSize:    12,
    fontWeight:  600,
    color:       '#7a5c00',
    fontFamily:  'var(--f-heading)',
    maxWidth:    480,
    width:       '100%',
    textAlign:   'center',
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
    fontFamily:  'var(--f-heading)',
    fontWeight:  700,
    fontSize:    22,
    color:       'var(--c-text)',
    lineHeight:  1.3,
  },
  subtext: {
    fontSize:   14,
    color:      'var(--c-text-muted)',
    lineHeight: 1.6,
    maxWidth:   340,
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
}

const spinnerStyles = {
  wrapper: {
    width:  48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
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
