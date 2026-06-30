import React, { useEffect, useState } from 'react'
import { listUsers, createUser, deleteUser } from '../../services/authClient.js'

const inputStyle = {
  width: '100%', marginTop: 6, padding: '9px 12px',
  border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
  background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: 14, fontFamily: 'var(--f-body)',
}
const blank = { username: '', password: '', displayName: '', email: '' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [form, setForm] = useState(blank)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)

  const refresh = async () => {
    setLoading(true); setLoadError(null)
    try { setUsers(await listUsers()) }
    catch (e) { setLoadError(e.message || 'Could not load users.') }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setErrors({}); setNotice(null); setBusy(true)
    try {
      const user = await createUser({
        username: form.username.trim(), password: form.password,
        displayName: form.displayName.trim() || form.username.trim(), email: form.email.trim() || null,
      })
      setNotice('Created account for ' + (user.display_name || user.username) + '.')
      setForm(blank)
      refresh()
    } catch (e) {
      if (e.errors) setErrors(e.errors)
      else setErrors({ _: e.message || 'Could not create user.' })
    } finally { setBusy(false) }
  }

  const remove = async (u) => {
    if (!window.confirm('Delete account "' + (u.display_name || u.username) + '"? Their saved game and leaderboard entry stay unless removed separately.')) return
    try { await deleteUser(u.player_id); refresh() }
    catch (e) { setLoadError(e.message || 'Could not delete user.') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <div>
        <span className="section-label" style={{ color: 'var(--c-primary)' }}>Accounts</span>
        <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 26, fontWeight: 800, margin: '6px 0 0' }}>Add User</h1>
        <p style={{ color: 'var(--c-text-muted)', fontSize: 13, marginTop: 4 }}>
          Create player accounts. Players sign in with the username and password you set here.
        </p>
      </div>

      {/* Create form */}
      <form onSubmit={submit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
        <div className="game-section-title">New player account</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 200, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>
            Username *
            <input value={form.username} onChange={(e) => set('username', e.target.value)}
              autoCapitalize="none" autoCorrect="off" spellCheck={false} style={inputStyle} placeholder="e.g. sara" />
            {errors.username && <FieldError msg={errors.username} />}
          </label>
          <label style={{ flex: 1, minWidth: 200, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>
            Password *
            <input value={form.password} onChange={(e) => set('password', e.target.value)}
              style={inputStyle} placeholder="at least 4 characters" />
            {errors.password && <FieldError msg={errors.password} />}
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ flex: 1, minWidth: 200, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>
            Display name
            <input value={form.displayName} onChange={(e) => set('displayName', e.target.value)}
              style={inputStyle} placeholder="shown on the leaderboard" />
          </label>
          <label style={{ flex: 1, minWidth: 200, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>
            Email (optional)
            <input value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} placeholder="name@company.com" />
          </label>
        </div>
        {errors._ && <FieldError msg={errors._} />}
        {notice && <div style={{ fontSize: 13, color: '#1a5c36', background: '#f0f9f4', border: '1px solid #a7d8bc', borderRadius: 'var(--r-md)', padding: '8px 12px' }}>{notice}</div>}
        <div>
          <button type="submit" className="btn btn--primary btn--md" disabled={busy}>{busy ? 'Creating…' : '+ Create account'}</button>
        </div>
      </form>

      {/* Users list */}
      <div className="card">
        <div className="game-section-title" style={{ marginBottom: 12 }}>Player accounts {users.length ? '(' + users.length + ')' : ''}</div>
        {loading ? <p style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>Loading…</p>
          : loadError ? <p style={{ color: '#b00020', fontSize: 14 }}>{loadError}</p>
          : users.length === 0 ? <p style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>No player accounts yet. Create one above.</p>
          : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 520 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--c-text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '8px 10px' }}>Username</th>
                  <th style={{ padding: '8px 10px' }}>Display name</th>
                  <th style={{ padding: '8px 10px' }}>Email</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.player_id} style={{ borderTop: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{u.username}</td>
                    <td style={{ padding: '10px' }}>{u.display_name}</td>
                    <td style={{ padding: '10px', color: 'var(--c-text-muted)' }}>{u.email || '—'}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button className="btn btn--secondary btn--sm" onClick={() => remove(u)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function FieldError({ msg }) {
  return <div style={{ fontSize: 12, color: '#b00020', marginTop: 4 }}>{msg}</div>
}
