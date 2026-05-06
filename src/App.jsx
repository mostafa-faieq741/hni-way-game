import React, { useState } from 'react'
import HNILogo from './components/HNILogo.jsx'
import Navigation from './components/Navigation.jsx'

import StartScreen         from './screens/StartScreen.jsx'
import ObjectivesScreen    from './screens/ObjectivesScreen.jsx'
import KeyTermsScreen      from './screens/KeyTermsScreen.jsx'
import BeforeYouPlayScreen from './screens/BeforeYouPlayScreen.jsx'
import ReadyToStartScreen  from './screens/ReadyToStartScreen.jsx'
import PlayerSetupScreen   from './screens/PlayerSetupScreen.jsx'

/*
 * Screen index map
 * ─────────────────────────────────────────────────────────────────────────────
 * 0 – StartScreen          (no nav, no back)
 * 1 – ObjectivesScreen     (next only, no back to Start)
 * 2 – KeyTermsScreen       (back ↔ next)
 * 3 – BeforeYouPlayScreen  (back ↔ "Continue to Game")
 * 4 – ReadyToStartScreen   (no nav footer; internal CTA navigates to 5)
 * 5 – PlayerSetupScreen    (no nav footer; handles SCORM identity & game start)
 *
 * Screens 6+ will be the actual game simulation, added in future phases.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const SCREEN_TITLES = [
  null,                    // 0: Start – no header title
  'Overview & Objective',  // 1
  'Key Terms',             // 2
  'Before You Play',       // 3
  'Ready to Start',        // 4
  'Player Setup',          // 5
]

const TOTAL_SCREENS = 6

// Screens that suppress both the header and the nav footer
const SCREENS_WITHOUT_CHROME = new Set([0, 4, 5])

export default function App() {
  const [screenIndex, setScreenIndex] = useState(0)

  /**
   * Game result received from PlayerSetupScreen once the player is identified
   * and game state is loaded. Passed down to future game screens.
   * Shape: { player: object, gameState: object, isNewPlayer: boolean }
   */
  const [gameResult, setGameResult] = useState(null)

  /* ── Navigation helpers ── */
  const goNext = () =>
    setScreenIndex((i) => Math.min(i + 1, TOTAL_SCREENS - 1))

  const goBack = () =>
    setScreenIndex((i) => Math.max(i - 1, 1))

  const goTo = (index) => setScreenIndex(index)

  /* ── Determine which chrome elements to render ── */
  const showHeader = !SCREENS_WITHOUT_CHROME.has(screenIndex)
  const showNav    = !SCREENS_WITHOUT_CHROME.has(screenIndex)

  const navConfig = {
    showBack:  screenIndex > 1,
    showNext:  true,
    nextLabel: screenIndex === 3 ? 'Continue to Game' : 'Next',
    backLabel: 'Back',
  }

  /* ── Render active screen ── */
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
            <KeyTermsScreen />
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
              // TODO: goTo(6) when the first game simulation screen is added
              console.info('[App] Game ready – player:', result.player.display_name,
                           '| isNew:', result.isNewPlayer)
            }}
          />
        )

      default:
        return (
          <main className="app-main">
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-text-muted)' }}>
              Game simulation screens will be added in the next phase.
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
