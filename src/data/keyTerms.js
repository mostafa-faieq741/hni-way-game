/**
 * Key Terms Data
 * Each term's `id` is the key — the correct match is when matches[term.id] === term.id
 *
 * Trimmed to the concepts the simulation actually uses, so the pre-game
 * activity teaches what players will see in play rather than a long wall of
 * vocabulary. The rest of the business glossary lives in the in-game Terms
 * modal for just-in-time reference.
 */

export const businessTerms = [
  { id: 'revenue',     term: 'Revenue',     definition: 'Money earned when a project is delivered.' },
  { id: 'grossProfit', term: 'Gross Profit', definition: 'Revenue minus the direct cost of delivering the project.' },
  { id: 'netProfit',   term: 'Net Profit',  definition: 'Gross profit after fixed costs and any penalties.' },
  { id: 'fixedCost',   term: 'Fixed Cost',  definition: 'Recurring cost you pay every quarter whether or not work happens.' },
  { id: 'reputation',  term: 'Reputation',  definition: 'Trust score that unlocks bigger projects and qualifies you for the leaderboard.' },
  { id: 'rfpBrief',    term: 'RFP Brief',   definition: 'A client request, in plain language, that you must read and interpret.' },
]

// In this simulation, the recurring fixed cost is staff payroll. These items
// frame that idea; "Salaries" is the one the game actually charges each quarter.
export const fixedCostTerms = [
  { id: 'salaries',     term: 'Salaries',      definition: 'Specialist and consultant pay — the fixed cost charged every quarter in this game.' },
  { id: 'officeRent',   term: 'Office Rent',   definition: 'Workspace and facilities cost a real company pays regardless of workload.' },
  { id: 'insurance',    term: 'Insurance',     definition: 'Staff, liability, and company coverage.' },
  { id: 'licenses',     term: 'Licenses',      definition: 'Training tools, content, and software licenses.' },
  { id: 'utilities',    term: 'Utilities',     definition: 'Electricity, water, cooling, and connectivity.' },
  { id: 'adminSupport', term: 'Admin Support', definition: 'Back-office, finance, and support overhead.' },
]

/** Utility: Fisher-Yates shuffle */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
