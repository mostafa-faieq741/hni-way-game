import React from 'react'
import logoSrc from '../assets/hni-logo.png'

/**
 * HNILogo – renders the brand logo.
 * Imported as a Vite asset module so it gets base64-inlined in the
 * single-file build — no external HTTP requests, no 404s.
 */
export default function HNILogo({ height = 36 }) {
  return (
    <div className="app-header__logo">
      <img
        src={logoSrc}
        alt="HNI – Human Network International"
        height={height}
        style={{ height, width: 'auto' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          if (e.currentTarget.nextSibling) {
            e.currentTarget.nextSibling.style.display = 'flex'
          }
        }}
      />
      {/* SVG fallback (hidden by default) */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          gap: 8,
          height,
        }}
      >
        {/* Emblem */}
        <svg
          width={height * 0.9}
          height={height}
          viewBox="0 0 40 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left figure */}
          <circle cx="8" cy="9" r="5.5" fill="#91195a" />
          <ellipse cx="8" cy="27" rx="6.5" ry="9" fill="#91195a" />
          {/* Middle figure (larger) */}
          <circle cx="20" cy="7.5" r="6.5" fill="#91195a" />
          <ellipse cx="20" cy="27" rx="8.5" ry="11" fill="#91195a" />
          {/* Right figure */}
          <circle cx="32" cy="9" r="5.5" fill="#91195a" />
          <ellipse cx="32" cy="27" rx="6.5" ry="9" fill="#91195a" />
        </svg>
        {/* Separator */}
        <div
          style={{
            width: 1,
            height: height * 0.7,
            background: '#ccc',
          }}
        />
        {/* Wordmark */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: height * 0.45,
              fontWeight: 800,
              color: '#231f20',
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            HNI
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: height * 0.2,
              fontWeight: 500,
              color: '#5c5a5a',
              letterSpacing: '0.1em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}
          >
            HUMAN NETWORK
            <br />
            INTERNATIONAL
          </span>
        </div>
      </div>
    </div>
  )
}
