import type { HTMLAttributes } from 'react'

interface BrandLockupProps extends HTMLAttributes<HTMLSpanElement> {
  compact?: boolean
}

/**
 * Text lockup and original connection glyph based on the published NHN design
 * principles. It is intentionally not a recreation of the protected logo file.
 */
export function BrandLockup({
  className = '',
  compact = false,
  ...props
}: BrandLockupProps) {
  return (
    <span
      className={`brand-lockup${compact ? ' brand-lockup--compact' : ''} ${className}`.trim()}
      {...props}
    >
      <svg
        className="brand-lockup__glyph"
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
      >
        <path d="M8 22c0-6.6 5.4-12 12-12h4c6.6 0 12 5.4 12 12" />
        <path d="M8 22c0 6.6 5.4 12 12 12h4c6.6 0 12-5.4 12-12" />
        <circle cx="8" cy="22" r="3" />
        <circle cx="36" cy="22" r="3" />
        <path d="M18 22h8" />
      </svg>
      <span className="brand-lockup__text">
        <strong>Norsk helsenett</strong>
        {!compact && <small>Bygg med Helsenorge</small>}
      </span>
    </span>
  )
}
