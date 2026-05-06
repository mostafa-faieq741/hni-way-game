import React from 'react'
import Button from './Button.jsx'

/**
 * Navigation – sticky footer bar with Back and Next buttons.
 *
 * @prop {boolean}  showBack      – render the Back button
 * @prop {boolean}  showNext      – render the Next button
 * @prop {string}   nextLabel     – label for Next button  (default: 'Next')
 * @prop {string}   backLabel     – label for Back button  (default: 'Back')
 * @prop {function} onNext
 * @prop {function} onBack
 * @prop {boolean}  nextDisabled
 */
export default function Navigation({
  showBack = true,
  showNext = true,
  nextLabel = 'Next',
  backLabel = 'Back',
  onNext,
  onBack,
  nextDisabled = false,
}) {
  return (
    <footer className="app-nav">
      {/* Left side: Back */}
      <div>
        {showBack && (
          <Button variant="secondary" onClick={onBack} arrowLeft>
            {backLabel}
          </Button>
        )}
      </div>

      {/* Right side: Next */}
      <div>
        {showNext && (
          <Button
            variant="primary"
            onClick={onNext}
            arrowRight
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </footer>
  )
}
