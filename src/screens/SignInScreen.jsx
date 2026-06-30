import React, { useState } from 'react'
import HNILogo from '../components/HNILogo.jsx'
import { login } from '../services/authClient.js'

/**
 * SignInScreen — username + password login.
 * Admin signs in with the admin credentials (default admin/admin); players sign
 * in with the account the admin created for them. Role comes back from the server.
 *
 * @prop {function} onSignedIn  – called with the account object on success
 */
export default function SignInScreen({ onSignedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setError(null); setBusy(true)
    try {
      const account = await login(username.trim(), password)
      onSignedIn?.(account)
    } catch (err) {
      setError(err.message || 'Sign in failed.')
      setBusy(false)
    }
  }

  return (
    <main className="app-main">
      <div className="screen" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 24, textAlign: 'center',
      }}>
        <HNILogo height={44} />

        <div>
          <span className="section-label" style={{ color: 'var(--c-primary)' }}>Business Simulation</span>
          <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, margin: '8px 0 6px', color: 'var(--c-rich-black)' }}>
            Sign in
          </h1>
          <p style={{ color: 'var(--c-text-muted)', maxWidth: 420, margin: '0 auto', lineHeight: 1.6 }}>
            Enter your username and password to play the HNI Way simulation.
          </p>
        </div>

        <form onSubmit={submit} style={{
          width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14,
          background: 'var(--c-surface)', border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-card)', padding: '28px 24px',
        }}>
          <label style={{ textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>
            Username
            <input
              autoFocus value={username} onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              style={inputStyle} placeholder="e.g. admin"
            />
          </label>
          <label style={{ textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--c-text)' }}>
            Password
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} placeholder="••••••••"
            />
          </label>

          {error && (
            <div role="alert" style={{
              fontSize: 13, color: '#b00020', background: '#fdecef',
              border: '1px solid #f3b9c4', borderRadius: 'var(--r-md)', padding: '8px 12px', textAlign: 'left',
            }}>{error}</div>
          )}

          <button type="submit" className="btn btn--primary btn--lg" disabled={busy} style={{ width: '100%', marginTop: 4 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--c-text-muted)', maxWidth: 360 }}>
          Players: ask your administrator for an account. Admins create player accounts from the dashboard.
        </p>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%', marginTop: 6, padding: '10px 12px',
  border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
  background: 'var(--c-bg)', color: 'var(--c-text)', fontSize: 14, fontFamily: 'var(--f-body)',
}
