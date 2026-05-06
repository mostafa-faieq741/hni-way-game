/**
 * departments.js
 * Static descriptions for all 12 departments.
 * Runtime staffing counts live in GameContainer state, not here.
 *
 * createDepartmentState() returns the initial mutable state array that
 * GameContainer seeds its game state with.
 */

export const DEPARTMENTS_DATA = [
  {
    id:          'sales',
    name:        'Sales',
    icon:        '💼',
    color:       '#91195a',
    description: 'Drives revenue by identifying and securing client projects. Manages RFPs, negotiates contracts, and keeps the project pipeline active.',
    activateWhen:'Activate from the very start. You cannot accept any project without a Sales team.',
    teamNeeded:  'At least 1 Sales Specialist. Add a Consultant to pursue 3-star and 4-star clients.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Required for all project submissions. Higher sales capability unlocks higher-revenue opportunities.',
    whatItNeeds: 'Support from Proposal for RFP responses and Finance for budget framing.',
    budgetFocus: 'Client acquisition and relationship management.',
    financeNeeds:'Revenue tracking and proposal costs.',
    quickTip:    'Always keep at least one Sales Specialist active. Without Sales you cannot accept any project.',
  },
  {
    id:          'gamification',
    name:        'Gamification',
    icon:        '🎮',
    color:       '#3A37C4',
    description: 'Designs game-based learning experiences and engagement mechanics. Transforms dry content into immersive, interactive programmes.',
    activateWhen:'Activate when a project brief calls for game-based elements, leaderboards, or interactive simulations.',
    teamNeeded:  '1 Specialist for standard briefs; 1 Consultant for complex multi-layer designs.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Adds engagement mechanics, point systems, and scenario-based challenges to a project.',
    whatItNeeds: 'Collaboration with Studio for visuals and E-Learning for platform delivery.',
    budgetFocus: 'Design, prototyping, and user-testing cycles.',
    financeNeeds:'Design licence costs and testing hours.',
    quickTip:    'Gamification projects often come with tight deadlines. Hire early if you see a pattern of gamification RFPs.',
  },
  {
    id:          'resources',
    name:        'Resources',
    icon:        '📦',
    color:       '#0c6e3a',
    description: 'Manages logistics, procurement of physical materials, and venue operations for large-scale training events.',
    activateWhen:'Activate when a project requires physical events, printed materials, or equipment logistics.',
    teamNeeded:  '1 Specialist handles small events. Add a Consultant for multi-site or multi-day operations.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Enables event delivery, physical production, and venue management within project scope.',
    whatItNeeds: 'Close coordination with HR for staffing events and Finance for vendor payments.',
    budgetFocus: 'Venue hire, print, and equipment rental.',
    financeNeeds:'Advance deposits and vendor invoice processing.',
    quickTip:    'Resources costs spike with large events. Confirm the physical requirements of a project before hiring.',
  },
  {
    id:          'studio',
    name:        'Studio',
    icon:        '🎨',
    color:       '#5B58E0',
    description: 'Produces visual assets, video, animation, and creative design for learning materials and client deliverables.',
    activateWhen:'Activate when projects include video production, branded templates, or rich media content.',
    teamNeeded:  '1 Specialist for standard assets; 1 Consultant for full video production pipelines.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'High-quality visual production that increases client satisfaction and project value.',
    whatItNeeds: 'Content from E-Learning and direction from Sales on client brand standards.',
    budgetFocus: 'Equipment, software licences, and post-production.',
    financeNeeds:'Asset licensing and software subscription costs.',
    quickTip:    'Studio output takes time. Plan at least one quarter of lead time for video-heavy deliverables.',
  },
  {
    id:          'elearning',
    name:        'E-Learning',
    icon:        '💻',
    color:       '#28a456',
    description: 'Builds digital learning modules, LMS configurations, and online course content using authoring tools and platforms.',
    activateWhen:'Activate when a project requires online courses, SCORM content, or LMS deployment.',
    teamNeeded:  '1 Specialist for module builds; 1 Consultant for complex multi-module programmes.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Digital delivery capability, enabling scalable training without physical events.',
    whatItNeeds: 'Studio for media assets and L&D for instructional design alignment.',
    budgetFocus: 'Authoring tool licences and LMS administration.',
    financeNeeds:'Platform subscription costs and content hosting fees.',
    quickTip:    'E-Learning projects often carry large upfront scoping time. Budget a quarter for setup before delivery.',
  },
  {
    id:          'operations',
    name:        'Operations',
    icon:        '⚙️',
    color:       '#999999',
    description: 'Keeps the company running smoothly. Manages processes, project coordination, quality assurance, and internal systems.',
    activateWhen:'Activate when you have more than 4 active projects or departments, or when coordination is becoming a bottleneck.',
    teamNeeded:  '1 Specialist for internal coordination; 1 Consultant for full project management support.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Reduces delivery risk, improves on-time rates, and supports multi-department project coordination.',
    whatItNeeds: 'Input from all active departments for status reporting and risk flagging.',
    budgetFocus: 'Process tools, coordination overhead, and QA cycles.',
    financeNeeds:'Project management software and administration costs.',
    quickTip:    'Operations is a multiplier. Invest in it before complexity overwhelms your team.',
  },
  {
    id:          'finance',
    name:        'Finance',
    icon:        '💰',
    color:       '#f1bd19',
    description: 'Manages financial planning, budgeting, cash flow, invoicing, and quarterly reporting for the company.',
    activateWhen:'Activate when cash management becomes complex or when projects require detailed cost accounting.',
    teamNeeded:  '1 Specialist for standard bookkeeping; 1 Consultant for full financial advisory support.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Better financial visibility, cost control, and the ability to take on financially complex projects.',
    whatItNeeds: 'Data from all departments on actual vs. budgeted spend.',
    budgetFocus: 'Accounting software, audit support, and financial reporting.',
    financeNeeds:'Internal Finance team is self-funding — costs are justified by revenue protection.',
    quickTip:    'Hiring Finance early can prevent costly overspend surprises in later quarters.',
  },
  {
    id:          'proposal',
    name:        'Proposal',
    icon:        '📝',
    color:       '#91195a',
    description: 'Writes, designs, and submits winning proposals and RFP responses. Translates client briefs into compelling solutions.',
    activateWhen:'Activate when you are consistently losing RFPs or when Sales needs support on high-stakes bids.',
    teamNeeded:  '1 Specialist for standard proposals; 1 Consultant for strategic bid management.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Improves proposal win rates and enables Sales to pursue more opportunities simultaneously.',
    whatItNeeds: 'Brief from Sales and technical input from relevant delivery departments.',
    budgetFocus: 'Bid writing, design templates, and competitive analysis.',
    financeNeeds:'Cost of proposal production and competitive intelligence tools.',
    quickTip:    'A strong Proposal team can more than pay for itself by improving win rates on 3-star and 4-star projects.',
  },
  {
    id:          'hr',
    name:        'HR',
    icon:        '👥',
    color:       '#28a456',
    description: 'Manages talent acquisition, onboarding, performance, and employee wellbeing. Supports all departments with people strategy.',
    activateWhen:'Activate when you plan to hire 3 or more employees or when people management becomes a bottleneck.',
    teamNeeded:  '1 Specialist for recruitment and admin; 1 Consultant for strategic people planning.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Faster, higher-quality hiring. Better employee retention. Access to HR-intensive project types.',
    whatItNeeds: 'Headcount plans from all departments and budget sign-off from Finance.',
    budgetFocus: 'Recruitment, training, and employee engagement programmes.',
    financeNeeds:'Payroll processing and benefits administration costs.',
    quickTip:    'HR pays off when you scale. Hire HR before you need it urgently, not after.',
  },
  {
    id:          'procurement',
    name:        'Procurement',
    icon:        '🔗',
    color:       '#3A37C4',
    description: 'Sources vendors, negotiates supplier contracts, and manages third-party delivery partnerships for project execution.',
    activateWhen:'Activate when projects rely heavily on external vendors, subcontractors, or specialist suppliers.',
    teamNeeded:  '1 Specialist for vendor coordination; 1 Consultant for contract negotiation and supplier strategy.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Lower vendor costs, faster sourcing, and access to procurement-intensive project opportunities.',
    whatItNeeds: 'Project specs from Sales and budget approval from Finance.',
    budgetFocus: 'Vendor management systems and contract administration.',
    financeNeeds:'Purchase order processing and vendor payment management.',
    quickTip:    'Procurement projects often require documentation-heavy delivery. Plan for the admin overhead.',
  },
  {
    id:          'rd',
    name:        'R&D',
    icon:        '🔬',
    color:       '#5B58E0',
    description: 'Develops new learning methodologies, tools, and proprietary frameworks that differentiate HNI in the market.',
    activateWhen:'Activate when you want to unlock innovative project types or develop a unique competitive advantage.',
    teamNeeded:  '1 Specialist for research; 1 Consultant for advanced methodology development.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Reputation multiplier. R&D activity unlocks premium project opportunities and boosts client confidence.',
    whatItNeeds: 'Cross-functional input from L&D, E-Learning, and Gamification.',
    budgetFocus: 'Research, prototyping, and methodology documentation.',
    financeNeeds:'Research budget allocation and IP protection costs.',
    quickTip:    'R&D is a long-game investment. The reputation and capability gains compound over multiple years.',
  },
  {
    id:          'ld',
    name:        'L&D',
    icon:        '📚',
    color:       '#0c6e3a',
    description: 'Designs learning strategies, curricula, and instructional frameworks that underpin all HNI training programmes.',
    activateWhen:'Activate early. L&D is the instructional backbone of most training and development projects.',
    teamNeeded:  'At least 1 L&D Specialist from the start. Add a Consultant for complex multi-programme design.',
    costToGrow:  '$5,000/quarter per Specialist · $10,000/quarter per Consultant',
    whatItAdds:  'Instructional rigour that improves project quality, learner outcomes, and client satisfaction scores.',
    whatItNeeds: 'Content briefing from Sales and media support from Studio and E-Learning.',
    budgetFocus: 'Curriculum design, needs analysis, and evaluation frameworks.',
    financeNeeds:'Learning technology licences and evaluation tool costs.',
    quickTip:    'L&D is your quality engine. Keep it staffed and it will protect your reputation across every project.',
  },
]

/**
 * Create the initial mutable department state for GameContainer.
 * Staffing is separate from descriptions: Sales and L&D start with 1 Specialist each.
 *
 * @returns {Array<object>}
 */
export function createDepartmentState() {
  const starterStaff = { sales: { specialists: 1 }, ld: { specialists: 1 } }
  return DEPARTMENTS_DATA.map((dept) => ({
    id:          dept.id,
    specialists: starterStaff[dept.id]?.specialists ?? 0,
    consultants: starterStaff[dept.id]?.consultants ?? 0,
  }))
}

/**
 * Merge static descriptions with runtime staffing state.
 * @param {Array<object>} staffingState  – from GameContainer gs.departments
 * @returns {Array<object>}              – full merged department objects
 */
export function mergeDepartments(staffingState) {
  return DEPARTMENTS_DATA.map((dept) => {
    const staff = staffingState.find((s) => s.id === dept.id) ?? { specialists: 0, consultants: 0 }
    return {
      ...dept,
      specialists: staff.specialists,
      consultants: staff.consultants,
      isActive:    staff.specialists + staff.consultants > 0,
      totalStaff:  staff.specialists + staff.consultants,
    }
  })
}
