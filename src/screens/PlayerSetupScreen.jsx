/**
 * PlayerSetupScreen.jsx
 * Auto-start gate. No choices: it resolves the player's identity, checks for a
 * saved game (server first, then local), and immediately enters the game —
 * resuming where they left off, or starting fresh if there is no save.
 *
 * @prop {function} onGameReady – receives { player, isNewPlayer, serverState, demoMode }
 * @prop {object}   account     – the signed-in account (null in demo/dev)
 */
import React, { useEffect } from 'react'
import HNILogo from '../components/HNILogo.jsx'
import { loadProgress } from '../services/authClient.js'

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

export default function PlayerSetupScreen({ onGameReady, account }) {
  const identity = account ? {
    player_id:    account.player_id,
    display_name: account.display_name || account.username,
    email:        account.email || null,
    learnerId:    account.player_id,
    learnerName:  account.display_name || account.username,
    status:       'active',
  } : DEMO_PLAYER

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let state = null
      if (account?.player_id) {
        try { state = await loadProgress(account.player_id) } catch {}
      }
      let found = !!state
      if (!found) { try { found = !!localStorage.getItem(saveKeyFor(identity.player_id)) } catch {} }
      if (cancelled) return
      onGameReady({
        player: identity,
        isNewPlayer: !found,
        serverState: found ? state : null,
        demoMode: !account,
      })
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.player_id])

  return (
    <main className="app-main">
      <div className="screen" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 18, textAlign: 'center',
      }}>
        <HNILogo height={40} />
        <div style={{
          width: 44, height: 44, border: '4px solid var(--c-border)',
          borderTopColor: 'var(--c-primary)', borderRadius: '50%',
          animation: 'hni-spin 0.8s linear infinite',
        }} />
        <p style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>Setting up your game…</p>
        <style>{`@keyframes hni-spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </main>
  )
}
