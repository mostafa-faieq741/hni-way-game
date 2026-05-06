/**
 * projects.js
 * Mock sales-request project data for the prototype.
 * Each quarter a subset of these projects appears in the Sales Request List.
 * Future: fetched from Google Sheets "sales_requests" tab per quarter.
 */

/** @typedef {object} Project */

export const MOCK_PROJECTS = [
  // ── 1-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-001',
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
    costBreakdown:   'Facilitation: $4,000 · Materials: $3,000 · Admin: $2,000',
    bonusCondition:  'Deliver on time for +3 extra reputation.',
    failCondition:   'Late delivery results in -5 reputation and 20% revenue penalty.',
    matchedDepartments:   ['sales', 'ld'],
    requiredDepartments:  ['sales'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5],
  },
  {
    id:              'PRJ-002',
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
    costBreakdown:   'Facilitation: $5,000 · Workbooks: $3,000 · Venue support: $3,000',
    bonusCondition:  'Client satisfaction score above 4.5/5 earns a $2,000 bonus.',
    failCondition:   'Low satisfaction (<3.5/5) results in -5 reputation.',
    matchedDepartments:   ['sales', 'ld', 'resources'],
    requiredDepartments:  ['sales'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6],
  },

  // ── 2-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-003',
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
    costBreakdown:   'Instructional design: $8,000 · E-Learning build: $10,000 · Studio assets: $3,600',
    bonusCondition:  'All three modules approved on first review earns +5 reputation.',
    failCondition:   'Missing any module by the deadline results in -10 reputation and 30% revenue penalty.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio'],
    requiredDepartments:  ['sales', 'elearning'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id:              'PRJ-004',
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
    costBreakdown:   'Curriculum design: $10,000 · Facilitation: $8,000 · Assessment tools: $5,400',
    bonusCondition:  'Participants rate the programme 4.7+ earns +8 reputation.',
    failCondition:   'Incomplete curriculum delivery results in -8 reputation.',
    matchedDepartments:   ['sales', 'ld', 'hr', 'proposal'],
    requiredDepartments:  ['sales', 'ld'],
    salesRequirement:     { type: 'specialist', count: 1 },
    quarterAvailable:     [2, 3, 4, 5, 6, 7, 8],
  },

  // ── 3-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-005',
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
    costBreakdown:   'Programme design: $10,000 · E-Learning: $8,000 · Studio: $4,000 · Facilitation: $5,060',
    bonusCondition:  'On-time completion across all regions earns +15 reputation and a $5,000 bonus.',
    failCondition:   'Missing regional rollout by deadline incurs -15 reputation and 25% revenue penalty.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio', 'operations'],
    requiredDepartments:  ['sales', 'ld', 'elearning'],
    salesRequirement:     { type: 'consultant', count: 1 },
    quarterAvailable:     [4, 5, 6, 7, 8, 9],
  },

  // ── 4-STAR PROJECTS ──────────────────────────────────────────────────────
  {
    id:              'PRJ-006',
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
    costBreakdown:   'Strategy & design: $30,000 · LMS build: $25,000 · Content: $20,000 · Gamification: $15,000 · Operations: $20,000 · QA: $10,000',
    bonusCondition:  'Full delivery and board sign-off earns +30 reputation and $30,000 bonus.',
    failCondition:   'Any major milestone missed results in -25 reputation and contract termination.',
    matchedDepartments:   ['sales', 'ld', 'elearning', 'studio', 'gamification', 'operations', 'hr', 'rd'],
    requiredDepartments:  ['sales', 'ld', 'elearning', 'gamification', 'operations'],
    salesRequirement:     { type: 'consultant', count: 2 },
    quarterAvailable:     [8, 9, 10, 11, 12],
  },
]

/**
 * Get the projects available for a given overall quarter.
 * @param {number} overallQuarter  – 1–20
 * @returns {Array<Project>}
 */
export function getProjectsForQuarter(overallQuarter) {
  return MOCK_PROJECTS.filter((p) => p.quarterAvailable.includes(overallQuarter))
}

/**
 * Get a project by its ID.
 * @param {string} projectId
 * @returns {Project|undefined}
 */
export function getProjectById(projectId) {
  return MOCK_PROJECTS.find((p) => p.id === projectId)
}

/** Render stars as a string e.g. "★★☆☆" */
export function renderStars(stars, max = 4) {
  return '★'.repeat(stars) + '☆'.repeat(max - stars)
}
