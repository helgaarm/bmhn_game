import { useEffect, useReducer, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { GameCanvas } from './components/GameCanvas'
import { GameErrorBoundary } from './components/GameErrorBoundary'
import {
  journeySteps,
  verticalSlice,
  type AudienceId,
  type DecisionId,
} from './content/verticalSlice'
import { initialQuestState, questReducer } from './state/questMachine'

function JourneyMap({ completed }: { completed: boolean }) {
  return (
    <ol className="journey-map" aria-label="Aktørreisen">
      {journeySteps.map((step, index) => {
        const isReached = completed || index === 0
        return (
          <li
            key={step.id}
            className={isReached ? 'journey-map__step--reached' : undefined}
            aria-current={index === 0 && !completed ? 'step' : undefined}
          >
            <span>{index + 1}</span>
            <small>{step.label}</small>
          </li>
        )
      })}
    </ol>
  )
}

function Dialogue({
  index,
  onAdvance,
}: {
  index: number
  onAdvance: () => void
}) {
  const isLast = index === verticalSlice.npc.dialogue.length - 1
  return (
    <section className="dialogue-panel" aria-labelledby="dialogue-speaker">
      <div className="dialogue-panel__portrait" aria-hidden="true">
        N
      </div>
      <div>
        <p className="eyebrow" id="dialogue-speaker">
          {verticalSlice.npc.name} · {verticalSlice.npc.role}
        </p>
        <p>{verticalSlice.npc.dialogue[index]}</p>
        <button className="button button--primary" type="button" onClick={onAdvance}>
          {isLast ? 'Åpne Casebuilder' : 'Fortsett'}
        </button>
      </div>
    </section>
  )
}

function ThreeDFallback() {
  return (
    <div className="canvas-fallback" role="status">
      <strong>3D-visningen er ikke tilgjengelig.</strong>
      <span>Bruk den tilgjengelige 2D-veien for å fullføre oppdraget.</span>
    </div>
  )
}

export default function GamePage() {
  const [quest, dispatch] = useReducer(questReducer, initialQuestState)
  const [nearNpc, setNearNpc] = useState(false)
  const [accessiblePath, setAccessiblePath] = useState(false)
  const [needDescription, setNeedDescription] = useState('')
  const [audienceId, setAudienceId] = useState<AudienceId | null>(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const interact = (event: KeyboardEvent) => {
      if (event.code === 'KeyE' && nearNpc && quest.stage === 'orientation') {
        dispatch({ type: 'START_DIALOGUE' })
      }
    }
    window.addEventListener('keydown', interact)
    return () => window.removeEventListener('keydown', interact)
  }, [nearNpc, quest.stage])

  const startDialogue = () => dispatch({ type: 'START_DIALOGUE' })

  const submitNeed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_NEED', needDescription, audienceId })
  }

  const chooseDecision = (decisionId: DecisionId) => {
    dispatch({ type: 'CHOOSE_DECISION', decisionId })
  }

  const restart = () => {
    dispatch({ type: 'RESET' })
    setNeedDescription('')
    setAudienceId(null)
    setAccessiblePath(false)
  }

  return (
    <main
      className={`game-page${highContrast ? ' game-page--high-contrast' : ''}`}
    >
      <header className="game-header">
        <Link className="game-header__brand" to="/">
          <span aria-hidden="true">◇</span>
          Bygg med Helsenorge
        </Link>
        <div className="game-header__tools">
          <span className="phase-badge">{verticalSlice.level}</span>
          <button
            className="button button--compact button--secondary"
            type="button"
            aria-expanded={settingsOpen}
            aria-controls="game-settings"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            Innstillinger
          </button>
        </div>
      </header>

      {settingsOpen && (
        <section className="settings-panel" id="game-settings" aria-label="Innstillinger">
          <label>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Redusert bevegelse
          </label>
          <label>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => setHighContrast(event.target.checked)}
            />
            Høy kontrast
          </label>
        </section>
      )}

      <section className="game-layout">
        <section className="world-shell" aria-labelledby="world-title">
          <div className="world-shell__heading">
            <div>
              <p className="eyebrow">{verticalSlice.title}</p>
              <h1 id="world-title">Visningshallen</h1>
            </div>
            <p className="control-hint">
              <kbd>WASD</kbd> / piltaster for å bevege deg
            </p>
          </div>

          <div
            className="canvas-container"
            role="region"
            aria-label="Interaktiv 3D-verden"
          >
            <GameErrorBoundary fallback={<ThreeDFallback />}>
              <GameCanvas
                reducedMotion={reducedMotion}
                onNpcProximityChange={setNearNpc}
              />
            </GameErrorBoundary>
            <div className="canvas-vignette" aria-hidden="true" />
            {nearNpc && quest.stage === 'orientation' && (
              <button
                className="interact-prompt"
                type="button"
                onClick={startDialogue}
              >
                Snakk med Nor
                <kbd>E</kbd>
              </button>
            )}
          </div>

          <div className="accessible-path">
            <button
              className="text-button"
              type="button"
              aria-expanded={accessiblePath}
              aria-controls="accessible-actions"
              onClick={() => setAccessiblePath((open) => !open)}
            >
              {accessiblePath ? 'Skjul tilgjengelig 2D-vei' : 'Bruk tilgjengelig 2D-vei'}
            </button>
            {accessiblePath && (
              <div id="accessible-actions" className="accessible-path__content">
                <p>
                  Du kan fullføre hele oppdraget med tastatur og skjermleser uten
                  å navigere i 3D-verdenen.
                </p>
                {quest.stage === 'orientation' && (
                  <button className="button button--primary" type="button" onClick={startDialogue}>
                    Snakk med Nor
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="quest-sidebar" aria-labelledby="quest-title">
          <p className="eyebrow">Aktivt oppdrag</p>
          <h2 id="quest-title">{verticalSlice.title}</h2>
          <p>{verticalSlice.learningObjective}</p>

          <div className="quest-status" aria-live="polite">
            <span>Status</span>
            <strong>
              {quest.stage === 'complete'
                ? 'Fullført'
                : quest.stage === 'decision'
                  ? 'Avhengighetsport'
                  : quest.stage === 'casebuilder'
                    ? 'Casebuilder'
                    : quest.stage === 'dialogue'
                      ? 'Samtale med Nor'
                      : 'Finn Nor'}
            </strong>
          </div>

          <h3>Aktørreisen</h3>
          <JourneyMap completed={quest.stage === 'complete'} />

          <details className="source-panel">
            <summary>Kilder og avgrensninger</summary>
            {verticalSlice.sources.map((source) => (
              <div key={source.id}>
                <strong>{source.title}</strong>
                <p>{source.note}</p>
              </div>
            ))}
          </details>
        </aside>
      </section>

      <section className="learning-dock" aria-label="Oppdragsdialog">
        {quest.stage === 'orientation' && (
          <div className="orientation-card">
            <div>
              <p className="eyebrow">Første mål</p>
              <h2>Finn den lysende veiviseren</h2>
              <p>
                Gå mot Nor i hallen, eller åpne den tilgjengelige 2D-veien.
              </p>
            </div>
            <span className="orientation-card__marker" aria-hidden="true">N</span>
          </div>
        )}

        {quest.stage === 'dialogue' && (
          <Dialogue
            index={quest.dialogueIndex}
            onAdvance={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}
          />
        )}

        {quest.stage === 'casebuilder' && (
          <form className="casebuilder" onSubmit={submitNeed}>
            <div className="casebuilder__heading">
              <div>
                <p className="eyebrow">Casebuilder · scenario først</p>
                <h2>{verticalSlice.scenario.organisation}</h2>
              </div>
              <span className="data-badge">Kun syntetiske data</span>
            </div>
            <p>{verticalSlice.scenario.summary}</p>

            <label htmlFor="need-description">Hvilket konkret behov skal laget forstå?</label>
            <textarea
              id="need-description"
              value={needDescription}
              onChange={(event) => setNeedDescription(event.target.value)}
              rows={3}
              minLength={24}
              aria-describedby="need-help"
              placeholder="Eksempel: Innbyggeren trenger ..."
            />
            <small id="need-help">
              Beskriv ønsket resultat uten å velge teknologi eller tilkoblingstype.
            </small>

            <fieldset>
              <legend>Hvem berøres først og fremst?</legend>
              <div className="choice-grid">
                {verticalSlice.audiences.map((audience) => (
                  <label key={audience.id}>
                    <input
                      type="radio"
                      name="audience"
                      value={audience.id}
                      checked={audienceId === audience.id}
                      onChange={() => setAudienceId(audience.id)}
                    />
                    <span>{audience.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {quest.feedback && <p className="feedback feedback--warning" role="alert">{quest.feedback}</p>}
            <button className="button button--primary" type="submit">
              Prøv avhengighetsporten
            </button>
          </form>
        )}

        {quest.stage === 'decision' && (
          <section className="decision-gate" aria-labelledby="decision-title">
            <p className="eyebrow">Avhengighetsport</p>
            <h2 id="decision-title">Hva bør laget gjøre nå?</h2>
            <div className="case-summary">
              <span>Behov</span>
              <p>{quest.needDescription}</p>
            </div>
            <div className="decision-list">
              {verticalSlice.decisions.map((decision) => (
                <button
                  key={decision.id}
                  type="button"
                  onClick={() => chooseDecision(decision.id)}
                >
                  <span aria-hidden="true">◇</span>
                  {decision.label}
                </button>
              ))}
            </div>
            {quest.feedback && (
              <p
                className={`feedback${quest.unsuccessfulAttempts ? ' feedback--warning' : ''}`}
                role="status"
              >
                {quest.feedback}
              </p>
            )}
          </section>
        )}

        {quest.stage === 'complete' && (
          <section className="completion-card" aria-labelledby="completion-title">
            <span className="completion-card__sigil" aria-hidden="true">✓</span>
            <div>
              <p className="eyebrow">Oppdrag fullført</p>
              <h2 id="completion-title">Porten til forståelse er åpen</h2>
              <p>{quest.feedback}</p>
              <p>
                <strong>Læringspoeng:</strong> Scenario, behov og aktører styrer
                veien. En teknisk kategori er ikke et meningsfullt førstevalg.
              </p>
              <button className="button button--secondary" type="button" onClick={restart}>
                Spill oppdraget på nytt
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  )
}
