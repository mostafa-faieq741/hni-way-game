/**
 * GameContainer.jsx
 * Manages all in-game state and sub-navigation.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import HNILogo from '../../components/HNILogo.jsx'
import GameNav from '../../components/GameNav.jsx'
import SessionTimer from '../../components/SessionTimer.jsx'
import GlossaryModal from '../../components/GlossaryModal.jsx'
import LeaderboardModal from '../../components/LeaderboardModal.jsx'
import EventModal from '../../components/EventModal.jsx'
import StatFloater from '../../components/StatFloater.jsx'
import EndQuarterModal from '../../components/EndQuarterModal.jsx'

import HomeScreen             from './HomeScreen.jsx'
import ForecastScreen         from './ForecastScreen.jsx'
import FinanceScreen          from './FinanceScreen.jsx'
import DepartmentDetailScreen from './DepartmentDetailScreen.jsx'
import SalesRequestListScreen from './SalesRequestListScreen.jsx'
import ProjectDetailScreen    from './ProjectDetailScreen.jsx'
import ActiveProjectsScreen   from './ActiveProjectsScreen.jsx'
import YearSummaryScreen      from './YearSummaryScreen.jsx'
import FinalReportScreen      from './FinalReportScreen.jsx'

import { createDepartmentState } from '../../data/departments.js'
import { GAME_CONFIG }            from '../../data/gameConfig.js'
import { DEMO_SAVE_KEY }          from '../PlayerSetupScreen.jsx'
import {
  MAX_ACTIVE_PROJECTS,
  makeActiveProject,
  resolveProjectsForQuarter,
  computeFixedExpenses,
} from '../../data/projectLifecycle.js'
import { drawEvents } from '../../data/events.js'
import { buildQuarterBriefs } from '../../data/projects.js'

const TAB_TO_SCREEN = { home: 'home', forecast: 'forecast', finance: 'finance' }
const HIDE_NAV_ON = new Set(['year-summary', 'final-report'])

// Which top-level tab is "active" for a given sub-screen
function tabForScreen(screen) {
  if (screen === 'forecast') return 'forecast'
  if (screen === 'finance')  return 'finance'
  // home, sales-requests, project-detail, active-projects, active-project-detail, dept-detail
  return 'home'
}

function saveToLocalStorage(state) {
  try {
    const snapshot = {
      cash: state.cash,
      reputation: state.reputation,
      netProfit: state.netProfit,
      totalRevenue: state.totalRevenue,
      totalCosts: state.totalCosts,
      overallQuarter: state.overallQuarter,
      currentYear: state.currentYear,
      yearQuarter: state.yearQuarter,
      departments: state.departments,
      activeProjects: state.activeProjects,
      acceptedCount: state.acceptedCount,
      rejectedCount: state.rejectedCount,
      rejectedIds: state.rejectedIds,
      quarterRejectedIds: state.quarterRejectedIds,
      quarterBriefIds: state.quarterBriefIds,
      completedProjects: state.completedProjects,
      forecastPurchasedByYear: state.forecastPurchasedByYear,
      yearSummaries: state.yearSummaries,
      eventsTriggered: state.eventsTriggered,
      recurringExpenses: state.recurringExpenses,
      eventBag: state.eventBag,
      lastResolution: state.lastResolution,
      playerId: state.playerId,
      playerName: state.playerName,
      sessionStartedAt: state.sessionStartedAt,
    }
    localStorage.setItem(DEMO_SAVE_KEY, JSON.stringify(snapshot))
  } catch (e) {
    console.warn('[GameContainer] save failed:', e)
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

function buildInitialGs(setupResult) {
  const base = {
    playerId:   setupResult?.player?.player_id    ?? 'demo-001',
    playerName: setupResult?.player?.display_name ?? 'Player',
    cash:         GAME_CONFIG.startingCash,
    reputation:   0,
    netProfit:    0,
    totalRevenue: 0,
    totalCosts:   0,
    overallQuarter: 1,
    currentYear:    1,
    yearQuarter:    1,
    departments: createDepartmentState(),
    activeProjects: [],
    acceptedCount:  0,
    rejectedCount:  0,
    rejectedIds:   [],
    quarterRejectedIds: [],
    quarterBriefIds: [],
    completedProjects: [],
    forecastPurchasedByYear: {},
    eventsTriggered:        [],
    recurringExpenses:      0,
    eventBag:               [],
    yearSummaries:          [],
    lastResolution:         null,
    sessionStartedAt:       Date.now(),
  }
  base.quarterBriefIds = buildQuarterBriefs(base, [])
  if (!setupResult?.isNewPlayer) {
    const saved = loadFromLocalStorage()
    if (saved) return { ...base, ...saved }
  }
  return base
}

function patchDeptStaffing(prev, deptId, key, delta) {
  return {
    ...prev,
    departments: prev.departments.map((d) => {
      if (d.id !== deptId) return d
      const updated = { ...d }
      updated[key] = Math.max(0, (d[key] || 0) + delta)
      return updated
    }),
  }
}

function transferStaff(prev, sourceId, targetId, key) {
  return {
    ...prev,
    departments: prev.departments.map((d) => {
      if (d.id === sourceId) {
        const u = { ...d }
        u[key] = Math.max(0, (d[key] || 0) - 1)
        return u
      }
      if (d.id === targetId) {
        const u = { ...d }
        u[key] = (d[key] || 0) + 1
        return u
      }
      return d
    }),
  }
}

function hasHrStaff(prev) {
  const hr = prev.departments.find((d) => d.id === 'hr')
  return ((hr?.specialists || 0) + (hr?.consultants || 0)) > 0
}

// Apply a staff change from an event effect.
// delta > 0: add one staff to staff.deptId (default 'ld'), type default specialist.
// delta < 0: remove one staff from the first department that has any.
function applyStaffEffect(departments, staff) {
  const delta = staff?.delta || 0
  if (delta === 0) return { departments, msg: null }
  if (delta > 0) {
    const deptId = staff.deptId || 'ld'
    const key = staff.type === 'consultant' ? 'consultants' : 'specialists'
    return {
      departments: departments.map((d) =>
        d.id === deptId ? { ...d, [key]: (d[key] || 0) + 1 } : d
      ),
      msg: '+1 employee',
    }
  }
  // removal: take from the first department that has a specialist, else a consultant
  let removed = false
  let out = departments.map((d) => {
    if (removed) return d
    if ((d.specialists || 0) > 0) { removed = true; return { ...d, specialists: d.specialists - 1 } }
    return d
  })
  if (!removed) {
    out = departments.map((d) => {
      if (removed) return d
      if ((d.consultants || 0) > 0) { removed = true; return { ...d, consultants: d.consultants - 1 } }
      return d
    })
  }
  return { departments: removed ? out : departments, msg: removed ? '-1 employee' : null }
}

export default function GameContainer({ gameSetupResult }) {
  const [gs, setGs] = useState(() => buildInitialGs(gameSetupResult))

  const [gameScreen, setGameScreen] = useState('home')
  const [selectedDept, setSelectedDept] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedActiveProject, setSelectedActiveProject] = useState(null)
  const [completedYear, setCompletedYear] = useState(null)
  const [showGlossary, setShowGlossary] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [eventQueue, setEventQueue] = useState([])
  const [lossReason, setLossReason] = useState(null)

  // Explicit end-of-quarter flow: preview before commit, recap after.
  const [endPreviewOpen, setEndPreviewOpen] = useState(false)
  const [quarterSummary, setQuarterSummary] = useState(null)
  // Per-quarter guidance: which "This Quarter" steps the player has touched.
  const [quarterProgress, setQuarterProgress] = useState({ forecast: false, accept: false, staff: false })
  // One-time 'wrap up' warning shown when little session time remains.
  const [showTimeWarning, setShowTimeWarning] = useState(false)

  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const [floats, setFloats] = useState([])

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const pushFloat = useCallback((text, type = 'neutral') => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2)
    setFloats((arr) => [...arr, { id, text, type }])
    setTimeout(() => setFloats((arr) => arr.filter((f) => f.id !== id)), 2200)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])
  useEffect(() => { saveToLocalStorage(gs) }, [gs])

  // Immediate-loss thresholds: bankruptcy or reputation collapse ends the game.
  useEffect(() => {
    if (lossReason || gameScreen === 'final-report') return
    let reason = null
    if (gs.cash < GAME_CONFIG.loseCashFloor) reason = 'cash'
    else if (gs.reputation <= GAME_CONFIG.loseReputationFloor) reason = 'reputation'
    if (reason) {
      setLossReason(reason)
      setEndPreviewOpen(false)
      setQuarterSummary(null)
      setEventQueue([])
      setGameScreen('final-report')
    }
  }, [gs.cash, gs.reputation, gameScreen, lossReason])

  const updateGs = useCallback((patch) => {
    setGs((prev) => ({ ...prev, ...patch }))
  }, [])

  const navigate = useCallback((screen, extra = {}) => {
    setGameScreen(screen)
    if (extra.dept)          setSelectedDept(extra.dept)
    if (extra.project)       setSelectedProject(extra.project)
    if (extra.activeProject) setSelectedActiveProject(extra.activeProject)
    // Mark "This Quarter" steps as visited so the Home checklist reflects progress.
    if (screen === 'forecast')       setQuarterProgress((p) => ({ ...p, forecast: true }))
    if (screen === 'sales-requests') setQuarterProgress((p) => ({ ...p, accept: true }))
  }, [])

  const goHome = useCallback(() => setGameScreen('home'), [])

  const handleSubmitQuarter = useCallback(() => {
    setGs((prev) => {
      const fixedExpenses = computeFixedExpenses(prev.departments)
      const recurring = prev.recurringExpenses || 0
      const r = resolveProjectsForQuarter(prev)

      const newCash = prev.cash - fixedExpenses - recurring + r.revenueGained - r.extraCostsAdded
      const newTotalRevenue = prev.totalRevenue + r.revenueGained
      const newTotalCosts = prev.totalCosts + fixedExpenses + recurring + r.extraCostsAdded
      const newReputation = Math.max(GAME_CONFIG.loseReputationFloor, Math.min(GAME_CONFIG.maxReputation, prev.reputation + r.reputationDelta))
      const newNetProfit = newTotalRevenue - newTotalCosts

      const newOverall = prev.overallQuarter + 1
      const newYear = Math.ceil(newOverall / 4)
      const newYearQtr = ((newOverall - 1) % 4) + 1
      const wasLastOfYear = prev.yearQuarter === 4
      const gameOver = prev.overallQuarter >= GAME_CONFIG.totalQuarters

      const yearSummary = wasLastOfYear ? {
        year: prev.currentYear,
        revenue: newTotalRevenue,
        expenses: newTotalCosts,
        netProfit: newNetProfit,
        reputation: newReputation,
      } : null

      const resolution = {
        fixedExpenses,
        recurringExpenses: recurring,
        revenueGained: r.revenueGained,
        extraCostsAdded: r.extraCostsAdded,
        reputationDelta: r.reputationDelta,
        deliveredCodes: r.completedThisQtr.map((p) => p.code),
        overdueCodes: r.updatedProjects.filter((p) => p.status === 'overdue').map((p) => p.code),
      }

      if (fixedExpenses > 0)     pushFloat('-' + fixedExpenses.toLocaleString() + ' Ħ fixed', 'negative')
      if (recurring > 0)         pushFloat('-' + recurring.toLocaleString() + ' Ħ recurring', 'negative')
      if (r.revenueGained > 0)   pushFloat('+' + r.revenueGained.toLocaleString() + ' Ħ revenue', 'positive')
      if (r.extraCostsAdded > 0) pushFloat('-' + r.extraCostsAdded.toLocaleString() + ' Ħ overdue', 'negative')
      if (r.reputationDelta !== 0) {
        const sign = r.reputationDelta > 0 ? '+' : ''
        pushFloat(sign + r.reputationDelta + ' rep', r.reputationDelta > 0 ? 'positive' : 'negative')
      }

      const newState = {
        ...prev,
        cash: newCash,
        reputation: newReputation,
        totalRevenue: newTotalRevenue,
        totalCosts: newTotalCosts,
        netProfit: newNetProfit,
        activeProjects: r.updatedProjects,
        completedProjects: [...prev.completedProjects, ...r.completedThisQtr],
        overallQuarter: gameOver ? prev.overallQuarter : newOverall,
        currentYear: gameOver ? prev.currentYear : newYear,
        yearQuarter: gameOver ? prev.yearQuarter : newYearQtr,
        yearSummaries: yearSummary ? [...prev.yearSummaries, yearSummary] : prev.yearSummaries,
        lastResolution: resolution,
      }
      // Fresh fixed brief set for the new quarter (none while game is over).
      newState.quarterRejectedIds = gameOver ? prev.quarterRejectedIds : []
      newState.quarterBriefIds = gameOver ? prev.quarterBriefIds : buildQuarterBriefs(newState, [])
      return newState
    })

    setGs((prev) => {
      setEndPreviewOpen(false)
      setQuarterProgress({ forecast: false, accept: false, staff: false })
      let nextBag = prev.eventBag
      if (prev.overallQuarter >= GAME_CONFIG.totalQuarters && prev.lastResolution) {
        setGameScreen('final-report')
      } else if (prev.yearQuarter === 1 && prev.currentYear > 1) {
        setCompletedYear(prev.currentYear - 1)
        setGameScreen('year-summary')
        const drawn = drawEvents(prev.eventBag, 2)
        nextBag = drawn.nextBag
        setEventQueue(drawn.events)
      } else {
        setGameScreen('home')
        // Replace the old fading toast with an explicit "what changed" summary moment.
        setQuarterSummary(prev.lastResolution)
        const drawn = drawEvents(prev.eventBag, 2)
        nextBag = drawn.nextBag
        setEventQueue(drawn.events)
      }
      return { ...prev, eventBag: nextBag }
    })
  }, [showToast, pushFloat])

  // Open the end-of-quarter preview (the explicit, deliberate commit point).
  const requestEndQuarter = useCallback(() => setEndPreviewOpen(true), [])
  const confirmEndQuarter = useCallback(() => {
    setEndPreviewOpen(false)
    handleSubmitQuarter()
  }, [handleSubmitQuarter])

  // Hard session cap (GAME_CONFIG.sessionMinutes): ends the game gracefully
  // at the final report so total play time never exceeds the limit.
  const handleTimeUp = useCallback(() => {
    setEndPreviewOpen(false)
    setQuarterSummary(null)
    setEventQueue([])
    setShowTimeWarning(false)
    setGameScreen('final-report')
    showToast('Time is up - here is your final report.')
  }, [showToast])

  // Surface the wrap-up warning once, when ~2 minutes remain.
  const handleTimeWarn = useCallback(() => setShowTimeWarning(true), [])

  const handleAcceptProject = useCallback((template) => {
    setGs((prev) => {
      if (prev.activeProjects.length >= MAX_ACTIVE_PROJECTS) {
        showToast('You already have ' + MAX_ACTIVE_PROJECTS + ' active projects. Deliver some first.')
        return prev
      }
      if (prev.activeProjects.some((p) => p.id === template.id)) {
        showToast('This project is already active.')
        return prev
      }
      if (prev.cash < template.cost) {
        showToast('Need ' + template.cost.toLocaleString() + ' Ħ cash to accept this project.')
        return prev
      }
      const active = makeActiveProject(template, prev.overallQuarter)
      pushFloat('-' + template.cost.toLocaleString() + ' Ħ cash', 'negative')
      pushFloat('+1 active project', 'neutral')
      return {
        ...prev,
        cash: prev.cash - template.cost,
        totalCosts: prev.totalCosts + template.cost,
        activeProjects: [...prev.activeProjects, active],
        acceptedCount: prev.acceptedCount + 1,
      }
    })
  }, [showToast, pushFloat])

  const handleRejectProject = useCallback((template) => {
    setGs((prev) => {
      const qr = prev.quarterRejectedIds || []
      if (qr.includes(template.id)) return prev
      return {
        ...prev,
        rejectedCount: prev.rejectedCount + 1,
        rejectedIds: [...(prev.rejectedIds || []), template.id],
        quarterRejectedIds: [...qr, template.id],
      }
    })
  }, [])

  const handleHire = useCallback((deptId, type) => {
    const key = type === 'specialist' ? 'specialists' : 'consultants'
    const cost = type === 'specialist' ? GAME_CONFIG.specialistCostPerQuarter : GAME_CONFIG.consultantCostPerQuarter
    pushFloat('+1 employee', 'positive')
    pushFloat('+' + cost.toLocaleString() + ' Ħ fixed/qtr', 'negative')
    setGs((prev) => {
      const next = patchDeptStaffing(prev, deptId, key, 1)
      return { ...next, quarterBriefIds: buildQuarterBriefs(next, next.quarterBriefIds || []) }
    })
    setQuarterProgress((p) => ({ ...p, staff: true }))
  }, [pushFloat, showToast])

  const handleFire = useCallback((deptId, type) => {
    setGs((prev) => {
      const dept = prev.departments.find((d) => d.id === deptId)
      if (!dept) return prev
      const key = type === 'specialist' ? 'specialists' : 'consultants'
      if ((dept[key] || 0) <= 0) {
        showToast('No ' + type + 's to fire in this department.')
        return prev
      }
      pushFloat('-1 employee', 'negative')
      pushFloat('-1 reputation', 'negative')
      const next = patchDeptStaffing(prev, deptId, key, -1)
      return { ...next, reputation: Math.max(0, prev.reputation - 1) }
    })
  }, [pushFloat, showToast])

  const handleTransfer = useCallback((sourceId, type, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) {
      showToast('Pick a destination department.')
      return
    }
    const key = type === 'specialist' ? 'specialists' : 'consultants'
    setGs((prev) => {
      const source = prev.departments.find((d) => d.id === sourceId)
      if (!source || (source[key] || 0) <= 0) {
        showToast('No ' + type + 's to transfer.')
        return prev
      }
      pushFloat('Transferred ' + type, 'neutral')
      return transferStaff(prev, sourceId, targetId, key)
    })
    showToast('Employee transferred from ' + sourceId + ' to ' + targetId + '.')
  }, [pushFloat, showToast])

  const handleContinueYear = useCallback(() => {
    setGameScreen('home')
    showToast('Welcome to Year ' + gs.currentYear + '. Check the Forecast for this year.')
  }, [showToast, gs.currentYear])

  const handleRestart = useCallback(() => {
    try { localStorage.removeItem(DEMO_SAVE_KEY) } catch {}
    setGs(buildInitialGs({ player: gameSetupResult?.player, isNewPlayer: true }))
    setLossReason(null)
    setGameScreen('home')
    setSelectedDept(null)
    setSelectedProject(null)
    setSelectedActiveProject(null)
    setCompletedYear(null)
    showToast('Demo restarted. Good luck!')
  }, [gameSetupResult, showToast])

  const handleEventResolve = useCallback((option) => {
    setGs((prev) => {
      const eff = option.effect || {}
      const next = { ...prev }
      if (eff.cash) {
        const sign = eff.cash > 0 ? '+' : '-'
        pushFloat(sign + '' + Math.abs(eff.cash).toLocaleString() + ' Ħ cash', eff.cash > 0 ? 'positive' : 'negative')
        next.cash = prev.cash + eff.cash
      }
      if (eff.reputation) {
        const sign = eff.reputation > 0 ? '+' : ''
        pushFloat(sign + eff.reputation + ' rep', eff.reputation > 0 ? 'positive' : 'negative')
        next.reputation = Math.max(GAME_CONFIG.loseReputationFloor, Math.min(GAME_CONFIG.maxReputation, prev.reputation + eff.reputation))
      }
      if (eff.fixedExpenses) {
        const sign = eff.fixedExpenses > 0 ? '+' : '-'
        pushFloat(sign + '' + Math.abs(eff.fixedExpenses).toLocaleString() + ' Ħ/qtr', eff.fixedExpenses > 0 ? 'negative' : 'positive')
        next.recurringExpenses = Math.max(0, (prev.recurringExpenses || 0) + eff.fixedExpenses)
      }
      if (eff.staff && eff.staff.delta) {
        const { departments, msg } = applyStaffEffect(prev.departments, eff.staff)
        next.departments = departments
        if (msg) pushFloat(msg, eff.staff.delta > 0 ? 'positive' : 'negative')
      }
      return next
    })
    showToast(option.toast || 'Event resolved.')
    setEventQueue((q) => q.slice(1))
  }, [pushFloat, showToast])

  // Bottom tabs visible everywhere inside the game except the year summary and final report
  const showNav = !HIDE_NAV_ON.has(gameScreen)
  const activeTab = tabForScreen(gameScreen)
  const quarterKey = gs.currentYear + '-' + gs.yearQuarter

  return (
    <div className="game-shell">
      <div className="game-topbar">
        <div className="game-topbar__logo">
          <HNILogo height={28} />
        </div>
        <div className="game-topbar__badge">
          Q{gs.yearQuarter} - Year {gs.currentYear}
        </div>
        <SessionTimer
          startedAt={gs.sessionStartedAt}
          totalSeconds={GAME_CONFIG.sessionMinutes * 60}
          onExpire={handleTimeUp}
          onWarn={handleTimeWarn}
          warnAtSeconds={120}
          stopped={gameScreen === 'final-report'}
        />
        <div className="game-topbar__player">
          {gs.playerName} - {gs.cash.toLocaleString()} Ħ - Rep {gs.reputation}
        </div>
        <button className="game-topbar__glossary" onClick={() => setShowLeaderboard(true)} title="Open Leaderboard">
          Leaderboard
        </button>
        <button className="game-topbar__glossary" onClick={() => setShowGlossary(true)} title="Open Terms / Glossary">
          Terms
        </button>
      </div>

      {showTimeWarning && gameScreen !== 'final-report' && (
        <div className="time-warning" role="alert">
          <span className="time-warning__icon" aria-hidden="true">!</span>
          <span className="time-warning__text">
            <strong>About 2 minutes left.</strong> Wrap up your current quarter and press End Quarter - the game closes automatically when the timer hits zero.
          </span>
          <button className="time-warning__close" onClick={() => setShowTimeWarning(false)} aria-label="Dismiss warning">Dismiss</button>
        </div>
      )}

      <div className="game-content">
        {gameScreen === 'home' && (
          <HomeScreen
            gs={gs}
            onNavigate={navigate}
            onHire={handleHire}
            onShowToast={showToast}
            onRequestEndQuarter={requestEndQuarter}
            quarterProgress={quarterProgress}
          />
        )}

        {gameScreen === 'forecast' && (
          <ForecastScreen gs={gs} onUpdateGs={updateGs} onShowToast={showToast} onPushFloat={pushFloat} />
        )}

        {gameScreen === 'finance' && (
          <FinanceScreen gs={gs} onRequestEndQuarter={requestEndQuarter} onShowToast={showToast} />
        )}

        {gameScreen === 'dept-detail' && selectedDept && (
          <DepartmentDetailScreen
            dept={selectedDept}
            gs={gs}
            onHire={handleHire}
            onFire={handleFire}
            onTransfer={handleTransfer}
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

        {gameScreen === 'active-projects' && (
          <ActiveProjectsScreen
            gs={gs}
            onGoBack={goHome}
            onOpenActive={(p) => navigate('active-project-detail', { activeProject: p })}
          />
        )}

        {gameScreen === 'active-project-detail' && selectedActiveProject && (
          <ProjectDetailScreen
            project={selectedActiveProject}
            gs={gs}
            isAlreadyActive
            onGoToSalesRequests={() => setGameScreen('sales-requests')}
            onAccept={() => {}}
            onReject={() => {}}
            onShowToast={showToast}
          />
        )}

        {gameScreen === 'year-summary' && (
          <YearSummaryScreen gs={gs} completedYear={completedYear} onContinue={handleContinueYear} />
        )}

        {gameScreen === 'final-report' && (
          <FinalReportScreen gs={gs} onRestart={handleRestart} lossReason={lossReason} />
        )}
      </div>

      {showNav && (
        <GameNav
          activeScreen={activeTab}
          onNavigate={(tab) => setGameScreen(TAB_TO_SCREEN[tab] || tab)}
        />
      )}

      <GlossaryModal open={showGlossary} onClose={() => setShowGlossary(false)} />

      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentPlayer={{
          name: gs.playerName,
          revenue: gs.totalRevenue,
          netProfit: gs.netProfit,
          reputation: gs.reputation,
        }}
      />

      {eventQueue.length > 0 && (
        <EventModal event={eventQueue[0]} onResolve={handleEventResolve} />
      )}

      {endPreviewOpen && (
        <EndQuarterModal
          mode="preview"
          gs={gs}
          onConfirm={confirmEndQuarter}
          onCancel={() => setEndPreviewOpen(false)}
        />
      )}

      {quarterSummary && eventQueue.length === 0 && (
        <EndQuarterModal
          mode="summary"
          gs={gs}
          summary={quarterSummary}
          onClose={() => setQuarterSummary(null)}
        />
      )}

      <StatFloater floats={floats} />

      {toast && <div className="game-toast">{toast}</div>}
    </div>
  )
}
