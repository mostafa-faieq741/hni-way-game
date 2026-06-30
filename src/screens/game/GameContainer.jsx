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
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import SpotlightTour from '../../components/SpotlightTour.jsx'
import AnimatedNumber from '../../components/AnimatedNumber.jsx'
import { play, isMuted, toggleMuted } from '../../services/sounds.js'

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
import { saveKeyFor }             from '../PlayerSetupScreen.jsx'
import { saveProgress as serverSave, getToken } from '../../services/authClient.js'
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

const TAB_LABEL = { home: 'Home', forecast: 'Forecast', finance: 'Finance' }
const TOUR_DONE_KEY = 'hni_tour_done'

// Guided spotlight tour. Each step targets a [data-tour="key"] element. `tab`
// switches the active game tab before the element is measured.
const TOUR_STEPS = [
  { key: 'quarter', tab: 'home', title: 'Welcome — this is Quarter 0',
    body: 'A free practice round. Try anything you like — hiring, buying the forecast, accepting projects. Nothing here counts. When you finish, the real game starts fresh at Quarter 1.' },
  { key: 'cash', tab: 'home', title: 'This is your Cash',
    body: 'You start every game with $100,000. You spend it on staff salaries, the yearly forecast, and accepting projects. Keep an eye on it.' },
  { key: 'rep', tab: 'home', title: 'This is your Reputation',
    body: 'Deliver projects on time to grow it. Firing staff or missing deadlines lowers it. Reach 100 reputation to qualify for the leaderboard.' },
  { key: 'xp', tab: 'home', title: 'Reputation goal bar',
    body: 'This XP bar fills as your reputation climbs toward the target of 100.' },
  { key: 'hp', tab: 'home', title: 'Cash health bar',
    body: 'Your HP bar tracks cash. If it runs dry for too long, the game ends — so spend wisely.' },
  { key: 'departments', tab: 'home', title: 'Your departments',
    body: 'These are your teams. Click any unit to manage it. Hire into HR first to unlock the other departments.',
    hint: 'Click a department card to open it (during practice).' },
  { key: 'hire', tab: 'home', title: 'Hire staff',
    body: 'Use + Hire to add specialists ($5,000/qtr) or consultants ($10,000/qtr) to any department. More staff unlocks bigger projects.',
    hint: 'Open the Hire panel to try it.' },
  { key: 'sales', tab: 'home', title: 'Sales Requests',
    body: 'Incoming project briefs land here. Click one to review the details, then accept the projects you want to deliver.',
    hint: 'Click a brief to review it.' },
  { key: 'active', tab: 'home', title: 'Active Projects',
    body: 'Projects you accepted live here. Track how many quarters are left before each one delivers its revenue.' },
  { key: 'forecast-buy', tab: 'forecast', title: 'The Forecast tab',
    body: 'We just switched you to the Forecast tab. Buy it once per year ($15,000) to reveal the market trend and a staffing hint before you commit.' },
  { key: 'finance-end', tab: 'finance', title: 'The Finance tab',
    body: 'Now we are on Finance — your quarter numbers and last-quarter resolution. You can also end the quarter from here.' },
  { key: 'endquarter', tab: 'home', title: 'End Quarter',
    body: 'When you are done, press End Quarter. During Quarter 0 this ends practice and starts the real game at Quarter 1 — everything resets.',
    hint: 'Press this when you have finished practising.' },
  { key: 'nav-home', tab: 'home', title: 'Move around',
    body: 'Use these tabs to switch between Home, Forecast and Finance any time. That is the whole game — go ahead and explore Quarter 0!' },
]

// Which top-level tab is "active" for a given sub-screen
function tabForScreen(screen) {
  if (screen === 'forecast') return 'forecast'
  if (screen === 'finance')  return 'finance'
  // home, sales-requests, project-detail, active-projects, active-project-detail, dept-detail
  return 'home'
}

function buildSnapshot(state) {
  return {
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
    quarterBriefs: state.quarterBriefs,
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
    playedSeconds: state.playedSeconds || 0,
    practiceMode: state.practiceMode,
  }
}

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(saveKeyFor(state.playerId), JSON.stringify(buildSnapshot(state)))
  } catch (e) {
    console.warn('[GameContainer] save failed:', e)
  }
}

function loadFromLocalStorage(playerId) {
  try {
    const raw = localStorage.getItem(saveKeyFor(playerId))
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
    quarterBriefs: [],
    completedProjects: [],
    forecastPurchasedByYear: {},
    eventsTriggered:        [],
    recurringExpenses:      0,
    eventBag:               [],
    yearSummaries:          [],
    lastResolution:         null,
    sessionStartedAt:       Date.now(),
    playedSeconds:          0,
    practiceMode:           true,
  }
  base.quarterBriefs = buildQuarterBriefs(base, [])
  if (!setupResult?.isNewPlayer) {
    const saved = setupResult?.serverState || loadFromLocalStorage(base.playerId)
    if (saved) {
      const merged = { ...base, ...saved }
      // Resume the play-time cap from where it was; start a fresh session clock.
      merged.playedSeconds = saved.playedSeconds || 0
      merged.sessionStartedAt = Date.now()
      // Migrate older saves (which stored brief IDs, not objects) and rebuild
      // the brief set against the SAVED departments/quarter so sales capacity
      // is reflected correctly.
      const validBriefs = Array.isArray(merged.quarterBriefs) &&
        merged.quarterBriefs.every((b) => b && typeof b === 'object')
      if (!validBriefs) merged.quarterBriefs = buildQuarterBriefs(merged, [])
      delete merged.quarterBriefIds
      merged.practiceMode = saved.practiceMode === true
      return merged
    }
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
  // Quarter 0 practice flow + guided spotlight tour.
  const [practiceEndOpen, setPracticeEndOpen] = useState(false)
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  const [muted, setMutedState] = useState(isMuted())
  const [theme, setTheme] = useState(() => {
    try { return document.documentElement.dataset.theme || 'dark' } catch { return 'dark' }
  })
  const [xpPulse, setXpPulse] = useState(false)

  const handleToggleMute = useCallback(() => {
    const m = toggleMuted()
    setMutedState(m)
    if (!m) play('click')
  }, [])

  const handleToggleTheme = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      try { localStorage.setItem('hni_theme', next) } catch {}
      return next
    })
    play('click')
  }, [])

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

  // XP bar pulse + sound when reputation changes
  const prevRep = useRef(gs.reputation)
  useEffect(() => {
    if (gs.reputation !== prevRep.current) {
      if (gs.reputation > prevRep.current) play('badge')
      prevRep.current = gs.reputation
      setXpPulse(true)
      const t = setTimeout(() => setXpPulse(false), 950)
      return () => clearTimeout(t)
    }
  }, [gs.reputation])

  // Incoming event chime
  useEffect(() => {
    if (eventQueue.length > 0) play('alert')
  }, [eventQueue.length > 0 ? eventQueue[0] : null])
  useEffect(() => { saveToLocalStorage(gs) }, [gs])

// (hide/close persistence handled by the SessionTimer onFlush beacon below)

  // Persist to the server (cross-device resume + leaderboard) for signed-in,
  // non-practice players. Debounced so we don't spam the API on every change.
  const serverSaveTimer = useRef(null)
  useEffect(() => {
    if (gameSetupResult?.demoMode || gs.practiceMode || !gs.playerId || gs.playerId === 'demo-001') return
    clearTimeout(serverSaveTimer.current)
    serverSaveTimer.current = setTimeout(() => {
      serverSave(gs.playerId, {
        ...buildSnapshot(gs),
        gameStatus: gameScreen === 'final-report' ? 'finished' : 'in_progress',
      })
    }, 1500)
    return () => clearTimeout(serverSaveTimer.current)
  }, [gs, gameScreen, gameSetupResult])

  // Immediate-loss thresholds: bankruptcy or reputation collapse ends the game.
  useEffect(() => {
    if (lossReason || gameScreen === 'final-report' || gs.practiceMode) return
    let reason = null
    if (gs.cash < GAME_CONFIG.loseCashFloor) reason = 'cash'
    else if (gs.reputation <= GAME_CONFIG.loseReputationFloor) reason = 'reputation'
    if (reason) {
      play('lose')
      setLossReason(reason)
      setEndPreviewOpen(false)
      setQuarterSummary(null)
      setEventQueue([])
      setGameScreen('final-report')
    }
  }, [gs.cash, gs.reputation, gameScreen, lossReason, gs.practiceMode])

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

      if (fixedExpenses > 0)     pushFloat('-' + '$' + fixedExpenses.toLocaleString() + ' fixed', 'negative')
      if (recurring > 0)         pushFloat('-' + '$' + recurring.toLocaleString() + ' recurring', 'negative')
      if (r.revenueGained > 0)   pushFloat('+' + '$' + r.revenueGained.toLocaleString() + ' revenue', 'positive')
      if (r.extraCostsAdded > 0) pushFloat('-' + '$' + r.extraCostsAdded.toLocaleString() + ' overdue', 'negative')
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
      newState.quarterBriefs = gameOver ? prev.quarterBriefs : buildQuarterBriefs(newState, [])
      return newState
    })

    setGs((prev) => {
      setEndPreviewOpen(false)
      setQuarterProgress({ forecast: false, accept: false, staff: false })
      let nextBag = prev.eventBag
      if (prev.overallQuarter >= GAME_CONFIG.totalQuarters && prev.lastResolution) {
        play('fanfare')
        setGameScreen('final-report')
      } else if (prev.yearQuarter === 1 && prev.currentYear > 1) {
        play('levelUp')
        setCompletedYear(prev.currentYear - 1)
        setGameScreen('year-summary')
        const drawn = drawEvents(prev.eventBag, 2)
        nextBag = drawn.nextBag
        setEventQueue(drawn.events)
      } else {
        setGameScreen('home')
        // Replace the old fading toast with an explicit "what changed" summary moment.
        play((prev.lastResolution?.revenueGained || 0) > 0 ? 'coin' : 'click')
        setQuarterSummary(prev.lastResolution)
        const drawn = drawEvents(prev.eventBag, 2)
        nextBag = drawn.nextBag
        setEventQueue(drawn.events)
      }
      return { ...prev, eventBag: nextBag }
    })
  }, [showToast, pushFloat])

  // Open the end-of-quarter preview (the explicit, deliberate commit point).
  const requestEndQuarter = useCallback(() => {
    play('click')
    if (gs.practiceMode) { setPracticeEndOpen(true); return }
    setEndPreviewOpen(true)
  }, [gs.practiceMode])
  const confirmEndQuarter = useCallback(() => {
    play('commit')
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

  // The session timer reports accumulated play time here; keep it in game state
  // so every save persists it (and the cap resumes accurately next time).
  const handleTimerPersist = useCallback((used) => {
    setGs((prev) => (prev.playedSeconds === used ? prev : { ...prev, playedSeconds: used }))
  }, [])

  // Keep a live ref to game state for the synchronous unload save.
  const gsRef = useRef(gs)
  useEffect(() => { gsRef.current = gs }, [gs])

  // Unload-safe flush: write localStorage synchronously and send a beacon to the
  // server (survives the browser X / tab close, unlike fetch).
  const handleTimerFlush = useCallback((used) => {
    const prev = gsRef.current
    const snap = { ...buildSnapshot(prev), playedSeconds: used }
    try { localStorage.setItem(saveKeyFor(prev.playerId), JSON.stringify(snap)) } catch {}
    if (!gameSetupResult?.demoMode && prev.playerId && prev.playerId !== 'demo-001' && !prev.practiceMode) {
      try {
        const body = JSON.stringify({ playerId: prev.playerId, token: getToken(), snapshot: { ...snap, gameStatus: 'in_progress' } })
        navigator.sendBeacon('/api/progress', new Blob([body], { type: 'application/json' }))
      } catch {}
    }
    setGs((p) => (p.playedSeconds === used ? p : { ...p, playedSeconds: used }))
  }, [gameSetupResult])

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
        play('error')
        showToast('Need ' + '$' + template.cost.toLocaleString() + ' cash to accept this project.')
        return prev
      }
      play('spend')
      const active = makeActiveProject(template, prev.overallQuarter)
      pushFloat('-' + '$' + template.cost.toLocaleString() + ' cash', 'negative')
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
    play('hire')
    pushFloat('+1 employee', 'positive')
    pushFloat('+' + '$' + cost.toLocaleString() + ' fixed/qtr', 'negative')
    setGs((prev) => {
      const next = patchDeptStaffing(prev, deptId, key, 1)
      return { ...next, quarterBriefs: buildQuarterBriefs(next, next.quarterBriefs || []) }
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
      play('error')
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

  // End Quarter 0: wipe practice progress and begin the real game at Q1.
  const startRealGame = useCallback(() => {
    try { localStorage.removeItem(saveKeyFor(gs.playerId)) } catch {}
    const fresh = buildInitialGs({ player: { player_id: gs.playerId, display_name: gs.playerName }, isNewPlayer: true })
    fresh.practiceMode = false
    fresh.sessionStartedAt = Date.now()
    setGs(fresh)
    setPracticeEndOpen(false)
    setEndPreviewOpen(false)
    setQuarterSummary(null)
    setEventQueue([])
    setLossReason(null)
    setSelectedDept(null)
    setSelectedProject(null)
    setSelectedActiveProject(null)
    setQuarterProgress({ forecast: false, accept: false, staff: false })
    setGameScreen('home')
    play('fanfare')
    showToast('The real game begins — Year 1, Quarter 1. Good luck!')
  }, [gs.playerId, gs.playerName, showToast])

  // ── Guided tour control ──────────────────────────────────────────
  const startTour = useCallback(() => { setTourStep(0); setGameScreen('home'); setTourActive(true) }, [])
  const endTour = useCallback(() => {
    setTourActive(false)
    setGameScreen('home')
    try { localStorage.setItem(TOUR_DONE_KEY, '1') } catch {}
  }, [])

  // A brand-new player always gets the guided tour, even if a previous player
  // on this browser already finished it. Clear the persisted flag on mount so
  // the auto-start effect below can fire.
  useEffect(() => {
    if (gameSetupResult?.isNewPlayer) {
      try { localStorage.removeItem(TOUR_DONE_KEY) } catch {}
    }
  }, [])

  // Auto-start the tour once, the first time a player lands in practice mode.
  useEffect(() => {
    if (!gs.practiceMode) return
    let done = false
    try { done = localStorage.getItem(TOUR_DONE_KEY) === '1' } catch {}
    if (!done) { const t = setTimeout(() => startTour(), 350); return () => clearTimeout(t) }
  }, [gs.practiceMode, startTour])

  // While the tour runs, follow each step's tab so its target element exists.
  useEffect(() => {
    if (!tourActive) return
    const step = TOUR_STEPS[tourStep]
    if (step && step.tab && TAB_TO_SCREEN[step.tab] && gameScreen !== step.tab) {
      setGameScreen(step.tab)
    }
  }, [tourActive, tourStep, gameScreen])

  const handleRestart = useCallback(() => {
    try { localStorage.removeItem(saveKeyFor(gs.playerId)) } catch {}
    setGs(buildInitialGs({ player: gameSetupResult?.player, isNewPlayer: true }))
    setLossReason(null)
    setGameScreen('home')
    setSelectedDept(null)
    setSelectedProject(null)
    setSelectedActiveProject(null)
    setCompletedYear(null)
    showToast('Game restarted. Good luck!')
  }, [gameSetupResult, showToast])

  const handleEventResolve = useCallback((option) => {
    setGs((prev) => {
      const eff = option.effect || {}
      const next = { ...prev }
      if (eff.cash) {
        const sign = eff.cash > 0 ? '+' : '-'
        pushFloat(sign + '' + '$' + Math.abs(eff.cash).toLocaleString() + ' cash', eff.cash > 0 ? 'positive' : 'negative')
        next.cash = prev.cash + eff.cash
      }
      if (eff.reputation) {
        const sign = eff.reputation > 0 ? '+' : ''
        pushFloat(sign + eff.reputation + ' rep', eff.reputation > 0 ? 'positive' : 'negative')
        next.reputation = Math.max(GAME_CONFIG.loseReputationFloor, Math.min(GAME_CONFIG.maxReputation, prev.reputation + eff.reputation))
      }
      if (eff.fixedExpenses) {
        const sign = eff.fixedExpenses > 0 ? '+' : '-'
        pushFloat(sign + '' + '$' + Math.abs(eff.fixedExpenses).toLocaleString() + '/qtr', eff.fixedExpenses > 0 ? 'negative' : 'positive')
        next.recurringExpenses = Math.max(0, (prev.recurringExpenses || 0) + eff.fixedExpenses)
      }
      if (eff.staff && eff.staff.delta) {
        const { departments, msg } = applyStaffEffect(prev.departments, eff.staff)
        next.departments = departments
        if (msg) pushFloat(msg, eff.staff.delta > 0 ? 'positive' : 'negative')
      }
      return next
    })
    play('click')
    showToast(option.toast || 'Event resolved.')
    setEventQueue((q) => q.slice(1))
  }, [pushFloat, showToast])

  // Bottom tabs visible everywhere inside the game except the year summary and final report
  const showNav = !HIDE_NAV_ON.has(gameScreen)
  const activeTab = tabForScreen(gameScreen)
  const quarterKey = gs.currentYear + '-' + gs.yearQuarter

  // Derived HUD health signals (presentation only — no game-core change).
  const hudBurn = computeFixedExpenses(gs.departments) + (gs.recurringExpenses || 0)
  const hudRunway = hudBurn > 0 ? gs.cash / hudBurn : Infinity
  const hudLastFlow = gs.lastResolution
    ? (gs.lastResolution.revenueGained || 0)
      - (gs.lastResolution.fixedExpenses || 0)
      - (gs.lastResolution.recurringExpenses || 0)
      - (gs.lastResolution.extraCostsAdded || 0)
    : null
  const hudHpTone =
    (gs.cash < GAME_CONFIG.startingCash * 0.25 || hudRunway < 3) ? 'hp-low'
    : (hudLastFlow != null && hudLastFlow < 0) ? 'hp-warn'
    : ''

  return (
    <div className="game-shell">
      <div className="game-topbar">
        <div className="game-topbar__logo">
          <HNILogo height={52} />
        </div>
        <div className={"game-topbar__badge" + (gs.practiceMode ? " game-topbar__badge--practice" : "")} data-tour="quarter">
          {gs.practiceMode ? "Q0 · Practice" : "Q" + gs.yearQuarter + " · Y" + gs.currentYear}
        </div>
        <span data-tour="timer" style={{ display: "inline-flex" }}>
        <SessionTimer
          playedSeconds={gs.playedSeconds || 0}
          totalSeconds={GAME_CONFIG.sessionMinutes * 60}
          onExpire={handleTimeUp}
          onWarn={handleTimeWarn}
          onPersist={handleTimerPersist}
          onFlush={handleTimerFlush}
          warnAtSeconds={120}
          stopped={gameScreen === 'final-report'}
        />
        </span>
        <div className="hud-stats">
          <div className="hud-stat" data-tour="cash">
            <span className="hud-stat__label">Cash</span>
            <span className="hud-stat__value hud-stat__value--cash">
              $<AnimatedNumber value={gs.cash} />
            </span>
          </div>
          <div className="hud-stat" data-tour="rep">
            <span className="hud-stat__label">Rep</span>
            <span className="hud-stat__value hud-stat__value--rep">
              <AnimatedNumber value={gs.reputation} />
            </span>
          </div>
          <div className="hud-avatar" title={gs.playerName}>
            {(gs.playerName || 'P').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          {gs.practiceMode && (
            <button className="hud-iconbtn hud-iconbtn--tour" onClick={() => { play('nav'); startTour() }} title="Replay tutorial" aria-label="Replay tutorial">
              <span aria-hidden="true">?</span>
            </button>
          )}
          <button className="hud-iconbtn" onClick={() => { play('nav'); setShowLeaderboard(true) }} title="Leaderboard" aria-label="Leaderboard">
            <span aria-hidden="true">🏆</span>
          </button>
          <button className="hud-iconbtn" onClick={() => { play('nav'); setShowGlossary(true) }} title="Terms / Glossary" aria-label="Terms and glossary">
            <span aria-hidden="true">📖</span>
          </button>
          <button className={'hud-iconbtn' + (muted ? '' : ' hud-iconbtn--active')} onClick={handleToggleMute} title={muted ? 'Unmute sounds' : 'Mute sounds'} aria-label="Toggle sound">
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          </button>
          <button className="hud-iconbtn" onClick={handleToggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle light/dark mode">
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>

      <div className="hud-xp" style={{ borderBottom: 'none', paddingBottom: 2 }} data-tour="xp">
        <span className="hud-xp__label" style={{ minWidth: 110, textAlign: 'right' }}>XP · Reputation</span>
        <div className="hud-xp__track">
          <div
            className={
              'hud-xp__fill' +
              (gs.reputation >= GAME_CONFIG.winReputationThreshold ? ' hud-xp__fill--max' : '') +
              (xpPulse ? ' hud-xp__fill--pulse' : '')
            }
            style={{ width: Math.max(2, Math.min(100, (gs.reputation / GAME_CONFIG.winReputationThreshold) * 100)) + '%' }}
          />
        </div>
        <span className="hud-xp__value" style={{ minWidth: 150 }}>
          {gs.reputation >= GAME_CONFIG.winReputationThreshold
            ? 'Leaderboard qualified ★'
            : gs.reputation + ' / ' + GAME_CONFIG.winReputationThreshold}
        </span>
      </div>

      <div className="hud-xp" style={{ paddingTop: 2 }} data-tour="hp">
        <span className="hud-xp__label" style={{ minWidth: 110, textAlign: 'right' }}>HP · Cash</span>
        <div className="hud-xp__track">
          <div
            className={
              'hud-xp__fill hud-xp__fill--hp' +
              (hudHpTone ? ' hud-xp__fill--' + hudHpTone : '')
            }
            style={{ width: Math.max(2, Math.min(100, (gs.cash / GAME_CONFIG.startingCash) * 100)) + '%' }}
          />
        </div>
        <span className="hud-xp__value" style={{ minWidth: 150 }}>
          ${gs.cash.toLocaleString()}
        </span>
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
          onNavigate={(tab) => { play('nav'); setGameScreen(TAB_TO_SCREEN[tab] || tab) }}
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

      <ConfirmDialog
        open={practiceEndOpen}
        title="Finish Quarter 0?"
        body="You're about to end the practice round. Everything you did here (cash, hires, projects, reputation) resets, and the real game begins at Year 1, Quarter 1."
        confirmLabel="Start the real game"
        cancelLabel="Keep practising"
        onConfirm={startRealGame}
        onCancel={() => setPracticeEndOpen(false)}
      />

      {tourActive && (
        <SpotlightTour
          steps={TOUR_STEPS}
          stepIndex={tourStep}
          tabLabel={TAB_LABEL[TOUR_STEPS[tourStep]?.tab]}
          onNext={() => setTourStep((i) => Math.min(i + 1, TOUR_STEPS.length - 1))}
          onBack={() => setTourStep((i) => Math.max(i - 1, 0))}
          onSkip={endTour}
          onFinish={endTour}
        />
      )}

      <StatFloater floats={floats} />

      {toast && <div className="game-toast">{toast}</div>}
    </div>
  )
}
