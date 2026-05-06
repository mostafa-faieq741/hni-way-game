/**
 * GameContainer.jsx
 * Manages all in-game state and sub-navigation.
 * Renders the correct screen based on gameScreen state.
 * The bottom GameNav is shown for main screens (home, forecast, finance).
 *
 * Demo mode: persists game state to localStorage automatically so progress
 * survives page refreshes. Key: hni_demo_game_state
 * TODO: Replace localStorage persistence with real backend (Google Sheets) when ready.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import HNILogo from '../../components/HNILogo.jsx'
import GameNav from '../../components/GameNav.jsx'

import HomeScreen            from './HomeScreen.jsx'
import ForecastScreen        from './ForecastScreen.jsx'
import FinanceScreen         from './FinanceScreen.jsx'
import DepartmentDetailScreen from './DepartmentDetailScreen.jsx'
import SalesRequestListScreen from './SalesRequestListScreen.jsx'
import ProjectDetailScreen   from './ProjectDetailScreen.jsx'
import YearSummaryScreen     from './YearSummaryScreen.jsx'
import FinalReportScreen     from './FinalReportScreen.jsx'

import { createDepartmentState } from '../../data/departments.js'
import { GAME_CONFIG }           from '../../data/gameConfig.js'
import { DEMO_SAVE_KEY }         from '../PlayerSetupScreen.jsx'

// ── Main screens that show the bottom tab bar ─────────────────────────────────
const MAIN_SCREENS = new Set(['home', 'forecast', 'finance'])

// ── localStorage helpers ──────────────────────────────────────────────────────

function saveToLocalStorage(state) {
  try {
    // Save a serialisable snapshot (omit functions / circular refs)
    const snapshot = {
      cash:                    state.cash,
      reputation:              state.reputation,
      netProfit:               state.netProfit,
      totalRevenue:            state.totalRevenue,
      totalCosts:              state.totalCosts,
      overallQuarter:          state.overallQuarter,
      currentYear:             state.currentYear,
      yearQuarter:             state.yearQuarter,
      departments:             state.departments,
      activeProjects:          state.activeProjects,
      acceptedCount:           state.acceptedCount,
      rejectedCount:           state.rejectedCount,
      completedProjects:       state.completedProjects,
      forecastPurchasedByYear: state.forecastPurchasedByYear,
      quarterRevenue:          state.quarterRevenue,
      quarterCOGS:             state.quarterCOGS,
      yearSummaries:           state.yearSummaries,
      playerId:                state.playerId,
      playerName:              state.playerName,
    }
    localStorage.setItem(DEMO_SAVE_KEY, JSON.stringify(snapshot))
  } catch (e) {
    console.warn('[GameContainer] Could not save to localStorage:', e)
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(DEMO_SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ── Initial game state ────────────────────────────────────────────────────────

function buildInitialGs(setupResult) {
  const base = {
    // Player
    playerId:   setupResult?.player?.player_id   ?? 'demo-001',
    playerName: setupResult?.player?.display_name ?? 'Player',

    // Financials
    cash:         GAME_CONFIG.startingCash,
    reputation:   0,
    netProfit:    0,
    totalRevenue: 0,
    totalCosts:   0,

    // Quarter / Year
    overallQuarter: 1,   // 1-20
    currentYear:    1,   // 1-5
    yearQuarter:    1,   // 1-4

    // Departments (mutable staffing state)
    departments: createDepartmentState(),

    // Projects
    activeProjects: [],
    acceptedCount:  0,
    rejectedCount:  0,
    completedProjects: [],

    // Forecast: keyed by year → boolean
    forecastPurchasedByYear: {},

    // Quarter-level revenue/COGS (reset each quarter)
    quarterRevenue: 0,
    quarterCOGS:    0,

    // Year history
    yearSummaries: [],
  }

  // If this is a returning demo player, try to load from localStorage
  if (!setupResult?.isNewPlayer) {
    const saved = loadFromLocalStorage()
    if (saved) {
      console.info('[GameContainer] Restoring demo progress from localStorage.')
      return { ...base, ...saved }
    }
  }

  return base
}

export default function GameContainer({ gameSetupResult }) {
  const [gs, setGs] = useState(() => buildInitialGs(gameSetupResult))

  // Sub-navigation
  const [gameScreen, setGameScreen] = useState('home')
  const [selectedDept, setSelectedDept]       = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [completedYear, setCompletedYear]     = useState(null)

  // Toast
  const [toast, setToast]     = useState(null)
  const toastTimer             = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Auto-save to localStorage whenever gs changes (demo mode persistence)
  // TODO: Replace with real backend save when Google Sheets integration is ready.
  useEffect(() => {
    saveToLocalStorage(gs)
  }, [gs])

  // ── State helpers ───────────────────────────────────────────────────────────

  const updateGs = useCallback((patch) => {
    setGs((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateDept = useCallback((deptId, patch) => {
    setGs((prev) => ({
      ...prev,
      departments: prev.departments.map((d) =>
        d.id === deptId ? { ...d, ...patch } : d
      ),
    }))
  }, [])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const navigate = useCallback((screen, extra = {}) => {
    setGameScreen(screen)
    if (extra.dept)    setSelectedDept(extra.dept)
    if (extra.project) setSelectedProject(extra.project)
  }, [])

  const goHome = useCallback(() => setGameScreen('home'), [])

  // ── Submit Quarter ──────────────────────────────────────────────────────────

  const handleSubmitQuarter = useCallback(() => {
    setGs((prev) => {
      const fixedExpenses = prev.departments.reduce(
        (sum, d) =>
          sum +
          d.specialists * GAME_CONFIG.specialistCostPerQuarter +
          d.consultants  * GAME_CONFIG.consultantCostPerQuarter,
        0
      )

      // Tick down active project durations
      const updatedProjects = prev.activeProjects
        .map((p) => ({ ...p, quartersLeft: p.quartersLeft - 1 }))
        .filter((p) => p.quartersLeft > 0) // remove completed (simplified)

      const newTotalCosts = prev.totalCosts + fixedExpenses + prev.quarterCOGS
      const newNetProfit  = prev.totalRevenue - newTotalCosts
      const newOverall    = prev.overallQuarter + 1
      const newYear       = Math.ceil(newOverall / 4)
      const newYearQtr    = ((newOverall - 1) % 4) + 1
      const wasLastOfYear = prev.yearQuarter === 4

      const yearSummary = wasLastOfYear
        ? {
            year:         prev.currentYear,
            revenue:      prev.totalRevenue,
            expenses:     newTotalCosts,
            netProfit:    newNetProfit,
            reputation:   prev.reputation,
          }
        : null

      return {
        ...prev,
        overallQuarter:   newOverall,
        currentYear:      newYear,
        yearQuarter:      newYearQtr,
        cash:             prev.cash - fixedExpenses,
        totalCosts:       newTotalCosts,
        netProfit:        newNetProfit,
        quarterRevenue:   0,
        quarterCOGS:      0,
        activeProjects:   updatedProjects,
        yearSummaries:    yearSummary
          ? [...prev.yearSummaries, yearSummary]
          : prev.yearSummaries,
      }
    })

    // Determine next screen after state update
    setGs((prev) => {
      if (prev.overallQuarter > GAME_CONFIG.totalQuarters) {
        setGameScreen('final-report')
      } else if (prev.yearQuarter === 1 && prev.currentYear > 1) {
        setCompletedYear(prev.currentYear - 1)
        setGameScreen('year-summary')
      } else {
        setGameScreen('home')
        showToast(`Quarter submitted. Now in Q${prev.yearQuarter}, Year ${prev.currentYear}.`)
      }
      return prev // no further mutation
    })
  }, [showToast])

  // ── Accept / Reject project ─────────────────────────────────────────────────

  const handleAcceptProject = useCallback((activeProj) => {
    setGs((prev) => ({
      ...prev,
      activeProjects: [...prev.activeProjects, activeProj],
      acceptedCount:  prev.acceptedCount + 1,
    }))
  }, [])

  const handleRejectProject = useCallback(() => {
    setGs((prev) => ({ ...prev, rejectedCount: prev.rejectedCount + 1 }))
  }, [])

  // ── Year Summary continue ───────────────────────────────────────────────────

  const handleContinueYear = useCallback(() => {
    setGameScreen('home')
    showToast('Welcome to the new year! Check the Forecast for this year\'s signals.')
  }, [showToast])

  // ── Restart (Final Report) ──────────────────────────────────────────────────

  const handleRestart = useCallback(() => {
    try { localStorage.removeItem(DEMO_SAVE_KEY) } catch {}
    setGs(buildInitialGs({ player: gameSetupResult?.player, isNewPlayer: true }))
    setGameScreen('home')
    setSelectedDept(null)
    setSelectedProject(null)
    setCompletedYear(null)
    showToast('Demo restarted. Good luck!')
  }, [gameSetupResult])

  // ── Render ──────────────────────────────────────────────────────────────────

  const showNav = MAIN_SCREENS.has(gameScreen)

  return (
    <div className="game-shell">
      {/* Top bar */}
      <div className="game-topbar">
        <div className="game-topbar__logo">
          <HNILogo height={28} />
        </div>
        <div className="game-topbar__badge">
          Q{gs.yearQuarter} · Year {gs.currentYear}
        </div>
        <div className="game-topbar__player">
          {gs.playerName} · ${gs.cash.toLocaleString()} · Rep {gs.reputation}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="game-content">
        {gameScreen === 'home' && (
          <HomeScreen gs={gs} onNavigate={navigate} />
        )}

        {gameScreen === 'forecast' && (
          <ForecastScreen
            gs={gs}
            onUpdateGs={updateGs}
            onShowToast={showToast}
          />
        )}

        {gameScreen === 'finance' && (
          <FinanceScreen
            gs={gs}
            onUpdateGs={updateGs}
            onSubmitQuarter={handleSubmitQuarter}
            onShowToast={showToast}
          />
        )}

        {gameScreen === 'dept-detail' && selectedDept && (
          <DepartmentDetailScreen
            dept={selectedDept}
            gs={gs}
            onUpdateDept={updateDept}
            onGoBack={goHome}
            onShowToast={showToast}
          />
        )}

        {gameScreen === 'sales-requests' && (
          <SalesRequestListScreen
            gs={gs}
            onGoBack={goHome}
            onOpenProject={(proj) => navigate('project-detail', { project: proj })}
          />
        )}

        {gameScreen === 'project-detail' && selectedProject && (
          <ProjectDetailScreen
            project={selectedProject}
            gs={gs}
            onGoBack={goHome}
            onGoToSalesRequests={() => setGameScreen('sales-requests')}
            onAccept={handleAcceptProject}
            onReject={handleRejectProject}
            onShowToast={showToast}
          />
        )}

        {gameScreen === 'year-summary' && (
          <YearSummaryScreen
            gs={gs}
            completedYear={completedYear}
            onContinue={handleContinueYear}
          />
        )}

        {gameScreen === 'final-report' && (
          <FinalReportScreen gs={gs} onRestart={handleRestart} />
        )}
      </div>

      {/* Bottom tab nav — only on main screens */}
      {showNav && (
        <GameNav
          activeScreen={gameScreen}
          onNavigate={(screen) => setGameScreen(screen)}
        />
      )}

      {/* Toast feedback */}
      {toast && <div className="game-toast">{toast}</div>}
    </div>
  )
}
