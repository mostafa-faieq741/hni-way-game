import React from 'react'

/**
 * Button – HNI branded button component
 *
 * @prop {string}   variant  – 'primary' | 'secondary' | 'ghost'   (default: 'primary')
 * @prop {string}   size     – 'sm' | 'md' | 'lg'                  (default: 'md')
 * @prop {boolean}  disabled
 * @prop {function} onClick
 * @prop {boolean}  arrowRight  – show right arrow icon
 * @prop {boolean}  arrowLeft   – show left arrow icon
 * @prop {ReactNode} children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  arrowRight = false,
  arrowLeft = false,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {arrowLeft && (
        <svg
          className="btn-arrow btn-arrow-back"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {children}
      {arrowRight && (
        <svg
          className="btn-arrow"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
