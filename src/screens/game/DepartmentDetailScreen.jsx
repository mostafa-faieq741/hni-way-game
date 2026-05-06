/**
 * DepartmentDetailScreen.jsx
 * Shows full department info + staffing controls (Hire / Fire / Transfer).
 */

import React, { useState } from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function DepartmentDetailScreen({ dept, gs, onUpdateDept, onGoBack, onShowToast }) {
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferType, setTransferType] = useState('specialist')
  const [transferTarget, setTransferTarget] = useState('')

  // Get current staffing from gs
  const staffing = gs.departments.find((d) => d.id === dept.id) ?? { specialists: 0, consultants: 0 }
  const { specialists, consultants } = staffing
  const totalStaff = specialists + consultants

  const activeDepts = gs.departments
    .filter((d) => d.id !== dept.id && (d.specialists + d.consultants) > 0)

  const handleHireSpecialist = () => {
    onUpdateDept(dept.id, { specialists: specialists + 1 })
    onShowToast(`✅ Specialist hired in ${dept.name}. Costs $${GAME_CONFIG.specialistCostPerQuarter.toLocaleString()}/quarter.`)
  }

  const handleFireSpecialist = () => {
    if (specialists === 0) { onShowToast('No specialists to fire.'); return }
    onUpdateDept(dept.id, { specialists: specialists - 1 })
    onShowToast(`⚠️ Specialist fired from ${dept.name}. Firing will affect reputation in the final game logic.`)
  }

  const handleHireConsultant = () => {
    onUpdateDept(dept.id, { consultants: consultants + 1 })
    onShowToast(`✅ Consultant hired in ${dept.name}. Costs $${GAME_CONFIG.consultantCostPerQuarter.toLocaleString()}/quarter.`)
  }

  const handleFireConsultant = () => {
    if (consultants === 0) { onShowToast('No consultants to fire.'); return }
    onUpdateDept(dept.id, { consultants: consultants - 1 })
    onShowToast(`⚠️ Consultant fired from ${dept.name}. Firing will affect reputation in the final game logic.`)
  }

  const handleTransferSubmit = () => {
    if (!transferTarget) { onShowToast('Please select a department.'); return }
    onShowToast(`↔ Transfer requested: ${transferType} from ${dept.name} → ${transferTarget}. Transfer logic will be fully implemented in a future update.`)
    setShowTransfer(false)
    setTransferTarget('')
  }

  return (
    <div>
      {/* Back button */}
      <button className="back-btn" onClick={onGoBack}>
        ← Back to Home
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)', flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-lg)',
          background: `${dept.color}18`,
          border: `2px solid ${dept.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>
          {dept.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="section-label" style={{ color: dept.color }}>Department</div>
          <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>
            {dept.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--c-text-muted)', maxWidth: 600 }}>{dept.description}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--sp-6)', alignItems: 'start' }}>
        {/* Left: department details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Department Profile</div>
            <InfoRow label="Activate When"      value={dept.activateWhen} />
            <InfoRow label="Team Needed"         value={dept.teamNeeded} />
            <InfoRow label="Cost to Grow"        value={dept.costToGrow} />
            <InfoRow label="What It Adds"        value={dept.whatItAdds} />
            <InfoRow label="What It Needs"       value={dept.whatItNeeds} />
            <InfoRow label="Budget Focus"        value={dept.budgetFocus} />
            <InfoRow label="Finance Needs"       value={dept.financeNeeds} />
          </div>

          <div className="card" style={{ borderLeft: `4px solid var(--c-gold)`, background: 'var(--c-gold-lt)' }}>
            <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a6900', marginBottom: 6 }}>
              Quick Decision Tip
            </div>
            <div style={{ fontSize: 14, color: 'var(--c-dark-grey)', lineHeight: 1.6 }}>{dept.quickTip}</div>
          </div>

          <SmartPlayTip category="department" />
        </div>

        {/* Right: staffing controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Current staffing */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Current Staffing</div>
            <StaffRow
              label="Specialists"
              count={specialists}
              costLabel={`$${GAME_CONFIG.specialistCostPerQuarter.toLocaleString()}/qtr each`}
              onHire={handleHireSpecialist}
              onFire={handleFireSpecialist}
            />
            <div style={{ height: 1, background: 'var(--c-border)', margin: '12px 0' }} />
            <StaffRow
              label="Consultants"
              count={consultants}
              costLabel={`$${GAME_CONFIG.consultantCostPerQuarter.toLocaleString()}/qtr each`}
              onHire={handleHireConsultant}
              onFire={handleFireConsultant}
            />
            <div style={{ marginTop: 16, padding: '10px 0', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>Total staff</span>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700 }}>{totalStaff}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>Quarterly cost</span>
              <span style={{ fontFamily: 'var(--f-heading)', fontWeight: 700, color: 'var(--c-primary)' }}>
                ${(specialists * GAME_CONFIG.specialistCostPerQuarter + consultants * GAME_CONFIG.consultantCostPerQuarter).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Transfer */}
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>Transfer Employee</div>
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 'var(--sp-3)' }}>
              Move an employee to another department at no cost.
            </p>
            {!showTransfer ? (
              <button className="btn btn--ghost btn--sm" style={{ width: '100%' }} onClick={() => setShowTransfer(true)}
                disabled={totalStaff === 0}>
                Open Transfer
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select value={transferType} onChange={(e) => setTransferType(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--c-border-dk)', fontFamily: 'var(--f-body)', fontSize: 13 }}>
                  {specialists > 0 && <option value="specialist">Specialist</option>}
                  {consultants > 0 && <option value="consultant">Consultant</option>}
                </select>
                <select value={transferTarget} onChange={(e) => setTransferTarget(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--c-border-dk)', fontFamily: 'var(--f-body)', fontSize: 13 }}>
                  <option value="">— Select department —</option>
                  {activeDepts.map((d) => (
                    <option key={d.id} value={d.id}>{d.id}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={handleTransferSubmit}>Transfer</button>
                  <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={() => setShowTransfer(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--c-error-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--c-error)' }}>
            ⚠️ Firing will affect reputation in the final game logic.
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
      <span style={{ fontFamily: 'var(--f-heading)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--c-text)' }}>{value}</span>
    </div>
  )
}

function StaffRow({ label, count, costLabel, onHire, onFire }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'var(--f-heading)', fontSize: 20, fontWeight: 800, color: 'var(--c-primary)' }}>{count}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 8 }}>{costLabel}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={onHire}>+ Hire</button>
        <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={onFire} disabled={count === 0}>- Fire</button>
      </div>
    </div>
  )
}
