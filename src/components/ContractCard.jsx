/**
 * ContractCard.jsx
 * Rich brief/contract card (light theme) inspired by the HNI Way game-look
 * reference. Presentation only — accepting still happens on ProjectDetail so
 * the preview-then-commit flow stays intact.
 *
 * Display fields are DERIVED from existing project data — no game-core change:
 *   - stars      : project.stars (difficulty / tier)
 *   - reward     : project.revenue
 *   - risk       : bucketed from cost / revenue ratio (financial risk)
 *   - scope pips : project.stars (1–4)
 *   - team       : from salesRequirement (Small / Medium / Large)
 *   - tag        : 1★ → QUICK WIN, 4★ → PRIORITY
 *
 * Required teams are shown openly so the player can plan staffing/capacity.
 */

import React from 'react'
import { getExecutionTeams } from '../data/projects.js'
import { DEPARTMENTS_DATA } from '../data/departments.js'

const CC_DEPT = DEPARTMENTS_DATA.reduce((m, d) => { m[d.id] = { name: d.name, icon: d.icon }; return m }, {})

function deriveTeam(req) {
  if (!req) return 'Small'
  if (req.type === 'consultant') return req.count >= 2 ? 'Large' : 'Medium'
  return req.count >= 2 ? 'Medium' : 'Small'
}

function deriveRisk(stars) {
  // Risk tracks delivery difficulty (stars) so it stays coherent with the
  // QUICK WIN / PRIORITY tags: an easy 1-star brief should never read "Med".
  if (stars >= 4) return { key: 'high', label: 'High Risk' }
  if (stars === 3) return { key: 'med', label: 'Med Risk' }
  return { key: 'low', label: 'Low Risk' }
}

function deriveTag(stars) {
  if (stars >= 4) return { label: 'HIGH IMPACT', key: 'priority' }
  if (stars === 3) return { label: 'STRATEGIC', key: 'strategic' }
  if (stars <= 1) return { label: 'QUICK WIN', key: 'quick' }
  return null
}

function deriveCategory(tag) {
  if (!tag) return 'teal'
  return { quick: 'green', strategic: 'blue', priority: 'amber' }[tag.key] || 'teal'
}

export default function ContractCard({ project, onOpen, cta = 'Review', state }) {
  const stars = project.stars || 1
  const team = deriveTeam(project.salesRequirement)
  const risk = deriveRisk(stars)
  const tag = deriveTag(stars)
  const cat = deriveCategory(tag)
  const locked = state === 'accepted' || state === 'completed'
  const teams = getExecutionTeams(project)

  return (
    <button
      className={'contract-card contract-card--cat-' + cat + (locked ? ' contract-card--done' : '')}
      onClick={() => onOpen(project)}
      title={cta + ' ' + project.title}
    >
      <div className="contract-card__badge" aria-hidden="true">
        <span className="contract-card__badge-star">★</span>
        <span className="contract-card__badge-lvl">{stars}★</span>
      </div>

      <div className="contract-card__body">
        <div className="contract-card__heads">
          <span className="contract-card__client">{project.code}</span>
          {tag && <span className={'contract-tag contract-tag--' + tag.key}>{tag.label}</span>}
          {state === 'accepted' && <span className="contract-tag contract-tag--accepted">ACCEPTED</span>}
          {state === 'completed' && <span className="contract-tag contract-tag--accepted">DELIVERED</span>}
        </div>
        <div className="contract-card__title">{project.title}</div>
        <div className="contract-card__stars" aria-label={stars + ' stars'}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={'cc-star' + (i < stars ? ' cc-star--f' : '')}>★</span>
          ))}
        </div>
        <div className="contract-card__chips">
          <span className="cc-chip">
            <span className="cc-chip__k">Scope</span>
            <span className="cc-pips" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={'cc-pip' + (i < stars ? ' cc-pip--f' : '')} />
              ))}
            </span>
          </span>
          <span className="cc-chip">
            <span className="cc-chip__k">Team</span>
            <span className="cc-chip__v">{team}</span>
          </span>
          <span className="cc-chip">
            <span className="cc-chip__k">Duration</span>
            <span className="cc-chip__v">{project.durationQuarters} qtr</span>
          </span>
          <span className={'cc-risk cc-risk--' + risk.key}>
            <span className="cc-risk__dot" aria-hidden="true" />
            {risk.label}
          </span>
        </div>
        <div className="cc-teams" aria-label="Teams required">
          <span className="cc-teams__k">Teams</span>
          {teams.map((t) => {
            const info = CC_DEPT[t.id] || { name: t.id, icon: '•' }
            return (
              <span key={t.id} className="cc-teams__item" title={info.name}>
                {info.icon} {info.name}{t.count > 1 ? ' ×' + t.count : ''}
              </span>
            )
          })}
          {teams.length === 0 && <span className="cc-teams__item cc-teams__item--none">No delivery team</span>}
        </div>
      </div>

      <div className="contract-card__reward">
        <div className="cc-reward__label">Reward</div>
        <div className="cc-reward__value">${project.revenue.toLocaleString()}</div>
        <div className="cc-reward__sub">revenue on delivery</div>
        <span className={'cc-cta' + (locked ? ' cc-cta--muted' : '')}>
          {locked ? 'View' : cta} ›
        </span>
      </div>
    </button>
  )
}
