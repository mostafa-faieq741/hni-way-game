/**
 * projectLifecycle.js
 * Pure functions that compute project status transitions during quarter resolution.
 * Keep separate from React components so the logic can be tested and reused.
 */

import { GAME_CONFIG } from './gameConfig.js'

/** Maximum simultaneously-active projects allowed. */
export const MAX_ACTIVE_PROJECTS = 8

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

    // ── Internal requirements (hidden from the player UI) ──
    hiddenRequiredDepartments: template.requiredDepartments ?? [],
    hiddenSalesRequirement:    template.salesRequirement ?? { type: 'specialist', count: 1 },

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

/**
 * Check if a project's hidden requirements are met by the current company state.
 * Used at the planned end of a project to decide deliver vs overdue.
 */
export function meetsRequirements(project, gs) {
  // 1) Reputation threshold
  if (gs.reputation < (project.minReputation ?? 0)) return false

  // 2) Sales staffing
  const sales = gs.departments.find((d) => d.id === 'sales') ?? { specialists: 0, consultants: 0 }
  const salesReq = project.hiddenSalesRequirement ?? { type: 'specialist', count: 1 }
  if (salesReq.type === 'specialist' && sales.specialists < salesReq.count) return false
  if (salesReq.type === 'consultant' && sales.consultants < salesReq.count) return false

  // 3) Required departments active
  for (const deptId of project.hiddenRequiredDepartments ?? []) {
    const d = gs.departments.find((x) => x.id === deptId)
    if (!d || (d.specialists + d.consultants) === 0) return false
  }
  return true
}

/**
 * Resolve all active projects for the quarter being submitted.
 * Returns { updatedProjects, completedThisQtr, revenueGained, reputationDelta, extraCostsAdded }
 *
 * Logic:
 * - For each active project, decrement quartersLeft.
 * - If quartersLeft reaches 0 (planned end) OR the project is already overdue,
 *   evaluate requirements:
 *     - met → deliver, collect revenue, +reputation impact
 *     - not met → mark overdue, +1 overdueQuarters, -1 reputation,
 *                 add 10% of cost as extra cost
 * - Delivered projects are removed from activeProjects and pushed to completedProjects.
 */
export function resolveProjectsForQuarter(gs) {
  let revenueGained     = 0
  let reputationDelta   = 0
  let extraCostsAdded   = 0
  const updatedProjects = []
  const completedThisQtr = []

  for (const proj of gs.activeProjects) {
    const next = { ...proj }

    if (next.status === 'active') {
      next.quartersLeft = Math.max(0, next.quartersLeft - 1)
    }

    const reachedPlannedEnd = next.quartersLeft === 0
    const isAlreadyOverdue  = next.status === 'overdue'

    if (reachedPlannedEnd || isAlreadyOverdue) {
      const ok = meetsRequirements(next, gs)

      if (ok) {
        next.status           = 'delivered'
        next.deliveredAt      = gs.overallQuarter
        next.revenueCollected = true
        next.onTime           = next.overdueQuarters === 0
        revenueGained        += next.revenue
        reputationDelta      += (next.onTime ? next.reputationImpact : Math.max(0, next.reputationImpact - 1))
        completedThisQtr.push(next)
        // do NOT push to updatedProjects — delivered projects leave active list
        continue
      } else {
        next.status           = 'overdue'
        next.overdueQuarters += 1
        const extra           = Math.round(next.cost * 0.10)
        next.extraCosts      += extra
        extraCostsAdded      += extra
        reputationDelta      -= 1
      }
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
