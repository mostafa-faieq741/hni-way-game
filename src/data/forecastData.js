/**
 * forecastData.js
 * One main yearly trend per year, tied to the upcoming project pool.
 */

export const YEAR_FORECASTS = {
  1: {
    year: 1,
    headline:        'Year 1 - Build Your Foundation',
    mainTrend:       'Foundation Programmes & Customer Service',
    icon:            'F',
    whyItMatters:    'Most clients are testing the market with low-stakes 1-star and 2-star briefs. Steady learning and customer service workshops dominate the pipeline.',
    staffingFocus:   'L&D, Sales, Resources',
    expectedAdv:     'Predictable cash flow and reputation gains while you stabilise your team.',
    secondaryHint:   'Avoid over-hiring now - fixed expenses compound across all five years.',
  },
  2: {
    year: 2,
    headline:        'Year 2 - Find Your Niche',
    mainTrend:       'Digital Onboarding & Leadership Curricula',
    icon:            'D',
    whyItMatters:    'Clients are converting paper-based onboarding to e-learning, and healthcare/finance groups are commissioning leadership curricula.',
    staffingFocus:   'E-Learning, L&D, Studio',
    expectedAdv:     'Stronger 2-star revenue and stable reputation growth on multi-quarter programmes.',
    secondaryHint:   'Studio output takes time - give media-heavy projects a quarter of lead time.',
  },
  3: {
    year: 3,
    headline:        'Year 3 - Scale Selectively',
    mainTrend:       'Team Building & Engagement Events',
    icon:            'T',
    whyItMatters:    'Companies are restoring team cohesion after restructures. Event-style RFPs combining workshops with media coverage are growing.',
    staffingFocus:   'Gamification, Studio, Resources',
    expectedAdv:     'Faster response to event-style RFPs and stronger delivery quality.',
    secondaryHint:   'Each extra concurrent event raises the risk of overdue penalties.',
  },
  4: {
    year: 4,
    headline:        'Year 4 - Go for Growth',
    mainTrend:       'National Sales Capability Programmes',
    icon:            'S',
    whyItMatters:    'Multinationals are commissioning blended sales capability programmes across regions. These are 3-star projects with strong reputation upside.',
    staffingFocus:   'Sales Consultant, Proposal, E-Learning',
    expectedAdv:     'Big revenue jumps if you can deliver across multiple regions on time.',
    secondaryHint:   'Lock in a Sales Consultant - most 3-star briefs require one.',
  },
  5: {
    year: 5,
    headline:        'Year 5 - Final Push',
    mainTrend:       'Enterprise Learning Transformations',
    icon:            'E',
    whyItMatters:    'A handful of enterprise clients are issuing transformational 4-star briefs. These can dominate the leaderboard if delivered cleanly.',
    staffingFocus:   '2x Sales Consultants, Gamification, Operations',
    expectedAdv:     'Net profit and reputation can both jump dramatically if you secure even one 4-star delivery.',
    secondaryHint:   'Reputation must stay above 100. Protect it - overdue penalties hurt twice this year.',
  },
}

export const YEAR_SIGNALS = Object.fromEntries(
  Object.entries(YEAR_FORECASTS).map(([y, v]) => [y, {
    year:        v.year,
    headline:    v.headline,
    signal:      v.whyItMatters,
    recommended: v.expectedAdv,
  }])
)

export function getYearlyForecast(year) {
  return YEAR_FORECASTS[year] || YEAR_FORECASTS[1]
}

export const FORECAST_TRENDS = []
