import React from 'react'
import HNILogo from '../components/HNILogo.jsx'

/**
 * SignInScreen
 * Entry screen. Two roles (no password — prototype):
 *  - player → the simulation (existing onboarding flow)
 *  - admin  → the dashboard & statistics only
 */
function RoleCard({ icon, title, desc, cta, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, minWidth: 220, maxWidth: 260,
        background: 'var(--c-surface)', border: '1px solid var(--c-border)',
        borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-card)',
        padding: '28px 24px', cursor: 'pointer', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        transition: 'transform 120ms ease, border-color 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--c-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--c-border)' }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'var(--c-primary-lt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-primary)',
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 18, color: 'var(--c-text)' }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{desc}</div>
      <span className="btn btn--primary btn--md" style={{ marginTop: 8, pointerEvents: 'none' }}>{cta}</span>
    </button>
  )
}

export default function SignInScreen({ onSelectRole }) {
  return (
    <main className="app-main">
      <div className="screen" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 28, textAlign: 'center',
      }}>
        <HNILogo height={44} />

        <div>
          <span className="section-label" style={{ color: 'var(--c-primary)' }}>Business Simulation</span>
          <h1 style={{ fontFamily: 'var(--f-heading)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, margin: '8px 0 6px', color: 'var(--c-rich-black)' }}>
            Sign in
          </h1>
          <p style={{ color: 'var(--c-text-muted)', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
            Choose how you want to enter the HNI Way simulation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: 580 }}>
          <RoleCard
            title="Player"
            desc="Play the simulation from the start and build your company."
            cta="Enter as Player"
            onClick={() => onSelectRole('player')}
            icon={(
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          />
          <RoleCard
            title="Admin"
            desc="View the dashboard and player statistics only."
            cta="Enter as Admin"
            onClick={() => onSelectRole('admin')}
            icon={(
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
          />
        </div>
      </div>
    </main>
  )
}
