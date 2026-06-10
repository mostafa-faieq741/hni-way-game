/**
 * events.js
 * Event pool for between-quarter events. Two events fire each quarter.
 * Each event is either a single-button (mandatory) outcome or a two-choice
 * decision. Option effects can change:
 *   - cash          : one-time cash delta (+/-)
 *   - reputation    : reputation delta (+/-)
 *   - fixedExpenses : recurring per-quarter cost delta (+/-)
 *   - staff         : { delta, deptId?, type? } gain/lose an employee
 *
 * Future: load from a Google Sheets "events" tab.
 */

export const EVENT_POOL = [
  // ── Single-button (mandatory) — mostly forced costs / one-offs ──────────
  {
    id: 'office-space', icon: '🏢', mandatory: true,
    title: 'Office Space Pressure',
    body: 'The department has grown and the current office is too small for daily operations. You need a larger space.',
    options: [
      { id: 'approve', label: 'Move to a bigger office',
        effect: { cash: -8000, fixedExpenses: 1500 },
        toast: 'New office approved. -8,000 Ħ now, +1,500 Ħ/qtr rent.' },
    ],
  },
  {
    id: 'equipment-failure', icon: '🖥️', mandatory: true,
    title: 'Studio Equipment Failure',
    body: 'Core production gear broke down and must be replaced to keep projects moving.',
    options: [
      { id: 'replace', label: 'Replace the equipment',
        effect: { cash: -5000 }, toast: 'Equipment replaced. -5,000. Ħ' },
    ],
  },
  {
    id: 'software-renewal', icon: '💾', mandatory: true,
    title: 'Annual Software Renewal',
    body: 'Your design and e-learning software licenses are up for renewal.',
    options: [
      { id: 'renew', label: 'Renew the licenses',
        effect: { cash: -3500, fixedExpenses: 500 },
        toast: 'Licenses renewed. -3,500 Ħ now, +500 Ħ/qtr.' },
    ],
  },
  {
    id: 'utility-hike', icon: '⚡', mandatory: true,
    title: 'Rising Utility Costs',
    body: 'Energy and facility costs have gone up across the board.',
    options: [
      { id: 'absorb', label: 'Absorb the increase',
        effect: { fixedExpenses: 400 }, toast: 'Costs rose. +400 Ħ/qtr.' },
    ],
  },
  {
    id: 'security-patch', icon: '🔒', mandatory: true,
    title: 'Security Scare',
    body: 'A minor security incident means systems need to be patched and hardened immediately.',
    options: [
      { id: 'patch', label: 'Patch the systems',
        effect: { cash: -2500 }, toast: 'Systems secured. -2,500. Ħ' },
    ],
  },
  {
    id: 'award-win', icon: '🏆', mandatory: true,
    title: 'Industry Award Win',
    body: 'Your work won recognition at a major L&D industry awards night. Great press for the company.',
    options: [
      { id: 'celebrate', label: 'Share the news',
        effect: { reputation: 4 }, toast: 'Award win! +4 reputation.' },
    ],
  },
  {
    id: 'client-referral', icon: '🤝', mandatory: true,
    title: 'Warm Client Referral',
    body: 'A delighted client referred you to a partner organisation, bringing in unexpected goodwill and a small advance.',
    options: [
      { id: 'welcome', label: 'Welcome the referral',
        effect: { cash: 6000, reputation: 2 }, toast: 'Referral in. +6,000, Ħ +2 reputation.' },
    ],
  },
  {
    id: 'viral-post', icon: '📈', mandatory: true,
    title: 'A Post Goes Viral',
    body: 'One of your case studies took off on social media, boosting your visibility at no cost.',
    options: [
      { id: 'ride', label: 'Ride the wave',
        effect: { reputation: 3 }, toast: 'You went viral! +3 reputation.' },
    ],
  },
  {
    id: 'tax-settlement', icon: '🧾', mandatory: true,
    title: 'Year-End Tax Settlement',
    body: 'The accountants finalised the books and a tax balance is due.',
    options: [
      { id: 'settle', label: 'Settle the balance',
        effect: { cash: -4000 }, toast: 'Taxes settled. -4,000. Ħ' },
    ],
  },
  {
    id: 'maintenance', icon: '🛠️', mandatory: true,
    title: 'Office Maintenance',
    body: 'Overdue repairs and maintenance can no longer wait.',
    options: [
      { id: 'fix', label: 'Carry out repairs',
        effect: { cash: -2000 }, toast: 'Repairs done. -2,000. Ħ' },
    ],
  },

  // ── Two-choice decisions ────────────────────────────────────────────────
  {
    id: 'training-grant', icon: '🎓', mandatory: false,
    title: 'Industry Training Grant',
    body: 'A government-backed L&D fund approved your application. Take the grant, or decline to keep things simple.',
    options: [
      { id: 'accept', label: 'Accept the grant',
        effect: { cash: 5000, reputation: 3 }, toast: 'Grant accepted. +5,000, Ħ +3 reputation.' },
      { id: 'decline', label: 'Decline politely',
        effect: { reputation: 1 }, toast: 'Politely declined. +1 reputation.' },
    ],
  },
  {
    id: 'media-feature', icon: '📰', mandatory: false,
    title: 'Industry Media Feature',
    body: 'A leading L&D magazine wants to feature HNI — for a small sponsorship fee.',
    options: [
      { id: 'sponsor', label: 'Sponsor the feature',
        effect: { cash: -6000, reputation: 6 }, toast: 'Feature live. -6,000, Ħ +6 reputation.' },
      { id: 'pass', label: 'Pass for now',
        effect: {}, toast: 'Passed. No change.' },
    ],
  },
  {
    id: 'key-hire-leaving', icon: '👋', mandatory: false,
    title: 'Key Hire Considering Leaving',
    body: 'A senior staff member is being recruited by a competitor.',
    options: [
      { id: 'retain', label: 'Offer a retention bonus',
        effect: { cash: -4000, reputation: 2 }, toast: 'Retention bonus paid. -4,000, Ħ +2 reputation.' },
      { id: 'release', label: 'Let them go',
        effect: { reputation: -2, staff: { delta: -1 } }, toast: 'Employee left. -1 staff, -2 reputation.' },
    ],
  },
  {
    id: 'conference-booth', icon: '🎪', mandatory: false,
    title: 'Conference Sponsorship',
    body: 'A major industry conference is offering a sponsor booth slot.',
    options: [
      { id: 'sponsor', label: 'Sponsor a booth',
        effect: { cash: -7000, reputation: 5 }, toast: 'Booth booked. -7,000, Ħ +5 reputation.' },
      { id: 'skip', label: 'Skip this one',
        effect: {}, toast: 'Skipped the conference.' },
    ],
  },
  {
    id: 'overtime-crunch', icon: '⏰', mandatory: false,
    title: 'Delivery Crunch',
    body: 'A deadline is tight. You can pay overtime to hit it, or push the timeline.',
    options: [
      { id: 'overtime', label: 'Pay overtime',
        effect: { cash: -3000, reputation: 2 }, toast: 'Overtime paid. -3,000, Ħ +2 reputation.' },
      { id: 'push', label: 'Push the deadline',
        effect: { reputation: -2 }, toast: 'Deadline slipped. -2 reputation.' },
    ],
  },
  {
    id: 'pr-crisis', icon: '🔥', mandatory: false,
    title: 'Reputation Hit',
    body: 'A misunderstanding with a client went public. How do you respond?',
    options: [
      { id: 'pr-firm', label: 'Hire a PR firm to manage it',
        effect: { cash: -5000, reputation: -1 }, toast: 'PR managed it. -5,000, Ħ -1 reputation.' },
      { id: 'internal', label: 'Handle it internally',
        effect: { reputation: -4 }, toast: 'Handled internally. -4 reputation.' },
    ],
  },
  {
    id: 'partnership', icon: '🔗', mandatory: false,
    title: 'Partnership Offer',
    body: 'A complementary agency proposes a joint venture that could raise your profile.',
    options: [
      { id: 'join', label: 'Join the partnership',
        effect: { cash: -4000, reputation: 5 }, toast: 'Partnership signed. -4,000, Ħ +5 reputation.' },
      { id: 'decline', label: 'Stay independent',
        effect: {}, toast: 'Declined the partnership.' },
    ],
  },
  {
    id: 'csr-initiative', icon: '🌱', mandatory: false,
    title: 'Community Initiative',
    body: 'You can fund a community L&D program — good for people and for your brand.',
    options: [
      { id: 'fund', label: 'Fund the program',
        effect: { cash: -3000, reputation: 5 }, toast: 'Program funded. -3,000, Ħ +5 reputation.' },
      { id: 'small', label: 'A smaller gesture',
        effect: { cash: -500, reputation: 1 }, toast: 'Small gesture. -500, Ħ +1 reputation.' },
    ],
  },
  {
    id: 'intern-program', icon: '🧑‍🎓', mandatory: false,
    title: 'Internship Program',
    body: 'You can launch an internship program to add capacity and develop talent.',
    options: [
      { id: 'launch', label: 'Launch it (adds L&D staff)',
        effect: { cash: -2000, fixedExpenses: 1000, staff: { delta: 1, deptId: 'ld', type: 'specialist' } },
        toast: 'Interns onboarded. +1 L&D staff, +1,000 Ħ/qtr.' },
      { id: 'later', label: 'Maybe later',
        effect: {}, toast: 'Held off on interns.' },
    ],
  },
  {
    id: 'talent-poaching', icon: '🎯', mandatory: false,
    title: 'Talent Being Poached',
    body: 'A competitor is aggressively courting one of your specialists.',
    options: [
      { id: 'counter', label: 'Make a counter-offer',
        effect: { cash: -4500, reputation: 1 }, toast: 'Counter-offer accepted. -4,500, Ħ +1 reputation.' },
      { id: 'lose', label: 'Wish them well',
        effect: { staff: { delta: -1 }, reputation: -1 }, toast: 'Specialist left. -1 staff, -1 reputation.' },
    ],
  },
  {
    id: 'client-dispute', icon: '⚖️', mandatory: false,
    title: 'Client Dispute',
    body: 'A client is unhappy with a deliverable and is asking for a goodwill resolution.',
    options: [
      { id: 'settle', label: 'Settle generously',
        effect: { cash: -5000, reputation: 3 }, toast: 'Settled. -5,000, Ħ +3 reputation.' },
      { id: 'firm', label: 'Stand firm',
        effect: { reputation: -3 }, toast: 'Stood firm. -3 reputation.' },
    ],
  },
  {
    id: 'wellness', icon: '🧘', mandatory: false,
    title: 'Staff Wellness Program',
    body: 'HR proposes a wellness program to keep the team happy and productive.',
    options: [
      { id: 'fund', label: 'Fund wellness',
        effect: { cash: -2500, reputation: 3, fixedExpenses: 300 }, toast: 'Wellness funded. -2,500, Ħ +300 Ħ/qtr, +3 reputation.' },
      { id: 'skip', label: 'Not right now',
        effect: { reputation: -1 }, toast: 'Skipped wellness. -1 reputation.' },
    ],
  },
  {
    id: 'bulk-licenses', icon: '📦', mandatory: false,
    title: 'Bulk Content Deal',
    body: 'A vendor offers a discounted bulk licence for premium e-learning content.',
    options: [
      { id: 'buy', label: 'Buy the bundle',
        effect: { cash: -9000, reputation: 4 }, toast: 'Bundle bought. -9,000, Ħ +4 reputation.' },
      { id: 'pass', label: 'Pass on the deal',
        effect: {}, toast: 'Passed on the bundle.' },
    ],
  },
  {
    id: 'award-submission', icon: '🥇', mandatory: false,
    title: 'Awards Submission',
    body: 'There is an opportunity to submit your best project for an industry award.',
    options: [
      { id: 'submit', label: 'Submit for the award',
        effect: { cash: -1500, reputation: 4 }, toast: 'Submitted. -1,500, Ħ +4 reputation.' },
      { id: 'save', label: 'Save the money',
        effect: {}, toast: 'Skipped the submission.' },
    ],
  },
]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Draw `count` events from a persistent "bag". Events are not repeated until
 * the whole pool has been used, then the bag reshuffles. Returns the drawn
 * events plus the remaining bag to store back in game state.
 */
export function drawEvents(bag, count = 2) {
  let b = Array.isArray(bag) ? bag.slice() : []
  const allIds = EVENT_POOL.map((e) => e.id)
  const events = []
  for (let i = 0; i < count; i++) {
    if (b.length === 0) b = shuffle(allIds)
    const id = b.shift()
    const ev = EVENT_POOL.find((e) => e.id === id)
    if (ev) events.push(ev)
  }
  return { events, nextBag: b }
}
