import React, { useState } from 'react'
import { startingSetup, turnFlow } from '../data/gameData.js'
import Button from '../components/Button.jsx'

/* ── Panel Icons ── */
function IconSetup() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </svg>
  )
}

function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

const panelIcons = { setup: <IconSetup />, people: <IconPeople />, chart: <IconChart /> }

/* ── Step number badge colors ── */
const stepNumberClasses = {
  violet:    'step-card__number--violet',
  primary:   'step-card__number--primary',
  gold:      'step-card__number--gold',
  emerald:   'step-card__number--emerald',
  majorelle: 'step-card__number--majorelle',
}

/* ── Lightbulb icon ── */
function TipIcon() {
  return (
    <svg className="tip-box__icon" viewBox="0 0 24 24" fill="none" stroke="#8a6900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  )
}

/* ── Alert icon ── */
function AlertIcon() {
  return (
    <svg style={{ width: 24, height: 24, flexShrink: 0, marginTop: 1 }} viewBox="0 0 24 24" fill="none" stroke="#91195a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────
   BeforeYouPlayScreen
   ───────────────────────────────────────────────────────── */
export default function BeforeYouPlayScreen({ onContinueToGame }) {
  return (
    <div className="screen">
      {/* ═══════════ PART A: STARTING SETUP ═══════════ */}
      <section className="byp-section" aria-labelledby="setup-heading">
        <div className="byp-section__header">
          <span className="section-label">{startingSetup.sectionLabel}</span>
          <h2 className="byp-section__title" id="setup-heading">
            Starting Setup
          </h2>
        </div>

        {/* Stat Cards */}
        <div className="stat-cards">
          {startingSetup.statCards.map((sc) => (
            <div key={sc.label} className="stat-card">
              {sc.prefix && <div className="stat-card__prefix">{sc.prefix}</div>}
              <div className="stat-card__value">{sc.value}</div>
              <div className="stat-card__label">{sc.label}</div>
              {sc.sub && <div className="stat-card__sub">{sc.sub}</div>}
            </div>
          ))}
        </div>

        {/* Info Panels */}
        <div className="info-panels">
          {startingSetup.panels.map((panel) => (
            <div key={panel.title} className="info-panel card">
              <div className="info-panel__icon" aria-hidden="true">
                {panelIcons[panel.icon]}
              </div>
              <h3 className="info-panel__title">{panel.title}</h3>
              <ul className="info-panel__bullets">
                {panel.bullets.map((b, i) => (
                  <li key={i} className="info-panel__bullet">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Tip box */}
        <div className="tip-box">
          <TipIcon />
          <div>
            <div className="tip-box__label">Tip</div>
            <p className="tip-box__text">{startingSetup.tip}</p>
          </div>
        </div>
      </section>

      {/* ═══════════ PART B: TURN FLOW ═══════════ */}
      <section className="byp-section" aria-labelledby="turnflow-heading">
        <div className="byp-section__header">
          <span className="section-label">HNI Way</span>
          <h2 className="byp-section__title" id="turnflow-heading">
            Turn Flow
          </h2>
        </div>

        {/* 5-step grid */}
        <div className="steps-grid">
          {turnFlow.steps.map((step) => (
            <div key={step.number} className="step-card">
              <div
                className={`step-card__number ${stepNumberClasses[step.color] || stepNumberClasses.primary}`}
                aria-hidden="true"
              >
                {step.number}
              </div>
              <div>
                <div className="step-card__title">{step.title}</div>
                <p className="step-card__desc">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Important note */}
        <div className="alert-box">
          <AlertIcon />
          <div>
            <div className="alert-box__label">Important Rule</div>
            <p className="alert-box__text">{turnFlow.importantNote}</p>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <div className="byp-cta">
        <Button
          variant="primary"
          size="lg"
          onClick={onContinueToGame}
          arrowRight
        >
          Continue to Game
        </Button>
      </div>
    </div>
  )
}
