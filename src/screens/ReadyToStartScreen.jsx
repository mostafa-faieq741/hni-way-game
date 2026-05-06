import React from 'react'
import Button from '../components/Button.jsx'

/**
 * ReadyToStartScreen
 * ─────────────────────────────────────────────────
 * Placeholder after pre-game onboarding is complete.
 * Actual game screens will be added here in future phases.
 *
 * @prop {function} onFinish – called when "Finish" is clicked
 */
export default function ReadyToStartScreen({ onFinish }) {
  return (
    <main className="app-main">
      <div className="ready-screen screen">
        {/* Decorative circle */}
        <div className="ready-screen__deco" aria-hidden="true" />

        <div className="ready-screen__inner">
          {/* Checkmark */}
          <div className="ready-check" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <polyline
                points="20 6 9 17 4 12"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="ready-screen__title">Ready to Start</h1>

          {/* Description */}
          <p className="ready-screen__text">
            You have completed the introduction.
            The simulation screens will continue from here.
          </p>

          {/* Summary badge */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginTop: 8,
            }}
          >
            {['Overview', 'Key Terms', 'Setup', 'Turn Flow'].map((item) => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 14px',
                  borderRadius: 9999,
                  background: '#e8f4ed',
                  border: '1px solid #a7d8bc',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'var(--f-heading)',
                  color: '#0c6e3a',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polyline
                    points="10 3 5 9 2 6"
                    stroke="#0c6e3a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item}
              </span>
            ))}
          </div>

          {/* Setup summary strip */}
          <div
            style={{
              background: 'var(--c-bg)',
              border: '1px solid var(--c-border)',
              borderRadius: 'var(--r-lg)',
              padding: '16px 24px',
              width: '100%',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
            }}
          >
            {[
              { label: 'Starting Cash', value: '$100,000' },
              { label: 'Starting Hires', value: '1 L&D + 1 Sales' },
              { label: 'Quarters', value: '20 total' },
              { label: 'Win Condition', value: 'Rep > 100' },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--f-heading)', fontWeight: 800, fontSize: 16, color: 'var(--c-primary)' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', fontFamily: 'var(--f-heading)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            variant="primary"
            size="lg"
            onClick={onFinish}
          >
            Continue to Player Setup →
          </Button>
        </div>
      </div>
    </main>
  )
}
