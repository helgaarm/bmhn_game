import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InGameDialogueOverlay } from './InGameDialogueOverlay'

const props = {
  conversationId: 'discover',
  speaker: 'Nor',
  role: 'Veiviser',
  text: 'Behovet må beskrives før laget velger en teknisk vei.',
  advanceLabel: 'Fortsett',
  onAdvance: vi.fn(),
}

describe('InGameDialogueOverlay', () => {
  it('starts blurred and opens for mouse hover', () => {
    render(<InGameDialogueOverlay {...props} />)
    const region = screen.getByLabelText('Dialog med Nor')
    const toggle = screen.getByRole('button', { name: /Åpne dialog/ })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(props.text).parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    )

    fireEvent.mouseEnter(region)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.mouseLeave(region)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles with T, closes with Escape and advances while open', () => {
    const onAdvance = vi.fn()
    render(<InGameDialogueOverlay {...props} onAdvance={onAdvance} />)
    const toggle = screen.getByRole('button', { name: /Åpne dialog/ })

    fireEvent.keyDown(window, { code: 'KeyT' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Fortsett' }))
    expect(onAdvance).toHaveBeenCalledOnce()

    fireEvent.keyDown(window, { code: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on keyboard focus without requiring hover', () => {
    render(<InGameDialogueOverlay {...props} />)
    const toggle = screen.getByRole('button', { name: /Åpne dialog/ })

    fireEvent.focus(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })
})
