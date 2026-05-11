/**
 * events.js
 * Mock event pool for in-quarter / start-of-quarter events.
 * Modular: each event has options that mutate game state.
 *
 * Future: load from a Google Sheets "events" tab.
 */

export const MOCK_EVENTS = [
  {
    id:    'workspace-grow',
    title: 'Office Space Pressure',
    body:  'Your team has grown and needs a larger workspace. The existing office is no longer enough for daily operations.',
    icon:  '🏢',
    mandatory: true,
    options: [
      {
        id:     'approve',
        label:  'Approve new space',
        effect: { cash: -8000, reputation: 0, fixedExpenses: 1500 },
        toast:  'New office approved. Cash -$8,000 · Fixed expenses +$1,500/qtr',
      },
    ],
    triggerWhen: (gs) => gs.totalEmployees >= 6 && gs.currentYear >= 2 && !gs.eventsTriggered?.includes('workspace-grow'),
  },
  {
    id:    'training-grant',
    title: 'Industry Training Grant',
    body:  'A government-backed L&D fund has approved your application. You can accept the grant to improve reputation, or decline and keep things simple.',
    icon:  '🎓',
    mandatory: false,
    options: [
      {
        id:     'accept',
        label:  'Accept grant',
        effect: { cash: 5000, reputation: 3 },
        toast:  'Grant accepted. +$5,000 cash · +3 reputation',
      },
      {
        id:     'decline',
        label:  'Decline politely',
        effect: { reputation: 1 },
        toast:  'Politely declined. +1 reputation',
      },
    ],
    triggerWhen: (gs) => gs.currentYear >= 2 && gs.reputation >= 5 && !gs.eventsTriggered?.includes('training-grant'),
  },
  {
    id:    'media-feature',
    title: 'Industry Media Feature',
    body:  'A leading L&D magazine wants to feature HNI in their next issue. The PR team needs your sign-off — and a small budget.',
    icon:  '📰',
    mandatory: false,
    options: [
      {
        id:     'sponsor',
        label:  'Sponsor the feature',
        effect: { cash: -6000, reputation: 6 },
        toast:  'Feature sponsored. -$6,000 cash · +6 reputation',
      },
      {
        id:     'pass',
        label:  'Pass for now',
        effect: {},
        toast:  'Passed. No change.',
      },
    ],
    triggerWhen: (gs) => gs.currentYear >= 3 && !gs.eventsTriggered?.includes('media-feature'),
  },
  {
    id:    'key-hire-leaving',
    title: 'Key Hire Considering Leaving',
    body:  'A senior staff member is being recruited by a competitor. You can offer a retention bonus or let them go.',
    icon:  '👋',
    mandatory: false,
    options: [
      {
        id:     'retain',
        label:  'Offer retention bonus',
        effect: { cash: -4000, reputation: 2 },
        toast:  'Retention bonus paid. -$4,000 cash · +2 reputation',
      },
      {
        id:     'release',
        label:  'Let them go',
        effect: { reputation: -2 },
        toast:  'Employee left. -2 reputation',
      },
    ],
    triggerWhen: (gs) => gs.totalEmployees >= 4 && gs.currentYear >= 2 && !gs.eventsTriggered?.includes('key-hire-leaving'),
  },
]

/**
 * Pick an event that fits the current state, if any.
 * Returns the event or null. Caller marks eventsTriggered.
 */
export function pickEventForQuarter(gs) {
  const enriched = {
    ...gs,
    totalEmployees: gs.departments.reduce((s, d) => s + d.specialists + d.consultants, 0),
  }
  const candidates = MOCK_EVENTS.filter((e) => {
    try { return e.triggerWhen(enriched) } catch { return false }
  })
  if (candidates.length === 0) return null
  // 35% chance to actually trigger so events feel rare
  if (Math.random() > 0.35) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}
