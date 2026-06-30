/**
 * events.js
 * Real HNI event cards — 32 cards across 4 categories.
 * Each event is either a single-button (mandatory) outcome or a two-choice
 * decision. Option effects can change:
 *   - cash          : one-time cash delta (+/-)
 *   - reputation    : reputation delta (+/-)
 *   - fixedExpenses : recurring per-quarter cost delta (+/-)
 *   - staff         : { delta, deptId?, type? } gain/lose an employee
 */

export const EVENT_POOL = [

  // ── Delivery & Trainers (DT) ─────────────────────────────────────────────
  {
    id: 'DT-01', icon: '🚫', mandatory: false, category: 'Delivery & Trainers',
    title: 'Trainer Canceled Last Minute',
    body: 'A trainer canceled just before delivery and you could not get a replacement.',
    options: [
      { id: 'cover',  label: 'Find emergency cover',
        effect: { cash: -8000 }, toast: 'Emergency cover arranged. -$8,000.' },
      { id: 'cancel', label: 'Cancel the session',
        effect: { reputation: -3 }, toast: 'Session canceled. -3 Reputation.' },
    ],
  },
  {
    id: 'DT-02', icon: '⏰', mandatory: false, category: 'Delivery & Trainers',
    title: 'Trainer Arrived Late',
    body: 'The trainer reached the venue late and the client noticed the delay.',
    options: [
      { id: 'compensate', label: 'Compensate the client',
        effect: { cash: -5000 }, toast: 'Client compensated. -$5,000.' },
      { id: 'apologize', label: 'Apologize only',
        effect: { reputation: -1 }, toast: 'Apology given. -1 Reputation.' },
    ],
  },
  {
    id: 'DT-03', icon: '📋', mandatory: false, category: 'Delivery & Trainers',
    title: 'Client Added Extra Session',
    body: 'The client wants one more session on the same project. Pay $5,000 now and earn $10,000 at close.',
    options: [
      { id: 'accept',  label: 'Accept the extension',
        effect: { cash: 5000 }, toast: 'Extension confirmed. Net gain: +$5,000.' },
      { id: 'decline', label: 'Decline the request',
        effect: {}, toast: 'Extension declined. No change.' },
    ],
  },
  {
    id: 'DT-04', icon: '⭐', mandatory: true, category: 'Delivery & Trainers',
    title: 'Perfect Delivery Feedback',
    body: 'The client rated the training as excellent.',
    options: [
      { id: 'celebrate', label: 'Celebrate the win',
        effect: { cash: 5000, reputation: 2 }, toast: 'Excellent feedback! +$5,000, +2 Reputation.' },
    ],
  },
  {
    id: 'DT-05', icon: '📚', mandatory: true, category: 'Delivery & Trainers',
    title: 'Materials Not Ready',
    body: 'The training materials were not finished before the session.',
    options: [
      { id: 'absorb', label: 'Accept the setback',
        effect: { reputation: -2 }, toast: 'Materials gap noticed by client. -2 Reputation.' },
    ],
  },
  {
    id: 'DT-06', icon: '🤸', mandatory: true, category: 'Delivery & Trainers',
    title: 'Backup Trainer Available',
    body: 'Your team found a strong backup trainer quickly.',
    options: [
      { id: 'deploy', label: 'Deploy the backup',
        effect: { reputation: 1 }, toast: 'Crisis averted. +1 Reputation.' },
    ],
  },
  {
    id: 'DT-07', icon: '✈️', mandatory: false, category: 'Delivery & Trainers',
    title: 'Travel Delay',
    body: 'A travel issue affects one delivery team.',
    options: [
      { id: 'fix',    label: 'Fix the travel issue',
        effect: { cash: -5000 }, toast: 'Travel fixed. -$5,000.' },
      { id: 'absorb', label: 'Absorb the delay',
        effect: { reputation: -2 }, toast: 'Delay absorbed. -2 Reputation.' },
    ],
  },
  {
    id: 'DT-08', icon: '🔁', mandatory: false, category: 'Delivery & Trainers',
    title: 'Client Requests Repeat Program',
    body: 'A happy client asks to repeat the same training for another group.',
    options: [
      { id: 'accept',  label: 'Run the repeat program',
        effect: { cash: 8000, reputation: 1 }, toast: 'Repeat confirmed. +$8,000, +1 Reputation.' },
      { id: 'decline', label: 'Decline for now',
        effect: {}, toast: 'Repeat declined. No change.' },
    ],
  },

  // ── Reputation & Market (RM) ─────────────────────────────────────────────
  {
    id: 'RM-01', icon: '📈', mandatory: true, category: 'Reputation & Market',
    title: 'You Became a Market Trend',
    body: 'Your excellent work became visible in the market.',
    options: [
      { id: 'ride', label: 'Ride the momentum',
        effect: { cash: 5000, reputation: 5 }, toast: 'Market recognition! +$5,000, +5 Reputation.' },
    ],
  },
  {
    id: 'RM-02', icon: '💬', mandatory: true, category: 'Reputation & Market',
    title: 'Client Posted a Testimonial',
    body: 'A client shared a strong public testimonial about HNI.',
    options: [
      { id: 'thank', label: 'Share and celebrate',
        effect: { reputation: 2 }, toast: 'Testimonial live! +2 Reputation.' },
    ],
  },
  {
    id: 'RM-03', icon: '📉', mandatory: true, category: 'Reputation & Market',
    title: 'Bad Word of Mouth',
    body: 'One unhappy client started sharing poor feedback.',
    options: [
      { id: 'accept', label: 'Work to improve',
        effect: { reputation: -3 }, toast: 'Reputation hit. -3 Reputation.' },
    ],
  },
  {
    id: 'RM-04', icon: '🤝', mandatory: false, category: 'Reputation & Market',
    title: 'Referral From Existing Client',
    body: 'A current client referred HNI to a new account. Take the extra project this quarter.',
    options: [
      { id: 'accept',  label: 'Accept the referral',
        effect: { cash: 5000, reputation: 1 }, toast: 'Referral accepted. +$5,000, +1 Reputation.' },
      { id: 'decline', label: 'Not right now',
        effect: {}, toast: 'Referral declined. No change.' },
    ],
  },
  {
    id: 'RM-05', icon: '🏆', mandatory: true, category: 'Reputation & Market',
    title: 'Industry Award Mention',
    body: 'HNI was mentioned in an industry award shortlist.',
    options: [
      { id: 'celebrate', label: 'Celebrate the recognition',
        effect: { reputation: 3 }, toast: 'Award mention! +3 Reputation.' },
    ],
  },
  {
    id: 'RM-06', icon: '📱', mandatory: true, category: 'Reputation & Market',
    title: 'Social Media Buzz',
    body: 'A project is getting good attention online.',
    options: [
      { id: 'engage', label: 'Engage with the buzz',
        effect: { cash: 5000, reputation: 1 }, toast: 'Online buzz paid off! +$5,000, +1 Reputation.' },
    ],
  },
  {
    id: 'RM-07', icon: '😠', mandatory: true, category: 'Reputation & Market',
    title: 'Client Complaint Escalated',
    body: 'A complaint reached senior management.',
    options: [
      { id: 'resolve', label: 'Resolve the complaint',
        effect: { cash: -5000, reputation: -2 }, toast: 'Complaint escalated. -$5,000, -2 Reputation.' },
    ],
  },
  {
    id: 'RM-08', icon: '💪', mandatory: false, category: 'Reputation & Market',
    title: 'Strong Brand Presence',
    body: 'Your team showed strong HNI quality in multiple projects. Choose your reward.',
    options: [
      { id: 'cash', label: 'Take the cash reward',
        effect: { cash: 10000 }, toast: 'Brand strength rewarded. +$10,000.' },
      { id: 'rep',  label: 'Take the reputation reward',
        effect: { reputation: 3 }, toast: 'Brand strength rewarded. +3 Reputation.' },
    ],
  },

  // ── Growth & Hiring (GH) ─────────────────────────────────────────────────
  {
    id: 'GH-01', icon: '🏢', mandatory: false, category: 'Growth & Hiring',
    title: 'New Branch Needed',
    body: 'You have more than 10 employees and need to open a new branch.',
    options: [
      { id: 'open',  label: 'Open the new branch',
        effect: { cash: -50000 }, toast: 'New branch opened. -$50,000.' },
      { id: 'delay', label: 'Delay expansion',
        effect: { reputation: -2 }, toast: 'Expansion delayed. -2 Reputation.' },
    ],
  },
  {
    id: 'GH-02', icon: '🌟', mandatory: false, category: 'Growth & Hiring',
    title: 'Top Talent Applied',
    body: 'A strong candidate wants to join HNI.',
    options: [
      { id: 'hire', label: 'Hire the candidate',
        effect: { cash: -10000, staff: { delta: 1 } }, toast: 'Talent hired. -$10,000, +1 employee.' },
      { id: 'pass', label: 'Pass this time',
        effect: {}, toast: 'Candidate passed. No change.' },
    ],
  },
  {
    id: 'GH-03', icon: '📊', mandatory: true, category: 'Growth & Hiring',
    title: 'Training Demand Increased',
    body: 'The market is asking for more programs than usual. Gain an extra project slot this quarter.',
    options: [
      { id: 'capitalize', label: 'Capitalize on demand',
        effect: { cash: 5000 }, toast: 'Demand surge captured. +$5,000.' },
    ],
  },
  {
    id: 'GH-04', icon: '😓', mandatory: false, category: 'Growth & Hiring',
    title: 'Team Burnout Warning',
    body: 'Your people are overloaded after too many active projects.',
    options: [
      { id: 'support', label: 'Invest in team support',
        effect: { cash: -5000 }, toast: 'Support provided. -$5,000.' },
      { id: 'push',    label: 'Push through it',
        effect: { reputation: -2 }, toast: 'Team pushed too hard. -2 Reputation.' },
    ],
  },
  {
    id: 'GH-05', icon: '💰', mandatory: false, category: 'Growth & Hiring',
    title: 'Strategic Investment Opportunity',
    body: 'Invest $20,000 this quarter to unlock $20,000 next year.',
    options: [
      { id: 'invest', label: 'Make the investment',
        effect: { cash: -20000 }, toast: 'Investment made. -$20,000. Returns expected next year.' },
      { id: 'skip',   label: 'Skip the investment',
        effect: {}, toast: 'Investment skipped. No change.' },
    ],
  },
  {
    id: 'GH-06', icon: '⭐', mandatory: true, category: 'Growth & Hiring',
    title: 'Star Performer Rising',
    body: 'A team member stepped up and led a project well.',
    options: [
      { id: 'recognize', label: 'Recognize the achievement',
        effect: { cash: 5000, reputation: 1 }, toast: 'Star performer recognized. +$5,000, +1 Reputation.' },
    ],
  },
  {
    id: 'GH-07', icon: '⏳', mandatory: true, category: 'Growth & Hiring',
    title: 'Hiring Delay',
    body: 'A role stayed open for too long. One project is at risk.',
    options: [
      { id: 'absorb', label: 'Absorb the impact',
        effect: { cash: -3000, reputation: -1 }, toast: 'Hiring delay hurt the team. -$3,000, -1 Reputation.' },
    ],
  },
  {
    id: 'GH-08', icon: '💼', mandatory: true, category: 'Growth & Hiring',
    title: 'Department Grew Stronger',
    body: 'One department has matured and can take more workload.',
    options: [
      { id: 'leverage', label: 'Leverage the strength',
        effect: { cash: 10000 }, toast: 'Department performing strongly. +$10,000.' },
    ],
  },

  // ── Finance & Operations (FO) ────────────────────────────────────────────
  {
    id: 'FO-01', icon: '💳', mandatory: false, category: 'Finance & Operations',
    title: 'Budget Approval Delay',
    body: 'A planned expense was not approved on time.',
    options: [
      { id: 'rush', label: 'Rush the approval',
        effect: { cash: -5000 }, toast: 'Rushed approval. -$5,000.' },
      { id: 'wait', label: 'Accept the delay',
        effect: { reputation: -1 }, toast: 'Delay accepted. -1 Reputation.' },
    ],
  },
  {
    id: 'FO-02', icon: '🛒', mandatory: false, category: 'Finance & Operations',
    title: 'Vendor Offered a Discount',
    body: 'A supplier gave HNI a special rate. Use this vendor on your next project.',
    options: [
      { id: 'use',  label: 'Use the vendor',
        effect: { cash: 5000 }, toast: 'Vendor deal locked in. +$5,000 saved.' },
      { id: 'skip', label: 'Skip the deal',
        effect: {}, toast: 'Vendor deal skipped. No change.' },
    ],
  },
  {
    id: 'FO-03', icon: '📜', mandatory: true, category: 'Finance & Operations',
    title: 'Unexpected Compliance Fee',
    body: 'A compliance-related cost appeared this quarter.',
    options: [
      { id: 'pay', label: 'Pay the compliance fee',
        effect: { cash: -10000 }, toast: 'Compliance fee paid. -$10,000.' },
    ],
  },
  {
    id: 'FO-04', icon: '⚙️', mandatory: false, category: 'Finance & Operations',
    title: 'Better Process Saved Time',
    body: 'Your team improved one internal process. Apply it to an active project to earn a reward.',
    options: [
      { id: 'apply', label: 'Apply the process',
        effect: { cash: 5000 }, toast: 'Process improvement applied. +$5,000.' },
      { id: 'later', label: 'Apply it later',
        effect: {}, toast: 'Process improvement shelved. No change.' },
    ],
  },
  {
    id: 'FO-05', icon: '🖥️', mandatory: false, category: 'Finance & Operations',
    title: 'Office Equipment Failure',
    body: 'A key device failed during project work.',
    options: [
      { id: 'replace',    label: 'Replace the equipment',
        effect: { cash: -5000 }, toast: 'Equipment replaced. -$5,000.' },
      { id: 'workaround', label: 'Find a workaround',
        effect: { reputation: -1 }, toast: 'Workaround used. -1 Reputation.' },
    ],
  },
  {
    id: 'FO-06', icon: '💵', mandatory: true, category: 'Finance & Operations',
    title: 'Invoice Paid Early',
    body: 'A client paid earlier than expected.',
    options: [
      { id: 'receive', label: 'Receive the payment',
        effect: { cash: 10000 }, toast: 'Early payment received! +$10,000.' },
    ],
  },
  {
    id: 'FO-07', icon: '🚚', mandatory: false, category: 'Finance & Operations',
    title: 'Procurement Delay',
    body: 'A needed item was not purchased on time.',
    options: [
      { id: 'expedite', label: 'Expedite procurement',
        effect: { cash: -5000 }, toast: 'Procurement expedited. -$5,000.' },
      { id: 'delay',    label: 'Accept the delay',
        effect: { reputation: -2 }, toast: 'Project delayed. -2 Reputation.' },
    ],
  },
  {
    id: 'FO-08', icon: '💡', mandatory: true, category: 'Finance & Operations',
    title: 'Strong Cost Control',
    body: 'Your team managed costs very well this quarter.',
    options: [
      { id: 'reward', label: 'Claim the reward',
        effect: { cash: 5000, reputation: 1 }, toast: 'Cost control paid off! +$5,000, +1 Reputation.' },
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
