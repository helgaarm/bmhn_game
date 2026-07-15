import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from './App'

describe('App', () => {
  it('renders the existing shell without loading the game route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Bygg med Helsenorge' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Gå inn i visningshallen' }),
    ).toHaveAttribute('href', '/game')
  })

  it('contains an accessible fallback for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/ukjent']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Denne portalen finnes ikke.' }),
    ).toBeInTheDocument()
  })
})
