import React, { useState, useEffect } from 'react'
import HNILogo from './components/HNILogo.jsx'
import Navigation from './components/Navigation.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

import SignInScreen        from './screens/SignInScreen.jsx'
import AdminDashboard      from './screens/AdminDashboard.jsx'
import StartScreen         from './screens/StartScreen.jsx'
import ObjectivesScreen    from './screens/ObjectivesScreen.jsx'
import KeyTermsScreen      from './screens/KeyTermsScreen.jsx'
import BeforeYouPlayScreen from './screens/BeforeYouPlayScreen.jsx'
import ReadyToStartScreen  from './screens/ReadyToStartScreen.jsx'
import PlayerSetupScreen   from './screens/PlayerSetupScreen.jsx'
import GameContainer       from './screens/game/GameContainer.jsx'
import { signOut, lmsLogin, loadProgress } from './services/authClient.js'
import { inLmsContext } from './services/identityMode.js'
import { receiveScormLearnerIdentity } from './services/scormService.js'

const SCREEN_TITLES = [
  null,
  'Overview & Objective',
  'Key Terms',
  'Before You Play',
  'Ready to Start',
  'Player Setup',
  null,
]

const TOTAL_SCREENS = 7

const SCREENS_WITHOUT_CHROME = new Set([0, 4, 5, 6])

export default function App() {
  // App-level role gate. 'signin' is the entry point.
  const [mode, setMode] = useState('signin') // 'signin' | 'player' | 'admin'

  const [screenIndex, setScreenIndex] = useState(0)
  const [gameResult, setGameResult] = useState(null)
  const [account, setAccount] = useState(null)

  // Enter the player flow. If the player already has a saved game, drop them
  // straight back into it; otherwise run the onboarding and start fresh.
  const enterAsPlayer = async (acc) => {
    setAccount(acc)
    let state = null
    try { state = await loadProgress(acc.player_id) } catch {}
    if (state) {
      setGameResult({
        player: { player_id: acc.player_id, display_name: acc.display_name || acc.username, email: acc.email || null },
        isNewPlayer: false,
        serverState: state,
      })
      setScreenIndex(6)
    } else {
      setScreenIndex(0)
    }
    setMode('player')
  }

  // LMS/SCORM launch: if embedded in an LMS, resolve the learner identity and
  // jump straight into the game (no login form). Standalone launches ignore this.
  useEffect(() => {
    if (!inLmsContext()) return
    let cancelled = false
    receiveScormLearnerIdentity({ timeoutMs: 6000 })
      .then((idn) => lmsLogin(idn.learnerId, idn.learnerName))
      .then((acc) => { if (!cancelled) enterAsPlayer(acc) })
      .catch(() => { /* no SCORM identity -> fall back to the sign-in screen */ })
    return () => { cancelled = true }
  }, [])

  const goNext = () => setScreenIndex((i) => Math.min(i + 1, TOTAL_SCREENS - 1))
  const goBack = () => setScreenIndex((i) => Math.max(i - 1, 1))
  const goTo = (index) => setScreenIndex(index)

  // ── Sign in (entry) ──────────────────────────────────────────────
  if (mode === 'signin') {
    return (
      <div className="app">
        <SignInScreen
          onSignedIn={(acc) => {
            if (acc.role === 'admin') { setAccount(acc); setMode('admin') }
            else enterAsPlayer(acc)
          }}
        />
      </div>
    )
  }

  // ── Admin (dashboard only) ───────────────────────────────────────
  if (mode === 'admin') {
    return (
      <div className="app">
        <AdminDashboard onSignOut={() => { signOut(); setAccount(null); setMode('signin') }} />
      </div>
    )
  }

  // ── Player (the original simulation flow) ────────────────────────
  const showHeader = !SCREENS_WITHOUT_CHROME.has(screenIndex)
  const showNav    = !SCREENS_WITHOUT_CHROME.has(screenIndex)

  const navConfig = {
    showBack:  screenIndex > 1,
    showNext:  screenIndex !== 2,
    nextLabel: screenIndex === 3 ? 'Continue to Game' : 'Next',
    backLabel: 'Back',
  }

  const renderScreen = () => {
    switch (screenIndex) {
      case 0:
        return <StartScreen onStart={goNext} />
      case 1:
        return (
          <main className="app-main">
            <ObjectivesScreen />
          </main>
        )
      case 2:
        return (
          <main className="app-main">
            <KeyTermsScreen onContinue={goNext} />
          </main>
        )
      case 3:
        return (
          <main className="app-main">
            <BeforeYouPlayScreen onContinueToGame={goNext} />
          </main>
        )
      case 4:
        return <ReadyToStartScreen onFinish={() => goTo(5)} />
      case 5:
        return (
          <PlayerSetupScreen
            account={account}
            onGameReady={(result) => {
              setGameResult(result)
              goTo(6)
            }}
          />
        )
      case 6:
        return <GameContainer gameSetupResult={gameResult} />
      default:
        return (
          <main className="app-main">
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-text-muted)' }}>
              Screen {screenIndex} coming soon.
            </div>
          </main>
        )
    }
  }

  return (
    <div className="app">
      {showHeader && (
        <header className="app-header">
          <HNILogo height={36} />
          <div className="app-header__divider" aria-hidden="true" />
          <span className="app-header__title">
            {SCREEN_TITLES[screenIndex]}
          </span>
          <ThemeToggle style={{ marginLeft: 'auto' }} />
        </header>
      )}

      {renderScreen()}

      {showNav && (
        <Navigation
          showBack={navConfig.showBack}
          showNext={navConfig.showNext}
          nextLabel={navConfig.nextLabel}
          backLabel={navConfig.backLabel}
          onNext={goNext}
          onBack={goBack}
        />
      )}
    </div>
  )
}
