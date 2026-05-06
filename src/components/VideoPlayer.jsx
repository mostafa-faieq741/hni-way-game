import React, { useRef, useState } from 'react'

/**
 * VideoPlayer
 *
 * Usage:
 *   <VideoPlayer />                    ← shows branded placeholder
 *   <VideoPlayer src="./video.mp4" />  ← renders real HTML5 video
 *   <VideoPlayer poster="./thumb.jpg" />  ← placeholder with poster image
 *
 * When src is provided, a native <video> element is rendered.
 * When src is absent, a styled placeholder is shown.
 */
export default function VideoPlayer({ src = null, poster = null }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  if (src) {
    return (
      <div className="video-wrap">
        <video
          ref={videoRef}
          className="video-player"
          src={src}
          poster={poster || undefined}
          controls
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        >
          Your browser does not support the video element.
        </video>
      </div>
    )
  }

  return (
    <div className="video-wrap">
      <div className="video-placeholder" role="img" aria-label="Video placeholder — MP4 file to be provided">
        {/* Animated play icon */}
        <div className="video-placeholder__play">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polygon points="5,3 19,12 5,21" fill="white" />
          </svg>
        </div>

        <div className="video-placeholder__text">
          <span>Welcome Video</span>
          <small>Provide an MP4 file path via the <code>src</code> prop</small>
        </div>

        {/* HNI branding watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            opacity: 0.35,
            zIndex: 1,
          }}
        >
          <svg width="60" height="22" viewBox="0 0 60 22" fill="none">
            <text
              x="0"
              y="16"
              fontFamily="Montserrat, sans-serif"
              fontWeight="800"
              fontSize="14"
              fill="white"
              letterSpacing="2"
            >
              HNI
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
