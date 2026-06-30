/**
 * PlayerSetupScreen.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Prototype / Demo mode — bypasses all LMS, SCORM, and backend dependencies.
 *
 * USE_MOCK_PLAYER = true  →  always uses the Demo Learner identity.
 *   - Checks localStorage for existing demo progress.
 *   - "Start Demo Game"   → starts fresh if no progress found.
 *   - "Resume Demo Game"  → continues from localStorage if progress exists.
 *   - "Reset Demo Progress" → clears localStorage and starts fresh.
 *
 * TODO (future integration):
 *   - Set USE_MOCK_PLAYER = false when TalentLMS / SCORM is connected.
 *   - Re-enable the SCORM postMessage flow from scormService.js.
 *   - Re-enable the real backend startGame() call from apiClient.js.
 *
 * @prop {function} onGameReady – called when demo game is ready to start;
 *                                receives { player, isNewPlayer, demoMode: true }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react'
import Button from '../components/Button.jsx'
import HNILogo from '../components/HNILogo.jsx'
import { loadProgress } from '../services/authClient.js'

// ─────────────────────────────────────────────────────────────────────────────
// Demo mode config
// TODO: Set USE_MOCK_PLAYER = false when real LMS/SCORM integration is ready.
// ─────────────────────────────────────────────────────────────────────────────

const USE_MOCK_PLAYER = true

const DEMO_PLAYER = {
  player_id:    'demo-001',
  display_name: 'Demo Learner',
  email:        'demo@hni.com',
  learnerId:    'demo-001',
  learnerName:  'Demo Learner',
  status:       'active',
}

/** localStorage key for a player's saved game (per account). */
export const saveKeyFor = (id) => 'hni_save_' + (id || 'demo-001')
/** Back-compat default key. */
export const DEMO_SAVE_KEY = saveKeyFor('demo-001')

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PlayerSetupScreen({ onGameReady, account }) {
  const [hasSavedProgress, setHasSavedProgress] = useState(false)
  const [serverState, setServerState] = useState(null)

  // The player identity comes from the signed-in account (falls back to demo).
  const identity = account ? {
    player_id:    account.player_id,
    display_name: account.display_name || account.username,
    email:        account.email || null,
    learnerId:    account.player_id,
    learnerName:  account.display_name || account.username,
    status:       'active',
  } : DEMO_PLAYER
  const initials = (identity.display_name || 'P').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  // Look for an existing saved game — the server (cross-device) first, then local.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let state = null
      if (account?.player_id) state = await loadProgress(account.player_id)
      let found = !!state
      if (!found) { try { found = !!localStorage.getItem(saveKeyFor(identity.player_id)) } catch {} }
      if (!cancelled) { setServerState(state); setHasSavedProgress(found) }
    })()
    return () => { cancelled = true }
  }, [account?.player_id])

  // Start or resume the game
  const handleStartDemo = (forceNew = false) => {
    if (forceNew) {
      try { localStorage.removeItem(saveKeyFor(identity.player_id)) } catch {}
    }
    const isNewPlayer = forceNew || !hasSavedProgress
    onGameReady({
      player:      identity,
      isNewPlayer,
      serverState: isNewPlayer ? null : serverState,
      demoMode:    !account,
    })
  }

  // Reset progress and start fresh
  const handleReset = () => {
    try { localStorage.removeItem(saveKeyFor(identity.player_id)) } catch {}
    setHasSavedProgress(false)
    onGameReady({
      player:      identity,
      isNewPlayer: true,
      serverState: null,
      demoMode:    !account,
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!USE_MOCK_PLAYER) {
    // TODO: restore the LMS/SCORM/backend flow here when USE_MOCK_PLAYER = false
    return (
      <main className="app-main">
        <div className="player-setup-screen screen" style={styles.screen}>
          <div style={styles.card}>
            <HNILogo height={32} style={{ margin: '0 auto 20px' }} />
            <div style={styles.center}>
              <p style={styles.subtext}>LMS integration coming soon.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="app-main">
      <div className="player-setup-screen screen" style={styles.screen}>

        {/* Demo mode banner */}
        <div style={styles.demoBanner}>
          🎮 Prototype Mode — Playable without TalentLMS or backend connection
        </div>

        {/* Card */}
        <div style={styles.card}>
          <HNILogo height={32} style={{ margin: '0 auto 20px' }} />

          <div style={styles.center}>
            {/* Icon */}
            <div style={styles.iconCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill="white"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 style={styles.title}>
              {hasSavedProgress ? 'Welcome Back!' : 'Ready to Play?'}
            </h2>

            {/* Player identity badge */}
            <div style={styles.playerBadge}>
              <span style={styles.badgeAvatar}>{initials}</span>
              <div>
                <div style={styles.badgeName}>{identity.display_name}</div>
                <div style={styles.badgeRole}>{account ? 'HNI Way Player' : 'HNI Way Prototype Player'}</div>
              </div>
            </div>

            {/* Progress indicator */}
            {hasSavedProgress && (
              <div style={styles.progressNote}>
                <span style={{ marginRight: 6 }}>💾</span>
                Saved demo progress found. Click <strong>Resume</strong> to continue
                where you left off, or start fresh below.
              </div>
            )}

            {/* Primary CTA */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleStartDemo(false)}
              style={{ width: '100%', marginTop: 8 }}
            >
              {hasSavedProgress ? 'Resume Demo Game' : 'Start Demo Game'}
            </Button>

            {/* Secondary actions */}
            {hasSavedProgress && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => handleStartDemo(true)}
                style={{ width: '100%', marginTop: 8 }}
              >
                Start New Demo Game
              </Button>
            )}

            <button
              onClick={handleReset}
              style={styles.resetLink}
              title="Clears all saved demo progress and starts a fresh game"
            >
              ↺ Reset Demo Progress
            </button>

            {/* Game info strip */}
            <div style={styles.infoStrip}>
              <div style={styles.infoItem}>
                <span style={styles.infoValue}>$100,000</span>
                <span style={styles.infoLabel}>Starting Cash</span>
              </div>
              <div style={styles.infoDivider} />
              <div style={styles.infoItem}>
                <span style={styles.infoValue}>20</span>
                <span style={styles.infoLabel}>Quarters</span>
              </div>
              <div style={styles.infoDivider} />
              <div style={styles.infoItem}>
                <span style={styles.infoValue}>5</span>
                <span style={styles.infoLabel}>Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p style={styles.footerNote}>
          Progress is saved locally in your browser.
          {/* TODO: When TalentLMS is connected, progress will sync to your course account. */}
        </p>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline styles (matches existing HNI card / surface system)
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
  demoBanner: {
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
  playerBadge: {
    display:      'flex',
    alignItems:   'center',
    gap:          12,
    background:   'var(--c-bg)',
    border:       '1px solid var(--c-border)',
    borderRadius: 'var(--r-lg)',
    padding:      '12px 16px',
    width:        '100%',
    textAlign:    'left',
  },
  badgeAvatar: {
    width:          40,
    height:         40,
    borderRadius:   '50%',
    background:     'var(--c-primary)',
    color:          '#fff',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontFamily:     'var(--f-heading)',
    fontWeight:     700,
    fontSize:       14,
    flexShrink:     0,
  },
  badgeName: {
    fontFamily: 'var(--f-heading)',
    fontWeight: 700,
    fontSize:   14,
    color:      'var(--c-text)',
  },
  badgeRole: {
    fontSize:   12,
    color:      'var(--c-text-muted)',
    marginTop:  2,
  },
  progressNote: {
    background:   '#f0f9f4',
    border:       '1px solid #a7d8bc',
    borderRadius: 'var(--r-md)',
    padding:      '10px 14px',
    fontSize:     13,
    color:        '#1a5c36',
    lineHeight:   1.5,
    width:        '100%',
    textAlign:    'left',
  },
  resetLink: {
    background:     'none',
    border:         'none',
    cursor:         'pointer',
    fontSize:       12,
    color:          'var(--c-text-muted)',
    padding:        '4px 0',
    fontFamily:     'var(--f-body)',
    textDecoration: 'underline',
    marginTop:      -4,
  },
  infoStrip: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            0,
    background:     'var(--c-bg)',
    borderRadius:   'var(--r-lg)',
    border:         '1px solid var(--c-border)',
    padding:        '14px 20px',
    width:          '100%',
    marginTop:      4,
  },
  infoItem: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    flex:           1,
  },
  infoValue: {
    fontFamily: 'var(--f-heading)',
    fontWeight: 800,
    fontSize:   18,
    color:      'var(--c-primary)',
  },
  infoLabel: {
    fontSize:  11,
    color:     'var(--c-text-muted)',
    marginTop: 2,
    fontFamily: 'var(--f-heading)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  infoDivider: {
    width:        1,
    height:       32,
    background:   'var(--c-border)',
    flexShrink:   0,
    margin:       '0 4px',
  },
  footerNote: {
    fontSize:   12,
    color:      'var(--c-text-muted)',
    maxWidth:   400,
    textAlign:  'center',
    lineHeight: 1.5,
  },
}
