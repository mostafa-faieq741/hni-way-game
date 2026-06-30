/**
 * projects.js
 * Mock sales-request project archetypes plus a per-quarter generator.
 *
 * - MOCK_PROJECTS is the archetype pool (the "template" briefs).
 * - getProjectsForQuarter(q) returns archetypes that match a quarter
 *   (kept for backwards compatibility).
 * - getSalesRequestsForQuarter(q, capacity) returns up to `capacity` briefs
 *   for the quarter by cycling archetypes and varying revenue/cost slightly.
 *   IDs are stable within a quarter so accept / reject still work.
 *
 * Future: replace with data fetched from a Google Sheets "sales_requests" tab.
 */

export const MOCK_PROJECTS = [
  // ── 1-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-001',
    executionTeams:  ['ld'],
    code:            'PRJ-001',
    title:           'New Manager Induction Programme',
    stars:           1,
    level:           1,
    durationQuarters: 1,
    minReputation:   0,
    revenue:         18_000,
    cost:            9_000,
    reputationImpact: 5,
    clientBrief:     'A regional logistics firm needs a one-day induction programme for newly promoted managers. Content covers leadership basics, company culture, and performance expectations.',
    costBreakdown:   'Facilitation: $4,000 - Materials: $3,000 - Admin: $2,000',
    bonusCondition:  'Deliver on time for +3 extra reputation.',
    failCondition:   'Late delivery results in -5 reputation and 20% revenue penalty.',
    matchedDepartments:   ['sales', 'ld'],
    requiredDepartments:  ['sales'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id:              'PRJ-002',
    executionTeams:  ['ld'],
    code:            'PRJ-002',
    title:           'Customer Service Skills Workshop',
    stars:           1,
    level:           1,
    durationQuarters: 1,
    minReputation:   0,
    revenue:         22_000,
    cost:            11_000,
    reputationImpact: 5,
    clientBrief:     'A retail chain requests a half-day customer service skills workshop for 40 front-line staff. Focus on communication, complaint handling, and brand representation.',
    costBreakdown:   'Facilitation: $5,000 - Workbooks: $3,000 - Venue support: $3,000',
    bonusCondition:  'Client satisfaction score above 4.5/5 earns a $2,000 bonus.',
    failCondition:   'Low satisfaction (<3.5/5) results in -5 reputation.',
    matchedDepartments:   ['sales', 'ld', 'resources'],
    requiredDepartments:  ['sales'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6, 7, 8],
  },

  // ── 2-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-003',
    executionTeams:  ['ld', 'elearning'],
    code:            'PRJ-003',
    title:           'Digital Onboarding E-Learning Suite',
    stars:           2,
    level:           2,
    durationQuarters: 2,
    minReputation:   10,
    revenue:         48_000,
    cost:            21_600,
    reputationImpact: 10,
    clientBrief:     'A fintech company wants to replace their paper-based onboarding with a three-module e-learning suite. Modules cover compliance, tools training, and company values.',
    costBreakdown:   'Instructional design: $8,000 - E-Learning build: $10,000 - Studio assets: $3,600',
    bonusCondition:  'All three modules approved on first review earns +5 reputation.',
    failCondition:   'Missing any module by the deadline results in -10 reputation and 30% revenue penalty.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio'],
    requiredDepartments:  ['sales', 'elearning'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id:              'PRJ-004',
    executionTeams:  ['ld'],
    code:            'PRJ-004',
    title:           'Leadership Development Curriculum',
    stars:           2,
    level:           2,
    durationQuarters: 2,
    minReputation:   10,
    revenue:         52_000,
    cost:            23_400,
    reputationImpact: 10,
    clientBrief:     'A healthcare group commissions a three-part leadership development curriculum for senior nurses moving into management. Covers strategic thinking, people management, and change leadership.',
    costBreakdown:   'Curriculum design: $10,000 - Facilitation: $8,000 - Assessment tools: $5,400',
    bonusCondition:  'Participants rate the programme 4.7+ earns +8 reputation.',
    failCondition:   'Incomplete curriculum delivery results in -8 reputation.',
    matchedDepartments:   ['sales', 'ld', 'hr', 'proposal'],
    requiredDepartments:  ['sales', 'ld'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    id:              'PRJ-007',
    executionTeams:  ['gamification', 'resources'],
    code:            'PRJ-007',
    title:           'Team Building & Engagement Event',
    stars:           2,
    level:           2,
    durationQuarters: 1,
    minReputation:   5,
    revenue:         32_000,
    cost:            14_400,
    reputationImpact: 8,
    clientBrief:     'A client wants a team-building event for 100 employees. They need the event documented with a videographer and photographer, and they request a trainer to facilitate the day.',
    costBreakdown:   'Trainer: $5,000 - Media coverage: $4,400 - Materials: $5,000',
    bonusCondition:  'Excellent feedback earns +5 reputation.',
    failCondition:   'Logistics delays cost -3 reputation.',
    matchedDepartments:   ['sales', 'gamification', 'resources', 'studio', 'ld'],
    requiredDepartments:  ['sales', 'gamification', 'resources'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },

  // ── 3-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-005',
    executionTeams:  ['ld', 'elearning'],
    code:            'PRJ-005',
    title:           'National Sales Capability Programme',
    stars:           3,
    level:           3,
    durationQuarters: 3,
    minReputation:   50,
    revenue:         82_000,
    cost:            27_060,
    reputationImpact: 20,
    clientBrief:     'A multinational FMCG company needs a blended sales capability programme for 200 regional sales managers across five countries. Includes e-learning modules, virtual workshops, and field coaching guides.',
    costBreakdown:   'Programme design: $10,000 - E-Learning: $8,000 - Studio: $4,000 - Facilitation: $5,060',
    bonusCondition:  'On-time completion across all regions earns +15 reputation and a $5,000 bonus.',
    failCondition:   'Missing regional rollout by deadline incurs -15 reputation and 25% revenue penalty.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio', 'operations'],
    requiredDepartments:  ['sales', 'ld', 'elearning'],
    salesRequirement:     { type: 'consultant', count: 1 },
    quarterAvailable:     [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  {
    id:              'PRJ-008',
    executionTeams:  ['procurement', 'ld'],
    code:            'PRJ-008',
    title:           'Procurement-Heavy Public Tender',
    stars:           3,
    level:           3,
    durationQuarters: 3,
    minReputation:   50,
    revenue:         88_000,
    cost:            26_400,
    reputationImpact: 18,
    clientBrief:     'A government agency has issued a multi-vendor tender for a workforce capability programme with strict procurement and compliance requirements.',
    costBreakdown:   'Tender design: $10,000 - Compliance: $6,400 - Delivery: $10,000',
    bonusCondition:  'Full compliance + on-time delivery earns +12 reputation.',
    failCondition:   'Any compliance miss results in -10 reputation.',
    matchedDepartments:   ['sales', 'ld', 'procurement', 'finance', 'proposal'],
    requiredDepartments:  ['sales', 'procurement'],
    salesRequirement:     { type: 'consultant', count: 1 },
    quarterAvailable:     [5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  },

  // ── 4-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-006',
    executionTeams:  ['ld', 'elearning', 'gamification', 'operations'],
    code:            'PRJ-006',
    title:           'Enterprise Learning Transformation Programme',
    stars:           4,
    level:           4,
    durationQuarters: 4,
    minReputation:   100,
    revenue:         480_000,
    cost:            120_000,
    reputationImpact: 40,
    clientBrief:     'A global bank wants to transform its entire learning function across 12 countries. The scope includes strategy design, LMS implementation, content migration, capability frameworks, a gamified leadership academy, and a full measurement and evaluation system.',
    costBreakdown:   'Strategy: $30,000 - LMS: $25,000 - Content: $20,000 - Gamification: $15,000 - Ops: $20,000 - QA: $10,000',
    bonusCondition:  'Full delivery and board sign-off earns +30 reputation and $30,000 bonus.',
    failCondition:   'Any major milestone missed results in -25 reputation and contract termination.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio', 'gamification', 'operations', 'hr', 'rd'],
    requiredDepartments:  ['sales', 'ld', 'elearning', 'gamification', 'operations'],
    salesRequirement:     { type: 'consultant', count: 2 },
    quarterAvailable:     [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  },
]

/**
 * Get the archetype projects available for a given overall quarter.
 * Kept for backwards compatibility; usually you want
 * getSalesRequestsForQuarter() which always returns enough briefs.
 */
// ── Runtime project catalogue ────────────────────────────────────────────────
// Defaults to the bundled archetypes, but can be replaced at startup with the
// admin-managed catalogue fetched from the backend (see setProjects / data API).
let PROJECTS = MOCK_PROJECTS.slice()

/**
 * Normalise a project coming from the backend so the game always has the fields
 * it relies on. The admin/backend stores quarter availability as a RANGE
 * (availableFromQuarter / availableToQuarter); the game filters on the ARRAY
 * `quarterAvailable`. Older / seeded records may lack the array, so derive it
 * here. Also backfill the derived department + level fields.
 */
function normalizeProject(p) {
  if (!p || typeof p !== 'object') return p
  const out = { ...p }
  const hasArray = Array.isArray(out.quarterAvailable) && out.quarterAvailable.length > 0
  if (!hasArray) {
    const from = Number.isFinite(out.availableFromQuarter) ? out.availableFromQuarter : 1
    const to   = Number.isFinite(out.availableToQuarter)   ? out.availableToQuarter   : 20
    const qa = []
    for (let q = Math.max(1, from); q <= to; q++) qa.push(q)
    out.quarterAvailable = qa.length ? qa : [1]
  }
  const teams = Array.isArray(out.executionTeams)
    ? out.executionTeams.map((t) => (typeof t === 'string' ? t : t?.id)).filter(Boolean)
    : []
  if (!Array.isArray(out.requiredDepartments) || out.requiredDepartments.length === 0)
    out.requiredDepartments = ['sales', ...teams]
  if (!Array.isArray(out.matchedDepartments) || out.matchedDepartments.length === 0)
    out.matchedDepartments = out.requiredDepartments
  if (out.level == null) out.level = out.stars
  return out
}

/** Replace the active catalogue (used after fetching from the backend). */
export function setProjects(list) {
  if (Array.isArray(list) && list.length) PROJECTS = list.map(normalizeProject)
}

/** The currently active catalogue (admin-managed if loaded, else defaults). */
export function getAllProjects() {
  return PROJECTS
}

export function getProjectsForQuarter(overallQuarter) {
  return PROJECTS.filter((p) => Array.isArray(p.quarterAvailable) && p.quarterAvailable.includes(overallQuarter))
}

/**
 * Get a project archetype by id (matches "PRJ-NNN").
 */
export function getProjectById(projectId) {
  return PROJECTS.find((p) => p.id === projectId)
}

/**
 * Build the FIXED set of sales briefs offered for the current quarter.
 *
 * Size = sales capacity (1 Specialist surfaces 2 briefs, 1 Consultant 4). Sales
 * BRINGS the work, so the number of briefs always equals that capacity — even
 * when fewer distinct project types are unlocked this quarter, the same brief
 * types come back as DIFFERENT clients (own stable id, varied title/revenue).
 *
 * Returns an array of full brief OBJECTS. The set never refills when a brief is
 * accepted or rejected; it only grows when sales capacity increases mid-quarter
 * (pass the existing briefs to keep what is already offered unchanged).
 */
export function buildQuarterBriefs(gs, existing = []) {
  const sales = (gs.departments || []).find((d) => d.id === 'sales') || { specialists: 0, consultants: 0 }
  const capacity = sales.specialists * 2 + sales.consultants * 4
  const pool = getProjectsForQuarter(gs.overallQuarter)
  if (capacity <= 0 || pool.length === 0) return existing.slice(0, Math.max(0, capacity))

  // Keep already-offered briefs (so handled ones stay consistent), then fill the
  // remaining slots by cycling the available pool — repeats are new clients.
  const result = existing.slice(0, capacity)
  for (let slot = result.length; slot < capacity; slot++) {
    const base = pool[slot % pool.length]
    const id = 'Q' + gs.overallQuarter + '-' + base.id + '-' + slot
    const titles = TITLE_VARIANTS[base.id] || [base.title]
    const title = titles[(gs.overallQuarter + slot) % titles.length]
    const v = variance(gs.overallQuarter, slot, 0.08)
    result.push({
      ...base,
      id,
      code: id,
      title,
      revenue: Math.round(base.revenue * v),
      cost: Math.round(base.cost * v),
      _archetypeId: base.id,
    })
  }
  return result
}

// ── Per-quarter generator ────────────────────────────────────────────────────

// Light deterministic-ish title variants per archetype.
const TITLE_VARIANTS = {
  'PRJ-001': ['New Manager Induction Programme', 'Frontline Manager Bootcamp', 'Manager Foundations Workshop'],
  'PRJ-002': ['Customer Service Skills Workshop', 'Frontline Service Excellence Day', 'Branch Service Refresher'],
  'PRJ-003': ['Digital Onboarding E-Learning Suite', 'New Hire E-Learning Suite', 'Compliance E-Learning Refresh'],
  'PRJ-004': ['Leadership Development Curriculum', 'Mid-Level Leadership Track', 'Healthcare Leaders Curriculum'],
  'PRJ-005': ['National Sales Capability Programme', 'Regional Sales Enablement', 'Field Sales Capability Build'],
  'PRJ-006': ['Enterprise Learning Transformation', 'Global Learning Modernisation', 'Banking Learning Overhaul'],
  'PRJ-007': ['Team Building & Engagement Event', 'Department Offsite & Gamification Day', 'Annual Team Reset'],
  'PRJ-008': ['Procurement-Heavy Public Tender', 'Government Workforce Tender', 'Public-Sector Capability Bid'],
}

function variance(quarter, slot, range = 0.1) {
  // Deterministic +/- variance based on quarter+slot
  const seed = (quarter * 7919 + slot * 31) % 1000
  const norm = (seed / 1000) * 2 - 1  // -1..+1
  return 1 + norm * range
}

/**
 * Generate up to `capacity` sales requests for the given quarter.
 * Returns brief objects with stable per-quarter IDs:
 *   id = "Q3-PRJ-007-2"
 *
 * Variance is applied so each slot feels distinct.
 */
export function getSalesRequestsForQuarter(overallQuarter, capacity = 4) {
  if (capacity <= 0) return []
  const candidates = PROJECTS.filter((p) => Array.isArray(p.quarterAvailable) && p.quarterAvailable.includes(overallQuarter))
  if (candidates.length === 0) return []

  const out = []
  for (let i = 0; i < capacity; i++) {
    const base = candidates[(overallQuarter * 3 + i) % candidates.length]
    const v = variance(overallQuarter, i, 0.08)
    const id   = 'Q' + overallQuarter + '-' + base.id + '-' + i
    const code = 'Q' + overallQuarter + '-' + base.code + '-' + i
    const titles = TITLE_VARIANTS[base.id] || [base.title]
    const title = titles[(overallQuarter + i) % titles.length]
    out.push({
      ...base,
      id, code, title,
      revenue: Math.round(base.revenue * v),
      cost:    Math.round(base.cost * v),
      _archetypeId: base.id,
    })
  }
  return out
}

/** Render stars as a string e.g. "***." */
export function renderStars(stars, max = 4) {
  return '*'.repeat(stars) + '.'.repeat(max - stars)
}

/**
 * Return the execution teams a project needs to be delivered, normalised to
 * { id, count } objects. Each team consumes `count` units of that team's
 * delivery capacity (1 Specialist = 2 units, 1 Consultant = 4 units) for the
 * whole time the project is active. Sales is handled separately (it only
 * surfaces briefs), so it is NOT included here.
 */
export function getExecutionTeams(project) {
  return (project?.executionTeams || []).map((t) =>
    typeof t === 'string' ? { id: t, count: 1 } : { id: t.id, count: t.count || 1 }
  )
}
