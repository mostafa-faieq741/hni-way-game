/**
 * projectLifecycle.js
 * Pure functions that compute project status transitions during quarter resolution.
 * Keep separate from React components so the logic can be tested and reused.
 *
 * ── CAPACITY MODEL (visible to the player) ────────────────────────────────────
 * Every project states up-front which TEAMS it needs to be executed.
 *   - Sales BRINGS the work: 1 Specialist surfaces 2 requests/quarter,
 *     1 Consultant surfaces 4 (handled in projects.js / SalesRequestList).
 *   - Other teams EXECUTE the work. Each Specialist can carry 2 projects at a
 *     time, each Consultant 4. So a team's delivery capacity (in "project units")
 *     is:  specialists * 2 + consultants * 4.
 *   - Accepting a project is NOT success. A project only progresses while every
 *     team it needs has spare capacity to carry it. When demand exceeds capacity,
 *     the extra projects are DELAYED (they wait, they are not lost) until you add
 *     capacity — but each delayed quarter still carries the overdue penalty.
 *   - Capacity is checked every quarter across the project's whole duration.
 */

import { GAME_CONFIG } from './gameConfig.js'
import { getExecutionTeams } from './projects.js'

/** Maximum simultaneously-active projects allowed. */
export const MAX_ACTIVE_PROJECTS = 8

/** Delivery capacity (in "project units") contributed by one staff member. */
export const CAPACITY_PER_SPECIALIST = 2
export const CAPACITY_PER_CONSULTANT = 4

/** Build a brand-new active project record from a project template. */
export function makeActiveProject(template, currentOverallQuarter) {
  return {
    // ── Identity ──
    id:               template.id,
    code:             template.code,
    title:            template.title,
    brief:            template.clientBrief,

    // ── Sizing / scoring ──
    durationQuarters: template.durationQuarters,
    revenue:          template.revenue,
    cost:             template.cost,
    reputationImpact: template.reputationImpact,
    minReputation:    template.minReputation,
    stars:            template.stars,
    costBreakdown:    template.costBreakdown,
    bonusCondition:   template.bonusCondition,
    failCondition:    template.failCondition,

    // ── Requirements (now SHOWN to the player) ──
    executionTeams:    getExecutionTeams(template),
    salesRequirement:  template.salesRequirement ?? { type: 'specialist', count: 1 },

    // ── Lifecycle ──
    status:           'active',
    acceptedQuarter:  currentOverallQuarter,
    plannedEndQuarter: currentOverallQuarter + template.durationQuarters - 1,
    quartersLeft:     template.durationQuarters,
    overdueQuarters:  0,
    extraCosts:       0,
    revenueCollected: false,
    deliveredAt:      null,
  }
}

/** Delivery capacity per team id: { ld: 4, elearning: 2, ... } */
export function computeTeamCapacity(departments) {
  const cap = {}
  for (const d of departments || []) {
    cap[d.id] = (d.specialists || 0) * CAPACITY_PER_SPECIALIST +
                (d.consultants || 0) * CAPACITY_PER_CONSULTANT
  }
  return cap
}

/**
 * Delivery gate. Sales only SURFACES briefs (it brings the work in) — it is NOT
 * a delivery requirement and does NOT consume execution capacity. Whether a
 * project can deliver depends only on reputation + execution-team capacity.
 */
export function meetsReputationGate(project, gs) {
  return gs.reputation >= (project.minReputation ?? 0)
}

/** Normalise a project's execution-team requirement to [{ id, count }]. */
function teamsOf(project) {
  if (Array.isArray(project.executionTeams)) {
    return project.executionTeams.map((t) =>
      typeof t === 'string' ? { id: t, count: 1 } : { id: t.id, count: t.count || 1 }
    )
  }
  return getExecutionTeams(project)
}

/**
 * Allocate the current quarter's team capacity across the active projects in
 * FIFO order (earliest accepted first). A project is "covered" only if every
 * team it needs still has enough free capacity AND the sales/reputation gate is
 * met. Returns which projects are covered plus the per-team load report.
 *
 * @returns {{ coveredIds:Set<string>, capacity:object, free:object, demand:object }}
 */
export function allocateActiveCapacity(gs, activeOverride) {
  const active = activeOverride ?? gs.activeProjects ?? []
  const capacity = computeTeamCapacity(gs.departments)
  const free = { ...capacity }
  const demand = {}
  const coveredIds = new Set()

  for (const proj of active) {
    const teams = teamsOf(proj)
    for (const { id, count } of teams) demand[id] = (demand[id] || 0) + count

    const gateOk = meetsReputationGate(proj, gs)
    const fits = gateOk && teams.every(({ id, count }) => (free[id] || 0) >= count)
    if (fits) {
      for (const { id, count } of teams) free[id] = (free[id] || 0) - count
      coveredIds.add(proj.id)
    }
  }
  return { coveredIds, capacity, free, demand }
}

/**
 * Per-team capacity report for UI: [{ id, capacity, allocated, free, demand, short }].
 * `short` is true when total demand for that team exceeds its capacity.
 */
export function teamCapacityReport(gs) {
  const { capacity, free, demand } = allocateActiveCapacity(gs)
  const ids = new Set([...Object.keys(capacity), ...Object.keys(demand)])
  return [...ids].map((id) => {
    const cap = capacity[id] || 0
    const fr = free[id] != null ? free[id] : cap
    return {
      id,
      capacity: cap,
      allocated: cap - Math.max(0, fr),
      free: Math.max(0, fr),
      demand: demand[id] || 0,
      short: (demand[id] || 0) > cap,
    }
  })
}

/**
 * Coverage view for a single project against the company's CURRENT free
 * capacity (excluding that project itself if it is already active). Used by the
 * brief screen to show, team-by-team, whether the player can execute it now.
 *
 * @returns {{ covered:boolean, gateOk:boolean, teams:Array, salesRequirement:object }}
 */
export function projectCoverage(project, gs) {
  const others = (gs.activeProjects || []).filter((p) => p.id !== project.id)
  const { free } = allocateActiveCapacity(gs, others)
  const capacity = computeTeamCapacity(gs.departments)
  const teams = teamsOf(project).map(({ id, count }) => {
    const cap = capacity[id] || 0
    const fr = free[id] != null ? Math.max(0, free[id]) : cap
    return { id, count, capacity: cap, free: fr, ok: fr >= count }
  })
  const gateOk = meetsReputationGate(project, gs)
  const covered = gateOk && teams.every((t) => t.ok)
  return { covered, gateOk, teams, salesRequirement: project.salesRequirement ?? { type: 'specialist', count: 1 } }
}

/**
 * Resolve all active projects for the quarter being submitted.
 * Returns { updatedProjects, completedThisQtr, revenueGained, reputationDelta, extraCostsAdded }
 *
 * Logic:
 * - Allocate team capacity FIFO. A "covered" project works this quarter; an
 *   uncovered one is DELAYED (frozen, not lost) and carries the overdue penalty.
 * - Covered projects decrement quartersLeft. At the planned end (0) they deliver
 *   (collect revenue + reputation), provided the reputation / sales gate holds;
 *   otherwise they go overdue.
 * - Delayed and overdue projects: +1 overdueQuarters, -1 reputation, +10% cost.
 */
export function resolveProjectsForQuarter(gs) {
  let revenueGained     = 0
  let reputationDelta   = 0
  let extraCostsAdded   = 0
  const updatedProjects = []
  const completedThisQtr = []

  const { coveredIds } = allocateActiveCapacity(gs)

  const applyPenalty = (next, asStatus) => {
    next.status          = asStatus
    next.overdueQuarters += 1
    const extra           = Math.round(next.cost * 0.10)
    next.extraCosts      += extra
    extraCostsAdded      += extra
    reputationDelta      -= 1
  }

  for (const proj of gs.activeProjects) {
    const next = { ...proj }
    const covered = coveredIds.has(proj.id)

    if (!covered) {
      // Not enough team capacity this quarter → delayed, no progress, penalty.
      applyPenalty(next, 'delayed')
      updatedProjects.push(next)
      continue
    }

    // Covered: the teams can carry it this quarter, so it progresses.
    next.quartersLeft = Math.max(0, next.quartersLeft - 1)
    const reachedPlannedEnd = next.quartersLeft === 0
    const wasOverdue        = proj.status === 'overdue' || proj.status === 'delayed'

    if (reachedPlannedEnd || wasOverdue) {
      if (meetsReputationGate(next, gs)) {
        next.status           = 'delivered'
        next.deliveredAt      = gs.overallQuarter
        next.revenueCollected = true
        next.onTime           = next.overdueQuarters === 0
        revenueGained        += next.revenue
        reputationDelta      += (next.onTime ? next.reputationImpact : Math.max(0, next.reputationImpact - 1))
        completedThisQtr.push(next)
        continue
      }
      // Capacity is fine but rep/sales gate failed at the deadline → overdue.
      applyPenalty(next, 'overdue')
    } else {
      next.status = 'active'
    }

    updatedProjects.push(next)
  }

  return {
    updatedProjects,
    completedThisQtr,
    revenueGained,
    reputationDelta,
    extraCostsAdded,
  }
}

/** Backwards-compatible wrapper: requirements met == covered + gate this quarter. */
export function meetsRequirements(project, gs) {
  const { coveredIds } = allocateActiveCapacity(gs)
  return coveredIds.has(project.id)
}

/** Compute fixed expenses from departments. */
export function computeFixedExpenses(departments) {
  return departments.reduce(
    (sum, d) =>
      sum +
      d.specialists * GAME_CONFIG.specialistCostPerQuarter +
      d.consultants * GAME_CONFIG.consultantCostPerQuarter,
    0
  )
}
