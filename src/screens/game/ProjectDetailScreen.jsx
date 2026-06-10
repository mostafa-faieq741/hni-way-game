import React, { useState } from 'react'
import { renderStars } from '../../data/projects.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import { MAX_ACTIVE_PROJECTS } from '../../data/projectLifecycle.js'

export default function ProjectDetailScreen({
  project: proj, gs, onGoBack, onGoToSalesRequests,
  onAccept, onReject, onShowToast, isAlreadyActive = false,
}) {
  const [confirmed, setConfirmed] = useState(null)

  const isInActiveList = isAlreadyActive || gs.activeProjects.some((p) => p.id === proj.id)
  const isOverdue = isAlreadyActive && proj.status === 'overdue'

  const meetsReputation = gs.reputation >= (proj.minReputation || 0)
  const cantAfford = gs.cash < (proj.cost || 0)
  const atCap = gs.activeProjects.length >= MAX_ACTIVE_PROJECTS

  const handleAccept = () => {
    if (isInActiveList) { onShowToast('This project is already active.'); return }
    if (atCap) {
      onShowToast('You already have ' + MAX_ACTIVE_PROJECTS + ' active projects. Deliver some first.')
      return
    }
    if (cantAfford) {
      onShowToast('Need ' + proj.cost.toLocaleString() + ' Ħ cash to accept this project.')
      return
    }
    onAccept(proj)
    setConfirmed('accepted')
    onShowToast?.(proj.code + ' accepted! Cost paid: ' + proj.cost.toLocaleString() + ' Ħ.')
    setTimeout(() => onGoToSalesRequests?.(), 900)
  }

  const handleReject = () => {
    onReject(proj)
    setConfirmed('rejected')
    onShowToast?.('Project ' + proj.code + ' rejected.')
    setTimeout(() => onGoToSalesRequests?.(), 900)
  }

  return (
    <div>
      <TutorialOverlay
        screenId="project-detail"
        title="Project Brief"
        steps={[
          'Read the client brief carefully - it tells you which departments you will need.',
          'Accepting subtracts the project cost from your cash immediately.',
          'Requirements are checked at the planned end. Missing them makes the project overdue (-1 reputation per quarter, +10% extra cost).',
        ]}
      />

      <div style={{ display: 'flex', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)', flexWrap: 'wrap' }}>
        <button className="back-btn" onClick={onGoBack} style={{ marginBottom: 0 }}>Back to Home</button>
        {!isAlreadyActive && (
          <button className="back-btn" onClick={onGoToSalesRequests} style={{ marginBottom: 0 }}>Back to Sales Requests</button>
        )}
      </div>

      {confirmed === 'accepted' && (
        <div style={{ background: 'var(--c-success-bg)', border: '1px solid #a7d8bc', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>OK</span>
          <div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: 'var(--c-success)' }}>Project Accepted</div>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
              {proj.code} has been added to your active projects. Requirements will be checked when the planned duration ends.
            </div>
          </div>
        </div>
      )}
      {confirmed === 'rejected' && (
        <div style={{ background: 'var(--c-error-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r-lg)', padding: '16px 20px', marginBottom: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>X</span>
          <div>
            <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: 'var(--c-error)' }}>Project Rejected</div>
            <div style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>This brief has been declined and counted in your rejected total.</div>
          </div>
        </div>
      )}

      {!confirmed && !isAlreadyActive && (atCap || cantAfford || !meetsReputation) && (
        <div className="alert-box" style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="alert-box__text">
            <div className="alert-box__label">Heads up</div>
            {atCap && <div>You already have {MAX_ACTIVE_PROJECTS} active projects. Deliver some before accepting more.</div>}
            {cantAfford && <div>Project cost ({proj.cost.toLocaleString()} Ħ) exceeds current cash ({gs.cash.toLocaleString()} Ħ).</div>}
            {!meetsReputation && <div>Your reputation ({gs.reputation}) is below the recommended minimum ({proj.minReputation}). You can still accept, but delivery may slip.</div>}
            <div style={{ marginTop: 6, fontStyle: 'italic' }}>Requirements are checked when the project reaches its planned end quarter.</div>
          </div>
        </div>
      )}

      {isAlreadyActive && isOverdue && (
        <div className="alert-box" style={{ marginBottom: 'var(--sp-5)', borderLeftColor: 'var(--c-error)' }}>
          <div className="alert-box__text">
            <div className="alert-box__label" style={{ color: 'var(--c-error)' }}>Overdue</div>
            <div>This project has been overdue for {proj.overdueQuarters} quarter(s).</div>
            <div>Accumulated extra cost: {(proj.extraCosts || 0).toLocaleString()} Ħ.</div>
            <div>It will deliver as soon as your department meets its requirements.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--sp-6)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card card--accent">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <div>
                <div className="section-label">{proj.code}</div>
                <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0 8px' }}>
                  {proj.title}
                </h1>
                <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, letterSpacing: -1, color: 'var(--c-gold)' }}>{renderStars(proj.stars)}</span>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>{proj.durationQuarters} quarter(s)</span>
                  <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>- Min rep: {proj.minReputation}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 2 }}>Revenue</div>
                <div style={{ fontFamily: 'var(--f-heading)', fontSize: 28, fontWeight: 800, color: 'var(--c-success)' }}>
                  {proj.revenue.toLocaleString()} Ħ
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  Cost: {proj.cost.toLocaleString()} Ħ - Rep: +{proj.reputationImpact}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>Client Brief</div>
            <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7 }}>{proj.brief || proj.clientBrief}</p>
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 12, fontStyle: 'italic' }}>
              Read carefully and infer which departments and capacity you will need.
            </p>
          </div>

          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Financial Overview</div>
            <FinRow label="Revenue" value={'' + proj.revenue.toLocaleString() + ' Ħ'} positive />
            <FinRow label="Project Cost" value={'' + proj.cost.toLocaleString() + ' Ħ'} />
            <FinRow label="Gross Profit" value={'' + (proj.revenue - proj.cost).toLocaleString() + ' Ħ'} highlight positive={proj.revenue > proj.cost} />
            <FinRow label="Reputation Impact" value={'+' + proj.reputationImpact + ' rep'} positive />
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--c-border)' }}>
              <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 4 }}>Cost Breakdown</div>
              <div style={{ fontSize: 13, color: 'var(--c-text)', lineHeight: 1.6 }}>{proj.costBreakdown}</div>
            </div>
          </div>

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>At a Glance</div>
            <RequirementRow label="Min Reputation" met={meetsReputation} value={proj.minReputation + ' (you: ' + gs.reputation + ')'} />
            <RequirementRow label="Cost vs Cash" met={!cantAfford} value={'' + proj.cost.toLocaleString() + ' Ħ / Hanoon ' + gs.cash.toLocaleString()} />
            <RequirementRow label="Active project slots" met={!atCap} value={gs.activeProjects.length + '/' + MAX_ACTIVE_PROJECTS} />
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 12, lineHeight: 1.5 }}>
              Required departments are not shown - read the brief and decide which departments to staff.
            </p>
          </div>

          {!confirmed && !isInActiveList && (
            <div className="card" style={{ borderLeft: '4px solid var(--c-primary)' }}>
              <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>If you accept</div>
              <FinRow label="Cash now" value={'' + gs.cash.toLocaleString() + ' Ħ'} />
              <FinRow label="Upfront cost" value={'-' + proj.cost.toLocaleString() + ' Ħ'} />
              <FinRow label="Cash after accepting" value={'' + (gs.cash - proj.cost).toLocaleString() + ' Ħ'} highlight positive={gs.cash - proj.cost >= 0} />
              <FinRow label="Revenue on delivery" value={'+' + proj.revenue.toLocaleString() + ' Ħ'} positive />
              <FinRow label="Reputation on delivery" value={'+' + proj.reputationImpact} positive />
              <FinRow label="Pipeline slots" value={(gs.activeProjects.length + 1) + '/' + MAX_ACTIVE_PROJECTS} />
              <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 10, lineHeight: 1.5 }}>
                Cost is paid now; revenue and reputation arrive only when the project delivers - and only if your department meets its (hidden) requirements by the planned end.
              </p>
            </div>
          )}

          {!confirmed && !isInActiveList && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <button
                className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', ...((atCap || cantAfford) ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                onClick={handleAccept}
                disabled={atCap || cantAfford}
              >
                Accept Project
              </button>
              {(atCap || cantAfford) && (
                <div className="accept-blocker">
                  {cantAfford && <div>Not enough cash - this brief needs {proj.cost.toLocaleString()} Ħ upfront and you have {gs.cash.toLocaleString()} Ħ.</div>}
                  {atCap && <div>Pipeline full ({MAX_ACTIVE_PROJECTS}/{MAX_ACTIVE_PROJECTS}). Deliver a project before taking another.</div>}
                </div>
              )}
              <button className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleReject}>
                Reject Project
              </button>
            </div>
          )}

          {isInActiveList && !confirmed && (
            <div style={{ textAlign: 'center', padding: '12px', background: 'var(--c-success-bg)', borderRadius: 'var(--r-lg)', color: 'var(--c-success)', fontFamily: 'var(--f-heading)', fontWeight: 700 }}>
              Already Active
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
        <span style={{ color: met ? 'var(--c-success)' : 'var(--c-error)', fontWeight: 700 }}>{met ? 'OK' : '!'}</span>
      </div>
    </div>
  )
}
