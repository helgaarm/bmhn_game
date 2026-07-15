import { useEffect, useId, useState } from 'react'
import { isTextEntryTarget } from '../input/controlMap'

interface InGameDialogueOverlayProps {
  conversationId: string
  speaker: string
  role: string
  text: string
  advanceLabel: string
  onAdvance: () => void
}

export function InGameDialogueOverlay({
  conversationId,
  speaker,
  role,
  text,
  advanceLabel,
  onAdvance,
}: InGameDialogueOverlayProps) {
  const bodyId = useId()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [pinned, setPinned] = useState(false)
  const open = hovered || focused || pinned

  useEffect(() => {
    setHovered(false)
    setFocused(false)
    setPinned(false)
  }, [conversationId])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return
      if (event.code === 'KeyT') {
        event.preventDefault()
        setPinned((current) => !current)
      } else if (event.code === 'Escape') {
        setPinned(false)
        setFocused(false)
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <section
      className={`in-game-dialogue${open ? ' in-game-dialogue--open' : ''}`}
      aria-label={`Dialog med ${speaker}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
    >
      <header className="in-game-dialogue__header">
        <span className="in-game-dialogue__portrait" aria-hidden="true">N</span>
        <span>
          <strong>{speaker}</strong>
          <small>{role}</small>
        </span>
        <button
          className="in-game-dialogue__toggle"
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setPinned((current) => !current)}
        >
          {pinned ? 'Lukk dialog' : 'Åpne dialog'}
          <kbd>T</kbd>
        </button>
      </header>
      <div
        className="in-game-dialogue__body"
        id={bodyId}
        aria-hidden={!open}
      >
        <p aria-live="polite">{text}</p>
        <button
          className="button button--primary button--compact"
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={onAdvance}
        >
          {advanceLabel}
        </button>
      </div>
      {!open && (
        <span className="in-game-dialogue__hint" aria-hidden="true">
          Hold musepekeren over eller trykk T
        </span>
      )}
    </section>
  )
}
