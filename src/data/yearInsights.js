/**
 * yearInsights.js
 * Adaptive year-end coaching engine.
 *
 * Mirrors the 12 "What-if insight & recommendation" scenarios from the
 * HNI Way design deck (slides 58-69). Instead of two static branches,
 * diagnoseYear(gs) inspects the live game state and returns the single
 * most relevant diagnostic for the year the player just finished:
 *
 *   { title, insight, recommendations: string[], tone }
 *
 * tone: 'positive' | 'caution' | 'critical'  (used only for styling)
 *
 * Rules are evaluated in priority order (most damaging problems first).
 * The first matching rule wins, so a player only ever sees the issue that
 * matters most this year. A positive/balanced message is the fallback.
 */

import { computeFixedExpenses } from './projectLifecycle.js'

function readSignals(gs) {
  const depts = gs.departments || []
  const staffOf = (id) => {
    const d = depts.find((x) => x.id === id)
    return d ? (d.specialists || 0) + (d.consultants || 0) : 0
  }
  const isActive = (id) => staffOf(id) > 0

  const totalStaff = depts.reduce(
    (s, d) => s + (d.specialists || 0) + (d.consultants || 0), 0
  )
  const activeDeptCount = depts.filter(
    (d) => (d.specialists || 0) + (d.consultants || 0) > 0
  ).length

  const completed = gs.completedProjects || []
  const lateCount = completed.filter((p) => p.onTime === false).length
  const onTimeCount = completed.filter((p) => p.onTime === true).length

  const rev = gs.totalRevenue || 0
  const cost = gs.totalCosts || 0
  const net = gs.netProfit || 0
  const rep = gs.reputation || 0
  const costRatio = rev > 0 ? cost / rev : 1
  const margin = rev > 0 ? net / rev : 0

  const fixedExpenses = computeFixedExpenses(depts)
  // How many delivered projects each headcount supported this far.
  const utilization = totalStaff > 0 ? completed.length / totalStaff : 0

  // Distinct departments that actually contributed to delivered work.
  const usedDeptIds = new Set()
  for (const p of completed) {
    for (const d of (p.matchedDepartments || [])) usedDeptIds.add(d)
  }
  const avgDeptsPerProject = completed.length
    ? completed.reduce((s, p) => s + ((p.matchedDepartments || []).length || 0), 0) / completed.length
    : 0

  const year = gs.currentYear || 1
  const forecastUsed = !!(gs.forecastPurchasedByYear && gs.forecastPurchasedByYear[year])

  return {
    depts, staffOf, isActive, totalStaff, activeDeptCount,
    completed, lateCount, onTimeCount,
    rev, cost, net, rep, costRatio, margin,
    fixedExpenses, utilization,
    usedDeptIds, avgDeptsPerProject,
    accepted: gs.acceptedCount || 0,
    rejected: gs.rejectedCount || 0,
    year, forecastUsed,
  }
}

/**
 * Ordered list of diagnostic rules. Each `when` receives the signals object
 * and returns true if it applies. First match wins.
 */
const RULES = [
  // 1 — Cash crisis (most critical)
  {
    id: 'cash-crisis',
    tone: 'critical',
    when: (s) => s.net < 0,
    title: 'Cash Under Pressure',
    insight:
      'The company spent more than it earned this year. Fixed expenses and project costs outpaced the revenue you collected.',
    recommendations: [
      'Review every active department — release headcount that is not tied to delivered work.',
      'Prioritise stable, manageable projects over chasing every large opportunity.',
      'Control project costs before accepting new briefs; aim for a positive net profit first.',
    ],
  },

  // 2 — Delivery pressure / capacity exceeded (deck slide 60)
  {
    id: 'capacity-exceeded',
    tone: 'critical',
    when: (s) => s.lateCount >= 2 || (s.completed.length >= 3 && s.lateCount / s.completed.length >= 0.34),
    title: 'Delivery Pressure',
    insight:
      'Project load exceeded your team capacity. Late deliveries created delays and quality risks that dragged down overall performance.',
    recommendations: [
      'Hire 1–2 Resources or Operations employees before accepting more projects.',
      'Monitor active projects vs. employee capacity every quarter.',
      'Avoid accepting projects you cannot fully staff for delivery.',
    ],
  },

  // 3 — Reputation hit from cost-cutting (deck slide 63)
  {
    id: 'reputation-quality',
    tone: 'critical',
    when: (s) => s.rep < 40 && s.net >= 0,
    title: 'Reputation Slipped',
    insight:
      'Reputation dropped because short-term, cost-saving decisions hurt delivery quality and client satisfaction. You saved cash but paid for it in trust.',
    recommendations: [
      'Prioritise quality in high-visibility projects.',
      'Balance cost-saving against the client experience.',
      'Protect reputation — it unlocks better, higher-value RFPs.',
    ],
  },

  // 4 — Over-hiring without demand (deck slide 61)
  {
    id: 'over-hiring',
    tone: 'caution',
    when: (s) => s.totalStaff >= 6 && s.utilization < 1 && s.margin < 0.25,
    title: 'Fixed Costs Too High',
    insight:
      'Costs rose because hiring outpaced confirmed project demand. Idle headcount turned into fixed expenses that ate into profitability.',
    recommendations: [
      'Delay hiring until project demand is confirmed.',
      'Keep a lean structure in the early quarters.',
      'Review employee utilisation before expanding any team.',
    ],
  },

  // 5 — Procurement not used on vendor-heavy work (deck slide 62)
  {
    id: 'procurement-unused',
    tone: 'caution',
    when: (s) => !s.isActive('procurement') && s.costRatio > 0.6 && s.completed.length >= 2,
    title: 'Vendor Costs Unmanaged',
    insight:
      'Project costs stayed high because Procurement was never activated to negotiate vendors and logistics. You paid list price on bookings and suppliers.',
    recommendations: [
      'Activate Procurement for vendor-heavy projects.',
      'Plan supplier engagement early, before delivery starts.',
      'Use Procurement to reduce booking and logistics costs.',
    ],
  },

  // 6 — Weak finance oversight / thin margins (deck slide 67)
  {
    id: 'finance-oversight',
    tone: 'caution',
    when: (s) => !s.isActive('finance') && s.margin < 0.2 && s.rev > 0,
    title: 'Margins Squeezed',
    insight:
      'Profit margins were reduced by weak cost monitoring and limited financial oversight during execution. Small overruns compounded across the year.',
    recommendations: [
      'Engage Finance in project planning and tracking.',
      'Monitor cost vs. revenue on every project, not just at year end.',
      'Catch and control budget overruns early.',
    ],
  },

  // 7 — Sales / upsell underused (deck slide 64)
  {
    id: 'sales-underused',
    tone: 'caution',
    when: (s) => s.staffOf('sales') <= 1 && (s.accepted <= 3 || s.rejected > s.accepted),
    title: 'Revenue Left on the Table',
    insight:
      'Revenue growth was limited because Sales capacity and upselling were under-utilised. Fewer requests meant fewer high-value RFPs to choose from.',
    recommendations: [
      'Push for repeat business and upsell opportunities.',
      'Keep Sales active — more capacity generates more RFPs.',
      'Align delivery capacity to capture high-value opportunities.',
    ],
  },

  // 8 — Limited cross-functional collaboration (deck slide 65)
  {
    id: 'weak-collaboration',
    tone: 'caution',
    when: (s) => s.completed.length >= 2 && s.avgDeptsPerProject < 2.5 &&
      [s.isActive('gamification'), s.isActive('studio'), s.isActive('resources')].filter(Boolean).length <= 1,
    title: 'Projects Played It Safe',
    insight:
      'Projects delivered lower value because of limited collaboration between high-impact departments like Gamification, Studio and Resources.',
    recommendations: [
      'Combine departments for high-impact, higher-value projects.',
      'Plan cross-functional delivery early in the quarter.',
      'Use Studio for branding and Gamification for engagement together.',
    ],
  },

  // 9 — HR / talent pipeline late (deck slide 66)
  {
    id: 'hr-late',
    tone: 'caution',
    when: (s) => !s.isActive('hr') && s.lateCount >= 1,
    title: 'Talent Pipeline Reactive',
    insight:
      'Delays in hiring and skill gaps hurt delivery efficiency and pushed up last-minute costs. The team was staffed reactively instead of ahead of demand.',
    recommendations: [
      'Activate HR early to prepare a talent pipeline.',
      'Plan hiring ahead of project demand, not after it.',
      'Invest in internal capability instead of reactive hiring.',
    ],
  },

  // 10 — R&D / content quality (deck slide 68)
  {
    id: 'rd-quality',
    tone: 'caution',
    when: (s) => !s.isActive('rd') && s.rep >= 40 && s.rep < 80,
    title: 'Average Results',
    insight:
      'Projects delivered average results due to limited investment in content quality and innovation. R&D was never activated to raise the standard.',
    recommendations: [
      'Activate R&D to improve content quality and standards.',
      'Keep training materials continuously updated.',
      'Focus on quality to build long-term reputation.',
    ],
  },

  // 11 — Reactive activation / forecast unused (deck slide 69)
  {
    id: 'reactive-strategy',
    tone: 'caution',
    when: (s) => !s.forecastUsed && s.activeDeptCount <= 4,
    title: 'Growth Left Reactive',
    insight:
      'Growth potential was not fully achieved because departments were activated reactively instead of strategically, ahead of demand.',
    recommendations: [
      'Activate key departments early, based on the yearly trends.',
      'Buy and use the Forecast to plan hiring before RFPs arrive.',
      'Balance growth across revenue, cost, and reputation.',
    ],
  },

  // 12 — Strong / balanced run (deck slide 58) — fallback
  {
    id: 'balanced',
    tone: 'positive',
    when: () => true,
    title: 'Healthy Growth',
    insight:
      'The company grew because you activated the right departments early and chose RFPs with strong upside while keeping support costs in check.',
    recommendations: [
      'Strengthen Studio for documentation-heavy bids.',
      'Keep Resources active for trainer-led work.',
      'Watch fixed expenses before expanding too fast.',
    ],
  },
]

export function diagnoseYear(gs) {
  const s = readSignals(gs)
  const rule = RULES.find((r) => {
    try { return r.when(s) } catch { return false }
  }) || RULES[RULES.length - 1]
  return {
    id: rule.id,
    tone: rule.tone,
    title: rule.title,
    insight: rule.insight,
    recommendations: rule.recommendations,
  }
}

export default diagnoseYear
