/**
 * ForecastScreen.jsx
 * Paid power-up: buy once per year for $15,000 to reveal trend insights.
 */

import React, { useState } from 'react'
import { FORECAST_TRENDS, YEAR_SIGNALS } from '../../data/forecastData.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'

export default function ForecastScreen({ gs, onUpdateGs, onShowToast }) {
  const [activeTrendId, setActiveTrendId] = useState(null)

  const alreadyPurchased = !!gs.forecastPurchasedByYear?.[gs.currentYear]
  const canAfford = gs.cash >= GAME_CONFIG.forecastCostPerYear
  const yearSignal = YEAR_SIGNALS[gs.currentYear] ?? YEAR_SIGNALS[1]
  const activeTrend = FORECAST_TRENDS.find((t) => t.id === activeTrendId)

  const handleBuy = () => {
    if (!canAfford) {
      onShowToast('❌ Not enough cash to buy Forecast.')
      return
    }
    onUpdateGs({
      cash: gs.cash - GAME_CONFIG.forecastCostPerYear,
      totalCosts: gs.totalCosts + GAME_CONFIG.forecastCostPerYear,
      forecastPurchasedByYear: {
        ...gs.forecastPurchasedByYear,
        [gs.currentYear]: true,
      },
    })
    onShowToast('✅ Forecast purchased! Insights are now unlocked for this year.')
  }

  return (
    <div>
      {/* Header card */}
      <div className="card card--accent" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div>
            <div className="section-label">Year {gs.currentYear} Forecast</div>
            <h2 style={{ fontFamily: 'var(--f-heading)', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', marginTop: 4 }}>
              {yearSignal.headline}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--c-text-muted)', marginTop: 8, maxWidth: 540 }}>
              {alreadyPurchased ? yearSignal.signal : 'Purchase the Forecast to unlock trend insights and strategic signals for this year.'}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {!alreadyPurchased ? (
              <div>
                <div style={{ fontFamily: 'var(--f-heading)', fontSize: 24, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 8 }}>
                  ${GAME_CONFIG.forecastCostPerYear.toLocaleString()}
                </div>
                <button
                  className={`btn btn--primary btn--md`}
                  onClick={handleBuy}
                  disabled={!canAfford}
                  style={{ opacity: canAfford ? 1 : 0.5 }}
                >
                  {canAfford ? 'Buy Forecast' : 'Insufficient Cash'}
                </button>
                {!canAfford && (
                  <div style={{ fontSize: 12, color: 'var(--c-error)', marginTop: 6 }}>
                    You need ${(GAME_CONFIG.forecastCostPerYear - gs.cash).toLocaleString()} more cash.
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: 'var(--c-success-bg)',
                  border: '1px solid #a7d8bc',
                  borderRadius: 'var(--r-full)',
                  padding: '6px 14px',
                  fontFamily: 'var(--f-heading)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--c-success)',
                }}>
                  ✓ Purchased — Year {gs.currentYear}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Locked state */}
      {!alreadyPurchased && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ fontFamily: 'var(--f-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Forecast Locked
          </div>
          <div style={{ fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
            Purchase the Forecast for ${GAME_CONFIG.forecastCostPerYear.toLocaleString()} to reveal this year's market signals and strategic advantage.
          </div>
        </div>
      )}

      {/* Unlocked content */}
      {alreadyPurchased && (
        <>
          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <div className="game-section-title" style={{ marginBottom: 'var(--sp-2)' }}>
              This Year's Market Trends
            </div>
            <p style={{ fontSize: 13, color: 'var(--c-text-muted)' }}>
              Click a trend card to see the full insight and recommendations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
            {FORECAST_TRENDS.map((trend) => (
              <div
                key={trend.id}
                className={`forecast-card${activeTrendId === trend.id ? ' forecast-card--active' : ''}`}
                onClick={() => setActiveTrendId(activeTrendId === trend.id ? null : trend.id)}
              >
                <div className="forecast-card__icon">{trend.icon}</div>
                <div className="forecast-card__title">{trend.title}</div>
                <div className="forecast-card__signal">{trend.signal}</div>
                <div className="forecast-card__desc">{trend.description}</div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {activeTrend && (
            <div className="card" style={{ borderLeft: '4px solid var(--c-primary)', marginBottom: 'var(--sp-6)' }}>
              <div style={{ fontFamily: 'var(--f-heading)', fontSize: 18, fontWeight: 800, marginBottom: 'var(--sp-4)' }}>
                {activeTrend.icon} {activeTrend.title}
              </div>
              <p style={{ fontSize: 14, color: 'var(--c-text)', lineHeight: 1.7, marginBottom: 'var(--sp-4)' }}>
                {activeTrend.detail}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                <div style={{ background: 'var(--c-bg)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)' }}>
                  <div style={{ fontFamily: 'var(--f-heading)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-primary)', marginBottom: 6 }}>
                    Suggested Hires
                  </div>
                  <div style={{ fontSize: 14 }}>{activeTrend.suggestedHires}</div>
                </div>
                <div style={{ background: 'var(--c-bg)', borderRadius: 'var(--r-md)', padding: 'var(--sp-4)' }}>
                  <div style={{ fontFamily: 'var(--f-heading)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-success)', marginBottom: 6 }}>
                    Expected Advantage
                  </div>
                  <div style={{ fontSize: 14 }}>{activeTrend.expectedAdv}</div>
                </div>
              </div>
            </div>
          )}

          <SmartPlayTip category="finance" />
        </>
      )}
    </div>
  )
}
