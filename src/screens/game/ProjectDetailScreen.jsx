/**
 * ProjectDetailScreen.jsx
 * Full project brief: revenue, cost, requirements, accept / reject actions.
 */

import React, { useState } from 'react'
import { renderStars } from '../../data/projects.js'
import { mergeDepartments } from '../../data/departments.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function ProjectDetailScreen({ project: proj, gs, onGoBack, onGoToSalesRequests, onAccept, onReject, onShowToast }) {
  const [confirmed, setConfirmed] = useState(null) // null | 'accepted' | 'rejected'

  const isAlreadyAccepted = gs.activeProjects.some((p) => p.id === proj.id)
  const departments = mergeDepartments(gs.departments)

  // Check minimum reputation
  const meetsReputation = gs.reputation >= proj.minReputation

  // Check required departments
  const missingDepts = proj.requiredDepartments.filter((deptId) => {
    const d = departments.find((x) => x.id === deptId)
    return !d || !d.isActive
  })
  const meetsDepts = missingDepts.length === 0

  // Check Sales requirement
  const salesDept = gs.departments.find((d) => d.id === 'sales') ?? { specialists: 0, consultants: 0 }
  const salesReq = proj.salesRequirement
  const meetsSales = salesReq.type === 'specialist'
    ? salesDept.specialists >= salesReq.count
    : salesDept.consultants >= salesReq.count
  const hasWarning = !meetsReputation || !meetsDepts || !meetsSales

  const handleAccept = () => {
    if (isAlreadyAccepted) { onShowToast('This project is already active.'); return }
    const activeProj = {
      ...proj,
      quartersLeft: proj.durationQuarters,
      startedOnQuarter: gs.overallQuarter,
    }
    onAccept(activeProj)
    setConfirmed('accepted')
    onShowToast(`✅ ${proj.code} accepted! It has been added to your active projects.`)
  }

  const handleReject = () => {
    onReject(proj)
    setConfirmed('rejected')
    onShowToast(`Project ${proj.code} rejected.`)
  }

  return (
    <div>
      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <button className="back-btn" onClick={onGoBack} style={{ marginBottom: 0 }}>
          ← Back to Home
        </button>
        <button className="back-btn" onClick={onGoToSalesRequests} style={{ marginBottom: 0 }}>
          ← Back to Sales Requests
        </button>
      </div>

      {/* Confirmation banner */}
      {confirmed === 'accepted' && (
        <div style={{ background: 'var(--c-success-bg)', border: '1px solid #a7d8bc', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: 'var(--c-success)' }}>Project Accepted</div>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{proj.code} has been added to your active projects. Check Finance screen each quarter to track progress.</div>
          </div>
        </div>
      )}
      {confirmed === 'rejected' && (
        <div style={{ background: 'var(--c-error-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>❌</span>
          <div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: 'var(--c-error)' }}>Project Rejected</div>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>This project has been declined and counted in your rejected total.</div>
          </div>
        </div>
      )}

      {/* Warning */}
      {hasWarning && !confirmed && (
        <div className="alert-box" style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="alert-box__text">
            <div className="alert-box__label">Requirement Check</div>
            {!meetsReputation && <div>⚠️ Your reputation ({gs.reputation}) is below the minimum required ({proj.minReputation}).</div>}
            {!meetsDepts && <div>⚠️ Missing required departments: {missingDepts.join(', ')}. Hire staff to activate them.</div>}
            {!meetsSales && <div>⚠️ Sales requirement not met: needs {salesReq.count} {salesReq.type}{salesReq.count > 1 ? 's' : ''}.</div>}
            <div style={{ marginTop: 6, fontStyle: 'italic' }}>This project will be checked against its requirements before completion.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Left: project details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {/* Header */}
          <div className="card card--accent">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div>
                <div className="section-label">{proj.code}</div>
                <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0 8px' }}>
                  {proj.title}
                </h1>
                <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, letterSpacing: -1, color: 'var(--c-gold)' }}>{renderStars(proj.stars)}</span>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{proj.durationQuarters} quarter{proj.durationQuarters !== 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>· Min rep: {proj.minReputation}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 2 }}>Revenue</div>
                <div style={{ fontFamily: 'var(--f-heading)', fontSize: 28, fontWeight: 800, color: 'var(--c-success)' }}>
                  ${proj.revenue.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  Cost: ${proj.cost.toLocaleString()} · Rep: +{proj.reputationImpact}
                </div>
              </div>
            </div>
          </div>

          {/* Client brief */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>Client Brief</div>
            <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7 }}>{proj.clientBrief}</p>
          </div>

          {/* Financials */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Financial Overview</div>
            <FinRow label="Revenue"           value={`$${proj.revenue.toLocaleString()}`} positive />
            <FinRow label="Project Cost"      value={`$${proj.cost.toLocaleString()}`} />
            <FinRow label="Gross Profit"      value={`$${(proj.revenue - proj.cost).toLocaleString()}`} highlight positive={proj.revenue > proj.cost} />
            <FinRow label="Reputation Impact" value={`+${proj.reputationImpact} rep`} positive />
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 4 }}>Cost Breakdown</div>
              <div style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.6 }}>{proj.costBreakdown}</div>
            </div>
          </div>

          {/* Bonus / Fail logic */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--c-success)', background: 'var(--c-success-bg)' }}>
              <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-success)', marginBottom: 6 }}>Bonus Condition</div>
              <div style={{ fontSize: 13 }}>{proj.bonusCondition}</div>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--c-error)', background: 'var(--c-error-bg)' }}>
              <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-error)', marginBottom: 6 }}>Fail Condition</div>
              <div style={{ fontSize: 13 }}>{proj.failCondition}</div>
            </div>
          </div>

          <SmartPlayTip category="project" />
        </div>

        {/* Right: requirements + CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Requirements */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Requirements</div>
            <RequirementRow label="Min Reputation" met={meetsReputation}
              value={`${proj.minReputation} (you: ${gs.reputation})`} />
            <RequirementRow label={`Sales (${salesReq.count} ${salesReq.type})`} met={meetsSales}
              value={salesReq.type === 'specialist' ? `${salesDept.specialists} specialists` : `${salesDept.consultants} consultants`} />
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-text-muted)', marginBottom: 8 }}>Departments Needed</div>
              {proj.matchedDepartments.map((deptId) => {
                const d = departments.find((x) => x.id === deptId)
                const required = proj.requiredDepartments.includes(deptId)
                const met = d?.isActive
                return (
                  <div key={deptId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                    <span style={{ color: met ? 'var(--c-text)' : 'var(--c-text-muted)' }}>
                      {d?.icon} {d?.name ?? deptId}
                      {required && <span style={{ color: 'var(--c-primary)', marginLeft: 4 }}>*</span>}
                    </span>
                    <span style={{ color: met ? 'var(--c-success)' : 'var(--c-error)', fontWeight: 600 }}>
                      {met ? '✓' : '✗'}
                    </span>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 8 }}>* Required · others optional</div>
            </div>
          </div>

          {/* CTA buttons */}
          {!confirmed && !isAlreadyAccepted && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <button className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAccept}>
                ✓ Accept Project
              </button>
              <button className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleReject}>
                ✗ Reject Project
              </button>
            </div>
          )}

          {isAlreadyAccepted && !confirmed && (
            <div style={{ textAlign: 'center', padding: '12px', background: 'var(--c-success-bg)', borderRadius: 'var(--r-lg)', color: 'var(--c-success)', fontFamily: 'var(--f-heading)', fontWeight: 700 }}>
              ✓ Already Accepted
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FinRow({ label, value, positive, highlight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border)', fontSize: 14 }}>
      <span style={{ color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--f-heading)', fontWeight: highlight ? 800 : 700, color: positive ? 'var(--c-success)' : 'var(--c-text)' }}>{value}</span>
    </div>
  )
}

function RequirementRow({ label, met, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border)', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--c-text)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{value}</span>
        <span style={{ color: met ? 'var(--c-success)' : 'var(--c-error)', fontWeight: 700 }}>{met ? '✓' : '✗'}</span>
      </div>
    </div>
  )
}
