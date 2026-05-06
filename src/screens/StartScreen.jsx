import React from 'react'
import VideoPlayer from '../components/VideoPlayer.jsx'
import Button from '../components/Button.jsx'

/**
 * StartScreen
 * ─────────────────────────────────────────────────
 * The opening screen. User cannot return here once
 * they click Start (enforced in App.jsx navigation).
 *
 * @prop {function} onStart   – called when "Start" is clicked
 * @prop {string}   videoSrc  – optional MP4 path (e.g. './intro.mp4')
 * @prop {string}   videoPoster – optional poster image path
 */
export default function StartScreen({ onStart, videoSrc = null, videoPoster = null }) {
  return (
    <main className="app-main">
      <div className="start-screen screen">
        {/* Decorative brand circles */}
        <div className="start-screen__deco" aria-hidden="true" />
        <div className="start-screen__deco2" aria-hidden="true" />

        <div className="start-screen__inner">
          {/* Badge */}
          <div className="start-screen__badge">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <circle cx="6" cy="6" r="6" />
            </svg>
            Business Simulation · Pre-Game Onboarding
          </div>

          {/* Title */}
          <div>
            <h1 className="start-screen__title">
              HNI <span>Way</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="start-screen__subtitle">
            Welcome to the HNI Way simulation. This introduction will prepare
            you with the objectives, key terms, and setup you need before
            the game begins.
          </p>

          {/* Video */}
          <div className="start-screen__video">
            <VideoPlayer src={videoSrc} poster={videoPoster} />
          </div>

          {/* CTA */}
          <div className="start-screen__cta">
            <Button
              variant="primary"
              size="lg"
              onClick={onStart}
              arrowRight
            >
              Start
            </Button>
            <p className="start-screen__hint">
              The video does not need to finish before continuing.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
