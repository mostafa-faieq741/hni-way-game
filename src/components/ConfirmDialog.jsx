/**
 * ConfirmDialog.jsx
 * Reusable yes/no confirmation modal.
 * Usage:
 *   <ConfirmDialog
 *     open={openFlag}
 *     title="Confirm"
 *     body="Are you sure?"
 *     confirmLabel="Yes"
 *     cancelLabel="No"
 *     onConfirm={() => ...}
 *     onCancel={() => ...}
 *   />
 */

import React from 'react'

export default function ConfirmDialog({
  open, title = 'Confirm', body, confirmLabel = 'Yes', cancelLabel = 'Cancel',
  onConfirm, onCancel, tone = 'primary',
}) {
  if (!open) return null
  return (
    <>
      <div className="confirm-overlay" onClick={onCancel} />
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="confirm-modal__title">{title}</div>
        {body && <div className="confirm-modal__body">{body}</div>}
        <div className="confirm-modal__actions">
          <button className="btn btn--secondary btn--md" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={'btn btn--' + (tone === 'danger' ? 'secondary' : 'primary') + ' btn--md'}
            style={tone === 'danger' ? { background: 'var(--c-error)', color: '#fff', borderColor: 'var(--c-error)' } : {}}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}
