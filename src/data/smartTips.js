/**
 * smartTips.js
 * Smart Play Guide tips shown contextually across game screens.
 * Tips are picked randomly within their category each time a screen is entered.
 */

export const SMART_TIPS = {
  /** Shown on: Sales Request List, Project Detail */
  project: [
    'Do not take too many projects at once. Too many active projects can reduce delivery quality and damage reputation.',
    'Always check your fixed expenses before spending on new hires, vendors, or optional project upgrades.',
    'Read the RFP carefully before accepting it. The best players translate the brief into the right departments and employee needs.',
    'Activate only the departments you really need early. Extra staff helps growth, but unnecessary hiring increases cost fast.',
    'Protect reputation as much as revenue. A profitable quarter with bad delivery can hurt future results.',
  ],

  /** Shown on: Department Detail, Home department interactions */
  department: [
    'Do not accept a project just because it has high revenue. Check whether you can deliver it with your active team.',
    'Use Resources, Studio, and Gamification wisely on event-style projects. They often unlock high-value briefs when combined well.',
    'Watch department costs over time. One expensive department can quietly reduce your yearly net profit.',
    'If a project has many moving parts, hire before you accept it. Late hiring often costs more than early planning.',
    'When cash is tight, choose stable projects with manageable costs instead of chasing every big opportunity.',
  ],

  /** Shown on: Finance / Quarter Center, Year Summary, Final Report */
  finance: [
    'Use the finance screen every quarter, not only at year end. Small mistakes grow quickly over multiple rounds.',
    'Track which departments you use most and least. Repeated underuse may mean you hired too early or staffed the wrong teams.',
    'Delivered-on-time projects build a stronger company than rushed projects with penalties or complaints.',
    'Balance short-term wins and long-term growth. Some choices improve this quarter, while others strengthen the company over several years.',
    'The best strategy is not only earning more. It is earning well, spending carefully, and keeping reputation high.',
  ],
}

/**
 * Pick a random tip for a given category.
 * @param {'project'|'department'|'finance'} category
 * @returns {string}
 */
export function pickTip(category) {
  const tips = SMART_TIPS[category]
  if (!tips || tips.length === 0) return ''
  return tips[Math.floor(Math.random() * tips.length)]
}
