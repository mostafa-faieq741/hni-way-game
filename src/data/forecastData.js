/**
 * forecastData.js
 * Mock forecast trend cards and year signals.
 * Future: fetched from Google Sheets "forecast" tab keyed by year.
 */

export const FORECAST_TRENDS = [
  {
    id:              'leadership',
    title:           'Leadership & Management',
    icon:            '🏆',
    signal:          'High demand',
    description:     'Companies are investing heavily in leadership development following rapid post-pandemic promotions. Expect 2–3 leadership briefs this year.',
    suggestedHires:  'Hire 1 L&D Specialist if not already active.',
    expectedAdv:     'Projects in this space carry strong reputation bonuses and above-average revenue.',
    detail:          'The leadership gap created by accelerated promotions is driving a surge in management fundamentals programmes. Clients in banking, healthcare, and logistics are the key buyers. Proposals that blend instructor-led and digital formats will win more consistently. Recommended: ensure your L&D and Proposal departments are staffed before submitting.',
  },
  {
    id:              'team-building',
    title:           'Team Building & Engagement',
    icon:            '🤝',
    signal:          'Steady demand',
    description:     'Post-restructure team cohesion work is a growing RFP category. Physical events combined with digital reinforcement are winning briefs.',
    suggestedHires:  'Hire 1 Resources Specialist and 1 Studio Specialist.',
    expectedAdv:     'Moderate revenue but reliable pipeline. Good for early-quarter cash flow.',
    detail:          'Clients want blended solutions: a live event to kick off, followed by digital reinforcement over 4–6 weeks. The winning formula combines Resources for venue and logistics, Studio for visual assets, and L&D for the content framework. Avoid taking more than two of these concurrently — the event coordination overhead is significant.',
  },
  {
    id:              'digital-learning',
    title:           'Digital Learning Conversion',
    icon:            '💻',
    signal:          'Surging demand',
    description:     'Clients are converting legacy face-to-face programmes into e-learning. This is driving the largest volume of project briefs this year.',
    suggestedHires:  'Hire 1 E-Learning Specialist immediately. Consider a Studio Specialist for media-rich conversions.',
    expectedAdv:     'High volume of 2-star projects. Can be stacked for revenue.',
    detail:          'Budget holders who paused in-person delivery are now funding the digital transition they deferred for two years. Projects range from simple SCORM conversions to full interactive re-designs. The bottleneck is usually content review and client approval cycles — build in buffer time. E-Learning department capacity is the critical constraint.',
  },
  {
    id:              'sales-capability',
    title:           'Sales Capability',
    icon:            '📈',
    signal:          'High demand',
    description:     'Sales skill gaps are a board-level concern across multiple sectors. Expect competitive multi-supplier bids for these programmes.',
    suggestedHires:  'Hire 1 Proposal Consultant to improve win rates on competitive bids.',
    expectedAdv:     '2-star and 3-star revenue. Strong reputation multipliers.',
    detail:          'Clients are asking for evidence-based sales capability frameworks tied to measurable KPIs. The briefs are more complex than standard training design — they require commercial analysis, skills diagnosis, and a performance measurement plan. The Proposal department\'s ability to articulate ROI is a decisive differentiator. Prioritise quality of submission over speed.',
  },
  {
    id:              'documentation-events',
    title:           'Documentation-Heavy Events',
    icon:            '📋',
    signal:          'Moderate demand',
    description:     'Large-scale conference and event management briefs are returning. Documentation, facilitation guides, and reporting packs are core deliverables.',
    suggestedHires:  'Hire 1 Resources Specialist and 1 Procurement Specialist.',
    expectedAdv:     'Steady 1-star and 2-star revenue. Good for early-quarter pipeline.',
    detail:          'These briefs look simple but hide significant documentation and logistics work. Clients expect printed workbooks, participant guides, facilitator manuals, and post-event reports — all branded and consistent. Studio and Resources are the key departments. Watch procurement costs on printed materials — margins erode quickly without a Procurement Specialist managing supplier costs.',
  },
  {
    id:              'procurement-bids',
    title:           'Procurement-Intensive Bids',
    icon:            '🔗',
    signal:          'Emerging demand',
    description:     'Public sector and government clients are issuing procurement-heavy RFPs with strict vendor compliance requirements.',
    suggestedHires:  'Hire 1 Procurement Specialist. Consider HR support for compliance documentation.',
    expectedAdv:     'High revenue ceiling but complex delivery. Suits mature teams.',
    detail:          'These briefs require formal tender submissions, supplier qualification documents, and compliance certificates. The Procurement department is non-negotiable — without it you cannot submit a compliant bid. Finance involvement is also required for budget justification sections. The upside: public sector contracts tend to be longer, more stable, and repeat-purchase. Invest in this capability as a medium-term growth lever.',
  },
]

/**
 * Mock year signals keyed by year number (1–5).
 * In production these would come from the game_config sheet.
 */
export const YEAR_SIGNALS = {
  1: {
    year:        1,
    headline:    'Year 1 — Build Your Foundation',
    signal:      'The market is warm. Clients are testing the market with small-to-medium briefs.',
    recommended: 'Focus on 1-star and 2-star projects. Protect cash. Build reputation steadily.',
  },
  2: {
    year:        2,
    headline:    'Year 2 — Find Your Niche',
    signal:      'Digital learning and leadership development are the dominant categories.',
    recommended: 'Invest in E-Learning and L&D. Target 2-star and early 3-star opportunities.',
  },
  3: {
    year:        3,
    headline:    'Year 3 — Scale Selectively',
    signal:      'Competition is intensifying. Quality and delivery track record differentiate winners.',
    recommended: 'Hire carefully. Focus on on-time delivery. Build toward 3-star qualification.',
  },
  4: {
    year:        4,
    headline:    'Year 4 — Go for Growth',
    signal:      'Large enterprise clients are entering the market. 4-star opportunities are emerging.',
    recommended: 'Pursue 3-star projects aggressively. Prepare your team for 4-star bids.',
  },
  5: {
    year:        5,
    headline:    'Year 5 — Final Push',
    signal:      'Reputation is everything. The leaderboard separates companies with strong delivery records.',
    recommended: 'Maximise net profit. Protect reputation. Deliver every active project on time.',
  },
}
