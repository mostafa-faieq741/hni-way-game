/**
 * HireModal.jsx
 * Hire dialog launched from Home. Pick a department + type and confirm.
 * Enforces HR-first rule: cannot hire into non-HR departments until at
 * least one HR employee has been hired.
 */

import React, { useState } from 'react'
import { DEPARTMENTS_DATA } from '../data/departments.js'
import { GAME_CONFIG } from '../data/gameConfig.js'

export function getHrGate(gs) {
  const hr = gs.departments.find((d) => d.id === 'hr')
  const hrStaff = (hr?.specialists || 0) + (hr?.consultants || 0)
  return { hasHr: hrStaff > 0 }
}

export default function HireModal({ open, onClose, gs, onHire, onShowToast }) {
  const [deptId, setDeptId] = useState(DEPARTMENTS_DATA[0].id)
  const [type, setType] = useState('specialist')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const dept = DEPARTMENTS_DATA.find((d) => d.id === deptId) || DEPARTMENTS_DATA[0]
  const cost = type === 'specialist'
    ? GAME_CONFIG.specialistCostPerQuarter
    : GAME_CONFIG.consultantCostPerQuarter

  const { hasHr } = getHrGate(gs)
  const hrBlocked = !hasHr && deptId !== 'hr'

  const handleStart = () => {
    setError('')
    if (hrBlocked) {
      setError('You need to hire an HR first before hiring people for other departments.')
      return
    }
    setConfirming(true)
  }

  const handleConfirm = () => {
    onHire(deptId, type)
    onShowToast?.((type === 'specialist' ? 'Specialist' : 'Consultant') + ' hired in ' + dept.name + '.')
    setConfirming(false)
    onClose()
  }

  return (
    <>
      <div className="hire-overlay" onClick={onClose} />

      <div className="hire-modal" role="dialog" aria-modal="true" aria-label="Hire an employee">
        <div className="hire-modal__head">
          <div>
            <div className="section-label" style={{ color: 'var(--c-primary)' }}>Hiring</div>
            <h2 className="hire-modal__title">Hire an Employee</h2>
            <p className="hire-modal__sub">
              Pick a department and an employee type. Inactive departments will activate as soon as you hire.
            </p>
          </div>
          <button className="hire-modal__close" onClick={onClose} aria-label="Close hire dialog">x</button>
        </div>

        <div className="hire-modal__body">
          {!hasHr && (
            <div style={{
              background: 'var(--c-error-bg)',
              border: '1px solid #fca5a5',
              color: 'var(--c-error)',
              padding: '10px 12px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
            }}>
              You have no HR staff yet. The first hire must be an <strong>HR</strong> employee.
              Other departments are locked until HR is staffed.
            </div>
          )}

          <div className="hire-field">
            <label className="hire-field__label">Department</label>
            <select
              value={deptId}
              onChange={(e) => { setDeptId(e.target.value); setError('') }}
              className="hire-field__select"
            >
              {DEPARTMENTS_DATA.map((d) => {
                const staff = gs.departments.find((s) => s.id === d.id) || { specialists: 0, consultants: 0 }
                const total = staff.specialists + staff.consultants
                const locked = !hasHr && d.id !== 'hr'
                return (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.name}{total === 0 ? ' (inactive)' : ' (' + total + ' staff)'}{locked ? ' - locked until HR' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="hire-field">
            <label className="hire-field__label">Employee type</label>
            <div className="hire-type-row">
              <button
                type="button"
                className={'hire-type-btn' + (type === 'specialist' ? ' hire-type-btn--active' : '')}
                onClick={() => setType('specialist')}
              >
                <div className="hire-type-btn__title">Specialist</div>
                <div className="hire-type-btn__cost">${GAME_CONFIG.specialistCostPerQuarter.toLocaleString()}/qtr</div>
                <div className="hire-type-btn__hint">Handles 2 active projects</div>
              </button>
              <button
                type="button"
                className={'hire-type-btn' + (type === 'consultant' ? ' hire-type-btn--active' : '')}
                onClick={() => setType('consultant')}
              >
                <div className="hire-type-btn__title">Consultant</div>
                <div className="hire-type-btn__cost">${GAME_CONFIG.consultantCostPerQuarter.toLocaleString()}/qtr</div>
                <div className="hire-type-btn__hint">Handles 4 active projects</div>
              </button>
            </div>
          </div>

          <div className="hire-summary">
            <span>Hiring 1 {type} for {dept.name}.</span>
            <strong>+${cost.toLocaleString()} fixed expenses/quarter</strong>
          </div>

          {error && (
            <div style={{ color: 'var(--c-error)', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}
        </div>

        <div className="hire-modal__actions">
          <button className="btn btn--secondary btn--md" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary btn--md"
            onClick={handleStart}
            disabled={hrBlocked}
            style={hrBlocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            Hire {type === 'specialist' ? 'Specialist' : 'Consultant'}
          </button>
        </div>
      </div>

      {confirming && (
        <>
          <div className="confirm-overlay" onClick={() => setConfirming(false)} />
          <div className="confirm-modal" role="dialog" aria-modal="true">
            <div className="confirm-modal__title">Confirm hire</div>
            <div className="confirm-modal__body">
              Are you sure you want to hire 1 {type} for <strong>{dept.name}</strong>?
              This will add <strong>${cost.toLocaleString()}/quarter</strong> in fixed expenses.
            </div>
            <div className="confirm-modal__actions">
              <button className="btn btn--secondary btn--md" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn--primary btn--md" onClick={handleConfirm}>Yes, hire</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
