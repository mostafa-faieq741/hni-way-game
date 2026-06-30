/**
 * Key Terms Data
 * Each term's `id` is the key — the correct match is when matches[term.id] === term.id
 */

export const businessTerms = [
  { id: 'revenue',      term: 'Revenue',           definition: 'Money earned after delivery.' },
  { id: 'cogs',         term: 'COGS',               definition: 'Direct project delivery cost only.' },
  { id: 'grossProfit',  term: 'Gross Profit',        definition: 'Revenue minus direct project cost.' },
  { id: 'fixedCost',    term: 'Fixed Cost',          definition: 'Costs paid whether work happens or not.' },
  { id: 'netProfit',    term: 'Net Profit',          definition: 'Gross profit after fixed cost and penalties.' },
  { id: 'cashFlow',     term: 'Cash Flow',           definition: 'The movement of money in and out of the company.' },
  { id: 'variableCost', term: 'Variable Cost',       definition: 'A cost that changes depending on the project size or delivery needs.' },
  { id: 'rfpBrief',     term: 'RFP Brief',           definition: 'Client request written in plain language that the player must interpret.' },
  { id: 'activeDept',   term: 'Active Department',   definition: 'Department with enough employees to respond to project needs.' },
  { id: 'reputation',   term: 'Reputation',          definition: 'Trust score that affects growth, project access, and outcomes.' },
]

export const fixedCostTerms = [
  { id: 'salaries',        term: 'Salaries',          definition: 'Employees and consultants on payroll.' },
  { id: 'officeRent',      term: 'Office Rent',        definition: 'Workspace and facilities cost.' },
  { id: 'insurance',       term: 'Insurance',          definition: 'Staff, liability, and company coverage.' },
  { id: 'taxes',           term: 'Taxes',              definition: 'Government fees and business tax obligations.' },
  { id: 'itBills',         term: 'IT Bills',           definition: 'Software, systems, and platform subscriptions.' },
  { id: 'internet',        term: 'Internet',           definition: 'Connectivity and office communication.' },
  { id: 'utilities',       term: 'Utilities',          definition: 'Electricity, water, cooling, and services.' },
  { id: 'licenses',        term: 'Licenses',           definition: 'Training tools, content, and software licenses.' },
  { id: 'adminSupport',    term: 'Admin Support',      definition: 'Back-office, finance, and support cost.' },
  { id: 'maintenance',     term: 'Maintenance',        definition: 'Equipment, devices, and office upkeep.' },
  { id: 'vendorRetainers', term: 'Vendor Retainers',   definition: 'Ongoing contracted support or retainers.' },
  { id: 'miscOverhead',    term: 'Misc. Overhead',     definition: 'Other recurring company running costs.' },
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
