/**
 * projectsValidate.js
 * Pure validation + normalisation for project templates. No storage here, so it
 * is shared by every storage adapter (local JSON now, Supabase in production).
 */

const TOTAL_QUARTERS = 20

// Execution teams the admin may pick (Sales is excluded — it surfaces work,
// it does not execute it).
export const VALID_TEAM_IDS = [
  'ld', 'elearning', 'gamification', 'studio', 'resources',
  'operations', 'finance', 'proposal', 'hr', 'procurement', 'rd',
]
const SALES_TYPES = ['specialist', 'consultant']

const isNum = (v) => typeof v === 'number' && Number.isFinite(v)
const isInt = (v) => isNum(v) && Number.isInteger(v)

/** Validate + normalise an admin-supplied project. Returns { value, errors }. */
export function validateProject(input = {}) {
  const errors = {}
  const v = {}

  v.title = String(input.title ?? '').trim()
  if (!v.title) errors.title = 'Title is required.'
  v.clientBrief = String(input.clientBrief ?? '').trim()
  if (!v.clientBrief) errors.clientBrief = 'Client brief is required.'

  v.stars = Number(input.stars)
  if (!isInt(v.stars) || v.stars < 1 || v.stars > 4) errors.stars = 'Stars must be an integer 1-4.'
  v.durationQuarters = Number(input.durationQuarters)
  if (!isInt(v.durationQuarters) || v.durationQuarters < 1 || v.durationQuarters > TOTAL_QUARTERS)
    errors.durationQuarters = `Duration must be 1-${TOTAL_QUARTERS} quarters.`
  v.minReputation = Number(input.minReputation ?? 0)
  if (!isInt(v.minReputation) || v.minReputation < 0) errors.minReputation = 'Min reputation must be >= 0.'
  v.revenue = Number(input.revenue)
  if (!isNum(v.revenue) || v.revenue <= 0) errors.revenue = 'Revenue must be greater than 0.'
  v.cost = Number(input.cost)
  if (!isNum(v.cost) || v.cost < 0) errors.cost = 'Cost must be >= 0.'
  if (!errors.revenue && !errors.cost && v.cost >= v.revenue)
    errors.cost = 'Cost should be less than revenue.'
  v.reputationImpact = Number(input.reputationImpact ?? 0)
  if (!isInt(v.reputationImpact) || v.reputationImpact < 0) errors.reputationImpact = 'Reputation impact must be >= 0.'

  const teams = Array.isArray(input.executionTeams) ? input.executionTeams : []
  const cleanTeams = [...new Set(teams.map((t) => (typeof t === 'string' ? t : t?.id)).filter(Boolean))]
  const badTeam = cleanTeams.find((t) => !VALID_TEAM_IDS.includes(t))
  if (badTeam) errors.executionTeams = `Unknown team "${badTeam}".`
  else if (cleanTeams.length === 0) errors.executionTeams = 'Pick at least one execution team.'
  v.executionTeams = cleanTeams

  const sr = input.salesRequirement || {}
  const srType = SALES_TYPES.includes(sr.type) ? sr.type : 'specialist'
  const srCount = Number(sr.count ?? 1)
  if (!isInt(srCount) || srCount < 1) errors.salesRequirement = 'Sales count must be >= 1.'
  v.salesRequirement = { type: srType, count: isInt(srCount) && srCount >= 1 ? srCount : 1 }

  v.availableFromQuarter = Number(input.availableFromQuarter ?? 1)
  v.availableToQuarter = Number(input.availableToQuarter ?? TOTAL_QUARTERS)
  if (!isInt(v.availableFromQuarter) || v.availableFromQuarter < 1 || v.availableFromQuarter > TOTAL_QUARTERS)
    errors.availableFromQuarter = `From-quarter must be 1-${TOTAL_QUARTERS}.`
  if (!isInt(v.availableToQuarter) || v.availableToQuarter < 1 || v.availableToQuarter > TOTAL_QUARTERS)
    errors.availableToQuarter = `To-quarter must be 1-${TOTAL_QUARTERS}.`
  if (!errors.availableFromQuarter && !errors.availableToQuarter && v.availableFromQuarter > v.availableToQuarter)
    errors.availableToQuarter = 'To-quarter must be >= from-quarter.'

  v.costBreakdown = String(input.costBreakdown ?? '').trim()
  v.bonusCondition = String(input.bonusCondition ?? '').trim()
  v.failCondition = String(input.failCondition ?? '').trim()
  v.published = input.published !== false

  return { value: v, errors }
}

/** Add the derived fields the game expects, computed from validated input. */
export function decorateProject(v, base = {}) {
  const qa = []
  for (let q = v.availableFromQuarter; q <= v.availableToQuarter; q++) qa.push(q)
  const requiredDepartments = ['sales', ...v.executionTeams]
  return {
    ...base, ...v,
    level: v.stars,
    quarterAvailable: qa,
    requiredDepartments,
    matchedDepartments: requiredDepartments,
  }
}

/** Next sequential PRJ-NNN id given the existing list. */
export function nextProjectId(list) {
  let max = 0
  for (const p of list) {
    const m = /^PRJ-(\d+)$/.exec(p.id || '')
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return 'PRJ-' + String(max + 1).padStart(3, '0')
}

export const HAS_ERRORS = (errors) => Object.keys(errors).length > 0
