import { lazy, Suspense } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { BrandLockup } from './components/BrandLockup'

const GamePage = lazy(() => import('./game/GamePage'))

function LoadingScreen() {
  return (
    <main className="loading-screen" aria-busy="true" aria-live="polite">
      <div className="loading-rune" aria-hidden="true" />
      <p>Laster læringsverdenen ...</p>
    </main>
  )
}

function HomePage() {
  return (
    <main className="home-page">
      <header className="home-header">
        <Link to="/" aria-label="Norsk helsenett - Bygg med Helsenorge">
          <BrandLockup />
        </Link>
        <span className="home-header__descriptor">Kooperativ læringsopplevelse</span>
      </header>
      <div className="home-page__connections" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Teknisk vertikalsnitt · fase 1</p>
        <h1 id="hero-title">Bygg med Helsenorge</h1>
        <p className="hero__lead">
          En varm, tydelig fantasiverden der behov, roller og avhengigheter
          knyttes sammen før laget velger vei videre.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" to="/game">
            Gå inn i visningshallen
          </Link>
          <a className="button button--secondary" href="#about">
            Om denne prototypen
          </a>
        </div>
      </section>

      <section className="feature-grid" id="about" aria-label="Om prototypen">
        <article>
          <span className="feature-grid__number">01</span>
          <h2>Scenario først</h2>
          <p>Beskriv et konkret behov før du vurderer en abstrakt løsning.</p>
        </article>
        <article>
          <span className="feature-grid__number">02</span>
          <h2>Synlig progresjon</h2>
          <p>Ett oppdrag, én avhengighetsport og forståelige konsekvenser.</p>
        </article>
        <article>
          <span className="feature-grid__number">03</span>
          <h2>Tilgjengelig vei</h2>
          <p>Hele læringsflyten kan fullføres uten presis 3D-navigasjon.</p>
        </article>
      </section>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">Ukjent sti</p>
      <h1>Denne portalen finnes ikke.</h1>
      <Link className="button button--primary" to="/">
        Tilbake til inngangen
      </Link>
    </main>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/game"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <GamePage />
          </Suspense>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
