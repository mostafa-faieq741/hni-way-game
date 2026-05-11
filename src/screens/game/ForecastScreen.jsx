import React from 'react'
import { getYearlyForecast } from '../../data/forecastData.js'
import { GAME_CONFIG } from '../../data/gameConfig.js'
import SmartPlayTip from '../../components/SmartPlayTip.jsx'
import TutorialOverlay from '../../components/TutorialOverlay.jsx'

export default function ForecastScreen({ gs, onUpdateGs, onShowToast, onPushFloat }) {
  const alreadyPurchased = !!gs.forecastPurchasedByYear?.[gs.currentYear]
  const canAfford = gs.cash >= GAME_CONFIG.forecastCostPerYear
  const forecast = getYearlyForecast(gs.currentYear)

  const handleBuy = () => {
    if (alreadyPurchased) return
    if (!canAfford) {
      onShowToast?.('Not enough cash to buy the forecast.')
      return
    }
    onUpdateGs({
      cash: gs.cash - GAME_CONFIG.forecastCostPerYear,
      totalCosts: gs.totalCosts + GAME_CONFIG.forecastCostPerYear,
      forecastPurchasedByYear: { ...gs.forecastPurchasedByYear, [gs.currentYear]: true },
    })
    onPushFloat?.('-$' + GAME_CONFIG.forecastCostPerYear.toLocaleString() + ' cash', 'negative')
    onShowToast?.('Forecast purchased! Insights are unlocked for this year.')
  }

  return (
    <div>
      <TutorialOverlay
        screenId="forecast"
        title="Forecast"
        steps={[
          'Buy the forecast for $15,000 once per year.',
          'It reveals the main market trend and a staffing focus suggestion.',
          'Use it before making big hires or accepting many projects.',
        ]}
      />

      <div className="card card--accent" style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div>
            <div className="section-label">Year {gs.currentYear} Forecast</div>
            <h2 style={{ fontFamily: 'var(--f-heading)', fontSize: 22, fontWeight: 800, color: 'var(--c-text)', marginTop: 4 }}>
              {forecast.headline}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--c-text-muted)', marginTop: 8, maxWidth: 540 }}>
              {alreadyPurchased
                ? 'Forecast unlocked for this year. Use the insights below to plan your hiring and project decisions.'
                : 'Purchase the Forecast to unlock this year main market trend and recommended staffing focus.'}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {!alreadyPurchased ? (
              <div>
                <div style={{ fontFamily: 'var(--f-heading)', fontSize: 24, fontWeight: 800, color: 'var(--c-primary)', marginBottom: 8 }}>
                  ${GAME_CONFIG.forecastCostPerYear.toLocaleString()}
                </div>
                <button
                  className="btn btn--primary btn--md"
                  onClick={handleBuy}
                  disabled={!canAfford}
                  style={{ opacity: canAfford ? 1 : 0.5 }}
                >
                  {canAfford ? 'Buy Forecast' : 'Not enough cash'}
                </button>
                {!canAfford && (
                  <div style={{ fontSize: 12, color: 'var(--c-error)', marginTop: 6 }}>
                    Not enough cash to buy the forecast.
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
                  Purchased - Year {gs.currentYear}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!alreadyPurchased && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--c-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>Locked</div>
          <div style={{ fontFamily: 'var(--f-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Forecast Locked
          </div>
          <div style={{ fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
            Purchase the Forecast for ${GAME_CONFIG.forecastCostPerYear.toLocaleString()} to reveal this year main trend and strategic advantage.
          </div>
        </div>
      )}

      {alreadyPurchased && (
        <>
          <div className="card forecast-main-card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div className="forecast-main-card__icon">{forecast.icon}</div>
            <div>
              <div className="section-label" style={{ color: 'var(--c-primary)' }}>Main yearly trend</div>
              <h3 className="forecast-main-card__title">{forecast.mainTrend}</h3>
              <p className="forecast-main-card__why">{forecast.whyItMatters}</p>
            </div>
          </div>

          <div className="forecast-grid">
            <div className="card">
              <div className="game-section-title" style={{ marginBottom: 'var(--sp-2)' }}>Suggested staffing focus</div>
              <p style={{ fontSize: 14, color: 'var(--c-text)' }}>{forecast.staffingFocus}</p>
            </div>
            <div className="card">
              <div className="game-section-title" style={{ marginBottom: 'var(--sp-2)' }}>Expected advantage</div>
              <p style={{ fontSize: 14, color: 'var(--c-text)' }}>{forecast.expectedAdv}</p>
            </div>
            {forecast.secondaryHint && (
              <div className="card" style={{ borderLeft: '4px solid var(--c-gold)', background: 'var(--c-gold-lt)' }}>
                <div style={{ fontFamily: 'var(--f-heading)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#8a6900', marginBottom: 6 }}>
                  Secondary hint
                </div>
                <p style={{ fontSize: 14, color: 'var(--c-dark-grey)' }}>{forecast.secondaryHint}</p>
              </div>
            )}
          </div>

          <div style={{ marginTop: 'var(--sp-5)' }}>
            <SmartPlayTip category="finance" />
          </div>
        </>
      )}
    </div>
  )
}
