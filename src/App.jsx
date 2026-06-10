import React, { useState } from 'react'
import HNILogo from './components/HNILogo.jsx'
import Navigation from './components/Navigation.jsx'

import SignInScreen        from './screens/SignInScreen.jsx'
import AdminDashboard      from './screens/AdminDashboard.jsx'
import StartScreen         from './screens/StartScreen.jsx'
import ObjectivesScreen    from './screens/ObjectivesScreen.jsx'
import KeyTermsScreen      from './screens/KeyTermsScreen.jsx'
import BeforeYouPlayScreen from './screens/BeforeYouPlayScreen.jsx'
import ReadyToStartScreen  from './screens/ReadyToStartScreen.jsx'
import PlayerSetupScreen   from './screens/PlayerSetupScreen.jsx'
import GameContainer       from './screens/game/GameContainer.jsx'

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

  const goNext = () => setScreenIndex((i) => Math.min(i + 1, TOTAL_SCREENS - 1))
  const goBack = () => setScreenIndex((i) => Math.max(i - 1, 1))
  const goTo = (index) => setScreenIndex(index)

  // ── Sign in (entry) ──────────────────────────────────────────────
  if (mode === 'signin') {
    return (
      <div className="app">
        <SignInScreen
          onSelectRole={(role) => {
            if (role === 'admin') {
              setMode('admin')
            } else {
              setScreenIndex(0)
              setMode('player')
            }
          }}
        />
      </div>
    )
  }

  // ── Admin (dashboard only) ───────────────────────────────────────
  if (mode === 'admin') {
    return (
      <div className="app">
        <AdminDashboard onSignOut={() => setMode('signin')} />
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
