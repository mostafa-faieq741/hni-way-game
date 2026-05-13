import React, { useState } from 'react'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'
import { DEPARTMENTS_DATA } from '../../data/departments.js'
import ConfirmDialog from '../../components/ConfirmDialog.jsx'
import { getHrGate } from '../../components/HireModal.jsx'

export default function DepartmentDetailScreen({ dept, gs, onHire, onFire, onTransfer, onGoBack, onShowToast }) {
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferType, setTransferType] = useState('specialist')
  const [transferTarget, setTransferTarget] = useState('')
  const [confirm, setConfirm] = useState(null) // { title, body, run }

  const staffing = gs.departments.find((d) => d.id === dept.id) || { specialists: 0, consultants: 0 }
  const specialists = staffing.specialists
  const consultants = staffing.consultants
  const totalStaff = specialists + consultants
  const otherDepts = DEPARTMENTS_DATA.filter((d) => d.id !== dept.id)
  const { hasHr } = getHrGate(gs)

  const askConfirm = (cfg) => setConfirm(cfg)
  const runConfirm = () => {
    if (!confirm) return
    confirm.run()
    setConfirm(null)
  }

  const doHire = (type) => {
    if (!hasHr && dept.id !== 'hr') {
      onShowToast('You need to hire an HR first before hiring people for other departments.')
      return
    }
    const cost = type === 'specialist' ? GAME_CONFIG.specialistCostPerQuarter : GAME_CONFIG.consultantCostPerQuarter
    askConfirm({
      title: 'Confirm hire',
      body: 'Are you sure you want to hire 1 ' + type + ' for ' + dept.name + '? This will add $' + cost.toLocaleString() + '/quarter in fixed expenses.',
      confirmLabel: 'Yes, hire',
      tone: 'primary',
      run: () => { onHire(dept.id, type); onShowToast((type === 'specialist' ? 'Specialist' : 'Consultant') + ' hired in ' + dept.name + '.') },
    })
  }

  const doFire = (type) => {
    askConfirm({
      title: 'Confirm fire',
      body: 'Are you sure you want to fire 1 ' + type + ' from ' + dept.name + '? Firing reduces your reputation by 1.',
      confirmLabel: 'Yes, fire',
      tone: 'danger',
      run: () => { onFire(dept.id, type); onShowToast((type === 'specialist' ? 'Specialist' : 'Consultant') + ' fired from ' + dept.name + '.') },
    })
  }

  const handleSubmitTransfer = () => {
    if (!transferTarget) { onShowToast('Please select a destination department.'); return }
    if ((transferType === 'specialist' && specialists === 0) ||
        (transferType === 'consultant' && consultants === 0)) {
      onShowToast('No ' + transferType + 's in ' + dept.name + ' to transfer.'); return
    }
    const targetName = DEPARTMENTS_DATA.find((d) => d.id === transferTarget)?.name || transferTarget
    askConfirm({
      title: 'Confirm transfer',
      body: 'Are you sure you want to transfer 1 ' + transferType + ' from ' + dept.name + ' to ' + targetName + '?',
      confirmLabel: 'Yes, transfer',
      tone: 'primary',
      run: () => {
        onTransfer(dept.id, transferType, transferTarget)
        setShowTransfer(false)
        setTransferTarget('')
      },
    })
  }

  return (
    <div>
      <button className="back-btn" onClick={onGoBack}>Back to Home</button>

      <TutorialOverlay
        screenId="dept-detail"
        title="Department"
        steps={[
          'Hiring adds an employee and increases your fixed expenses each quarter.',
          'You will be asked to confirm every hire, fire, and transfer.',
          'Firing reduces your reputation by 1 per employee - fire only when necessary.',
        ]}
      />

      <SmartPlayTip category="department" />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-4)', margin: 'var(--sp-4) 0 var(--sp-6)', flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 'var(--r-lg)',
          background: dept.color + '18', border: '2px solid ' + dept.color + '40',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>
          {dept.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="section-label" style={{ color: dept.color }}>Department</div>
          <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, color: 'var(--c-text)', margin: '4px 0' }}>{dept.name}</h1>
          <p style={{ fontSize: 14, color: 'var(--c-text-muted)', maxWidth: 600 }}>{dept.description}</p>
        </div>
      </div>

      {!hasHr && dept.id !== 'hr' && (
        <div style={{
          background: 'var(--c-error-bg)', border: '1px solid #fca5a5',
          color: 'var(--c-error)', padding: '10px 14px', borderRadius: 'var(--r-md)',
          fontSize: 13, marginBottom: 'var(--sp-4)',
        }}>
          You need to hire an HR first before hiring people for other departments.
          Go to the HR department to make the first HR hire.
        </div>
      )}

      <div className="dept-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Department Profile</div>
            <InfoRow label="Activate When" value={dept.activateWhen} />
            <InfoRow label="Team Needed" value={dept.teamNeeded} />
            <InfoRow label="Cost to Grow" value={dept.costToGrow} />
            <InfoRow label="What It Adds" value={dept.whatItAdds} />
            <InfoRow label="What It Needs" value={dept.whatItNeeds} />
            <InfoRow label="Budget Focus" value={dept.budgetFocus} />
            <InfoRow label="Finance Needs" value={dept.financeNeeds} />
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--c-gold)', background: 'var(--c-gold-lt)' }}>
            <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a6900', marginBottom: 6 }}>Quick Decision Tip</div>
            <div style={{ fontSize: 14, color: 'var(--c-dark-grey)', lineHeight: 1.6 }}>{dept.quickTip}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-4)' }}>Current Staffing</div>
            <StaffRow
              label="Specialists"
              count={specialists}
              costLabel={'$' + GAME_CONFIG.specialistCostPerQuarter.toLocaleString() + '/qtr each'}
              onHire={() => doHire('specialist')}
              onFire={() => doFire('specialist')}
              hireDisabled={!hasHr && dept.id !== 'hr'}
            />
            <div style={{ height: 1, background: 'var(--c-border)', margin: '12px 0' }} />
            <StaffRow
              label="Consultants"
              count={consultants}
              costLabel={'$' + GAME_CONFIG.consultantCostPerQuarter.toLocaleString() + '/qtr each'}
              onHire={() => doHire('consultant')}
              onFire={() => doFire('consultant')}
              hireDisabled={!hasHr && dept.id !== 'hr'}
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

          <div className="card">
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-3)' }}>Transfer Employee</div>
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 'var(--sp-3)' }}>
              Move an employee to another department. Free of charge.
            </p>
            {!showTransfer ? (
              <button
                className="btn btn--ghost btn--sm"
                style={{ width: '100%' }}
                onClick={() => setShowTransfer(true)}
                disabled={totalStaff === 0}
              >
                Open Transfer
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--c-border-dk)', fontFamily: 'var(--f-body)', fontSize: 13 }}
                >
                  {specialists > 0 && <option value="specialist">Specialist</option>}
                  {consultants > 0 && <option value="consultant">Consultant</option>}
                </select>
                <select
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--c-border-dk)', fontFamily: 'var(--f-body)', fontSize: 13 }}
                >
                  <option value="">Select destination department</option>
                  {otherDepts.map((d) => (
                    <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn--primary btn--sm" style={{ flex: 1 }} onClick={handleSubmitTransfer}>Transfer</button>
                  <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={() => { setShowTransfer(false); setTransferTarget('') }}>Cancel</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '10px 14px', background: 'var(--c-error-bg)', border: '1px solid #fca5a5', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--c-error)' }}>
            Firing reduces reputation by 1 per employee.
          </div>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          body={confirm.body}
          confirmLabel={confirm.confirmLabel}
          tone={confirm.tone}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
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

function StaffRow({ label, count, costLabel, onHire, onFire, hireDisabled }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--f-heading)', fontSize: 13, fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'var(--f-heading)', fontSize: 20, fontWeight: 800, color: 'var(--c-primary)' }}>{count}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 8 }}>{costLabel}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn--primary btn--sm" style={{ flex: 1, opacity: hireDisabled ? 0.5 : 1 }} onClick={onHire} disabled={hireDisabled}>+ Hire</button>
        <button className="btn btn--secondary btn--sm" style={{ flex: 1 }} onClick={onFire} disabled={count === 0}>- Fire</button>
      </div>
    </div>
  )
}
