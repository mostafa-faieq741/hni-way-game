/** Objectives screen data */
export const objectives = {
  sectionLabel: 'HNI Way',
  winConditionLabel: 'Win condition',
  winStatement: 'Finish Year 5 with the healthiest company score.',
  bullets: [
    'Cash and net profit matter',
    'Reputation must stay above 100',
  ],
  stats: [
    { value: '20', label: 'Quarters', sub: 'Rounds' },
    { value: '12', label: 'Departments', sub: '' },
    { value: '8',  label: 'Active Projects', sub: '' },
  ],
}

/** Starting setup data */
export const startingSetup = {
  sectionLabel: 'HNI Way',
  statCards: [
    { value: '100,000', label: 'Starting Cash', prefix: '$' },
    { value: '2',       label: 'Mandatory Hires', sub: '1 L&D + 1 Sales' },
    { value: '5,000',   label: 'Specialist Cost', prefix: '$' },
    { value: '10,000',  label: 'Consultant Cost', prefix: '$' },
  ],
  panels: [
    {
      title: 'Mandatory First Setup',
      icon: 'setup',
      bullets: [
        'Every player starts with 100,000.',
        'Before Quarter 1 begins, each player must hire: 1 L&D specialist and 1 Sales specialist.',
        'Specialists cost 5,000 each.',
        'Consultants cost 10,000 each.',
        'Use this first setup to make the company operational before reading new sales requests.',
      ],
    },
    {
      title: 'Employee Capacity',
      icon: 'people',
      bullets: [
        '1 specialist can handle 2 projects at the same time.',
        '1 consultant can handle 4 projects at the same time.',
        'Players should scale their team based on current demand, expected trend, and project load.',
      ],
    },
    {
      title: 'Sales Output',
      icon: 'chart',
      bullets: [
        '1 Sales specialist sends 2 sales requests per quarter.',
        '1 Sales consultant sends 4 sales requests per quarter.',
        'More sales capacity means more chances to win higher-value RFPs.',
      ],
    },
  ],
  tip: 'Hire only what you can support. More employees create more capacity, but they also increase fixed cost pressure over time.',
}

/** Turn flow data */
export const turnFlow = {
  steps: [
    {
      number: 1,
      title: 'Open Sales Request',
      description: 'Review the incoming RFPs and understand what the client wants.',
      color: 'violet',
    },
    {
      number: 2,
      title: 'Accept or Reject',
      description: 'Decide if the company can realistically deliver it with the current setup.',
      color: 'primary',
    },
    {
      number: 3,
      title: 'Hire or Fire',
      description: 'Adjust employees based on project needs. Every two fires loses 2 reputation.',
      color: 'gold',
    },
    {
      number: 4,
      title: 'Pay Project Costs & Fixed Expenses',
      description: 'Cover project setup costs and the company\'s fixed expenses for the period.',
      color: 'emerald',
    },
    {
      number: 5,
      title: 'Collect Revenues',
      description: 'After successful delivery, collect the project revenue and update results.',
      color: 'primary',
    },
  ],
  importantNote: 'Hiring and firing should be tied to real delivery needs. Firing too aggressively damages reputation, while overhiring raises fixed expenses and can weaken yearly profit.',
}
