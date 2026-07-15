import { useEffect, useReducer, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BrandLockup } from '../components/BrandLockup'
import { CampaignDashboard } from './components/CampaignDashboard'
import { GameCanvas } from './components/GameCanvas'
import { GameErrorBoundary } from './components/GameErrorBoundary'
import { UnderstandAssessQuest } from './components/UnderstandAssessQuest'
import {
  verticalSlice,
  type AudienceId,
  type DecisionId,
} from './content/verticalSlice'
import { firstCampaign } from './content/firstCampaign'
import { understandAssess } from './content/understandAssess'
import {
  createCampaignReducer,
  createCampaignState,
  type CampaignStageState,
} from './state/campaignMachine'
import { initialQuestState, questReducer } from './state/questMachine'
import {
  assessmentReducer,
  initialAssessmentState,
} from './state/assessmentMachine'
import { matchesControlKey } from './input/controlMap'
import {
  clearGameSave,
  loadGameSave,
  writeGameSave,
  type GameSaveLoadResult,
} from './persistence/gameSave'

const campaignReducer = createCampaignReducer(firstCampaign)

interface BrowserPerformanceMemory {
  usedJSHeapSize: number
}

function readMemoryEstimateMb() {
  const memory = (
    performance as Performance & { memory?: BrowserPerformanceMemory }
  ).memory
  return memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null
}

function initialSaveMessage(result: GameSaveLoadResult) {
  switch (result.status) {
    case 'restored':
      return 'Fremdrift er gjenopprettet fra denne nettleseren.'
    case 'recovered':
      return 'Ugyldig lokal fremdrift ble forkastet. En ny, trygg lagring opprettes.'
    case 'incompatible':
      return 'En lagring fra en annen versjon er bevart og blir ikke overskrevet.'
    case 'unavailable':
      return 'Lokal lagring er ikke tilgjengelig i denne nettleseren.'
    case 'empty':
      return 'Fremdrift lagres bare lokalt i denne nettleseren.'
  }
}

function initialSaveNotice(result: GameSaveLoadResult) {
  switch (result.status) {
    case 'recovered':
      return 'Lokal fremdrift kunne ikke valideres og ble forkastet. Spillet startet trygt på nytt.'
    case 'incompatible':
      return 'Lokal fremdrift er fra en annen versjon. Den er bevart og blir ikke overskrevet før du nullstiller den.'
    case 'unavailable':
      return 'Nettleseren tillater ikke lokal lagring. Spillet fungerer, men kan ikke gjenoppta fremdrift.'
    case 'empty':
    case 'restored':
      return null
  }
}

function JourneyMap({ stages }: { stages: CampaignStageState[] }) {
  return (
    <ol className="journey-map" aria-label="Aktørreisen">
      {firstCampaign.stages.map((step, index) => {
        const status = stages[index]?.status ?? 'unavailable'
        return (
          <li
            key={step.id}
            className={`journey-map__step--${status}`}
            aria-current={status === 'active' ? 'step' : undefined}
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
  const [loadedSave] = useState(() => loadGameSave(window.localStorage))
  const restoredSave = loadedSave.status === 'restored' ? loadedSave.save : null
  const [quest, dispatch] = useReducer(
    questReducer,
    restoredSave?.quest ?? initialQuestState,
  )
  const [assessment, dispatchAssessment] = useReducer(
    assessmentReducer,
    restoredSave?.assessment ?? initialAssessmentState,
  )
  const [campaign, dispatchCampaign] = useReducer(
    campaignReducer,
    restoredSave?.campaign ?? createCampaignState(firstCampaign),
  )
  const [nearNpc, setNearNpc] = useState(false)
  const [accessiblePath, setAccessiblePath] = useState(false)
  const [needDescription, setNeedDescription] = useState(
    restoredSave?.draft.needDescription ?? '',
  )
  const [audienceId, setAudienceId] = useState<AudienceId | null>(
    restoredSave?.draft.audienceId ?? null,
  )
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [firstFrameMs, setFirstFrameMs] = useState<number | null>(null)
  const [fps, setFps] = useState<number | null>(null)
  const [saveEnabled, setSaveEnabled] = useState(
    loadedSave.status !== 'incompatible' && loadedSave.status !== 'unavailable',
  )
  const [saveMessage, setSaveMessage] = useState(() =>
    initialSaveMessage(loadedSave),
  )
  const [saveNotice, setSaveNotice] = useState<string | null>(() =>
    initialSaveNotice(loadedSave),
  )
  const sceneStartedAt = useRef(performance.now())

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const update = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const interact = (event: KeyboardEvent) => {
      if (
        matchesControlKey('interact', event.code) &&
        nearNpc &&
        quest.stage === 'orientation'
      ) {
        dispatch({ type: 'START_DIALOGUE' })
      }
    }
    window.addEventListener('keydown', interact)
    return () => window.removeEventListener('keydown', interact)
  }, [nearNpc, quest.stage])

  useEffect(() => {
    if (quest.stage !== 'complete') return
    const decision = verticalSlice.decisions.find(
      (candidate) => candidate.id === quest.selectedDecisionId,
    )
    if (!decision || !quest.audienceId) return

    dispatchCampaign({
      type: 'COMPLETE_STAGE',
      stageId: 'discover',
      evidence: [
        `Behov: ${quest.needDescription}`,
        `Målgruppe: ${quest.audienceId}`,
      ],
      decision: {
        id: 'discover-clarify-need',
        stageId: 'discover',
        choice: decision.label,
        rationale: quest.needDescription,
        role: 'Tjenesteteam',
        sourceId: 'strategy-journey',
        consequence: decision.consequence,
      },
    })
  }, [quest])

  useEffect(() => {
    if (assessment.stage !== 'complete' || !assessment.selectedDecisionId) return
    const decision = understandAssess.decisions.find(
      (candidate) => candidate.id === assessment.selectedDecisionId,
    )
    if (!decision) return
    const actorLabels = understandAssess.actors
      .filter((actor) => assessment.selectedActorIds.includes(actor.id))
      .map((actor) => actor.label)

    dispatchCampaign({
      type: 'COMPLETE_STAGE',
      stageId: 'understand-assess',
      evidence: [
        `Aktørbilde: ${actorLabels.join(', ')}`,
        `Forventet verdi: ${assessment.expectedValue}`,
        `Åpen usikkerhet: ${assessment.uncertainty}`,
      ],
      decision: {
        id: 'understand-assess-carry-uncertainty',
        stageId: 'understand-assess',
        choice: decision.label,
        rationale: `${assessment.expectedValue} Åpen usikkerhet: ${assessment.uncertainty}`,
        role: 'Behovseier',
        sourceId: 'strategy-journey',
        consequence: decision.consequence,
      },
    })
  }, [assessment])

  useEffect(() => {
    if (!saveEnabled) return
    setSaveMessage('Venter på å lagre lokal fremdrift …')
    const timer = window.setTimeout(() => {
      const result = writeGameSave(window.localStorage, {
        quest,
        assessment,
        campaign,
        draft: { needDescription, audienceId },
      })
      if (result.status === 'saved') {
        const time = new Date(result.savedAt).toLocaleTimeString('nb-NO', {
          hour: '2-digit',
          minute: '2-digit',
        })
        setSaveMessage(`Lagret lokalt kl. ${time}.`)
      } else {
        setSaveEnabled(false)
        setSaveNotice(
          'Lokal lagring feilet. Spillet fortsetter uten save/resume.',
        )
        setSaveMessage('Lokal lagring feilet. Spillet fortsetter uten save/resume.')
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [assessment, audienceId, campaign, needDescription, quest, saveEnabled])

  const startDialogue = () => dispatch({ type: 'START_DIALOGUE' })

  const handleFirstFrame = () => {
    setSceneReady(true)
    setFirstFrameMs((current) =>
      current ?? Math.round(performance.now() - sceneStartedAt.current),
    )
  }

  const handleSceneFailure = () => {
    setSceneFailed(true)
    setSceneReady(true)
  }

  const submitNeed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_NEED', needDescription, audienceId })
  }

  const chooseDecision = (decisionId: DecisionId) => {
    dispatch({ type: 'CHOOSE_DECISION', decisionId })
  }

  const beginAssessment = () => {
    if (!quest.audienceId) return
    dispatchAssessment({ type: 'BEGIN', requiredActorId: quest.audienceId })
    setAccessiblePath(true)
  }

  const restart = () => {
    dispatch({ type: 'RESET' })
    dispatchAssessment({ type: 'RESET' })
    dispatchCampaign({ type: 'RESET' })
    setNeedDescription('')
    setAudienceId(null)
    setAccessiblePath(false)
  }

  const clearLocalProgress = () => {
    if (!clearGameSave(window.localStorage)) {
      setSaveMessage('Kunne ikke slette lokal fremdrift i denne nettleseren.')
      return
    }
    setSaveEnabled(true)
    setSaveNotice(null)
    setSaveMessage('Lokal fremdrift er nullstilt.')
    restart()
  }

  const assessmentActive = assessment.stage !== 'locked'
  const activeContent = assessmentActive ? understandAssess : verticalSlice
  const activeWorldTitle = assessmentActive ? 'Speilsalen' : 'Visningshallen'

  const questStatus = assessmentActive
    ? assessment.stage === 'complete'
      ? 'Fullført'
      : assessment.stage === 'gate'
        ? 'Usikkerhetsport'
        : assessment.stage === 'actor-map'
          ? 'Aktørkart'
          : 'Samtale med Nor'
    : quest.stage === 'complete'
      ? 'Klar for neste steg'
      : quest.stage === 'decision'
        ? 'Avhengighetsport'
        : quest.stage === 'casebuilder'
          ? 'Casebuilder'
          : quest.stage === 'dialogue'
            ? 'Samtale med Nor'
            : 'Finn Nor'

  return (
    <main
      className={`game-page${highContrast ? ' game-page--high-contrast' : ''}`}
    >
      <header className="game-header">
        <Link
          className="game-header__brand"
          to="/"
          aria-label="Norsk helsenett - Bygg med Helsenorge"
        >
          <BrandLockup />
        </Link>
        <div className="game-header__tools">
          <span className="phase-badge">{activeContent.level}</span>
          <button
            className="button button--compact button--secondary"
            type="button"
            onClick={() => setCampaignOpen(true)}
          >
            Kampanje
          </button>
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

      {saveNotice && (
        <section className="save-notice" role="status" aria-label="Lokal fremdrift">
          <span>{saveNotice}</span>
          <button className="text-button" type="button" onClick={() => setSaveNotice(null)}>
            Lukk
          </button>
        </section>
      )}

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
          <div className="save-settings" role="status">
            <strong>Lokal fremdrift</strong>
            <span>{saveMessage}</span>
            <small>Kun syntetisk spillstate. Ingenting sendes fra nettleseren.</small>
            {loadedSave.status !== 'unavailable' && (
              <button className="text-button" type="button" onClick={clearLocalProgress}>
                Nullstill lokal fremdrift
              </button>
            )}
          </div>
          <button
            className="text-button settings-panel__diagnostics-toggle"
            type="button"
            aria-expanded={diagnosticsOpen}
            aria-controls="performance-diagnostics"
            onClick={() => setDiagnosticsOpen((open) => !open)}
          >
            {diagnosticsOpen ? 'Skjul teknisk diagnose' : 'Vis teknisk diagnose'}
          </button>
          {diagnosticsOpen && (
            <dl className="performance-diagnostics" id="performance-diagnostics">
              <div><dt>Scene</dt><dd>{sceneFailed ? '2D-reserve' : sceneReady ? 'Klar' : 'Laster'}</dd></div>
              <div><dt>Første bilde</dt><dd>{firstFrameMs === null ? 'Venter' : `${firstFrameMs} ms`}</dd></div>
              <div><dt>FPS-estimat</dt><dd>{fps ?? 'Måler'}</dd></div>
              <div><dt>JS-minne</dt><dd>{readMemoryEstimateMb() === null ? 'Ikke tilgjengelig' : `${readMemoryEstimateMb()} MB`}</dd></div>
            </dl>
          )}
        </section>
      )}

      <CampaignDashboard
        campaign={firstCampaign}
        state={campaign}
        open={campaignOpen}
        onClose={() => setCampaignOpen(false)}
      />

      <section className="game-layout">
        <section className="world-shell" aria-labelledby="world-title">
          <div className="world-shell__heading">
            <div>
              <p className="eyebrow">{activeContent.title}</p>
              <h1 id="world-title">{activeWorldTitle}</h1>
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
            <GameErrorBoundary
              fallback={<ThreeDFallback />}
              onError={handleSceneFailure}
            >
              <GameCanvas
                reducedMotion={reducedMotion}
                zone={assessmentActive ? 'mirror-hall' : 'showroom'}
                onNpcProximityChange={setNearNpc}
                onFirstFrame={handleFirstFrame}
                onFpsSample={diagnosticsOpen ? setFps : undefined}
              />
            </GameErrorBoundary>
            {!sceneReady && (
              <div className="canvas-loading" role="status" aria-live="polite">
                <span aria-hidden="true" />
                <strong>Klargjør visningshallen</strong>
                <small>Starter scene, fysikk og tilgjengelig reservevei.</small>
              </div>
            )}
            <div className="canvas-vignette" aria-hidden="true" />
            {nearNpc && quest.stage === 'orientation' && !assessmentActive && (
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
                  Du kan fullføre hele det aktive oppdraget med tastatur og
                  skjermleser uten å navigere i 3D-verdenen.
                </p>
                {quest.stage === 'orientation' && !assessmentActive && (
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
          <h2 id="quest-title">{activeContent.title}</h2>
          <p>{activeContent.learningObjective}</p>

          <div className="quest-status" aria-live="polite">
            <span>Status</span>
            <strong>
              {questStatus}
            </strong>
          </div>

          <h3>Aktørreisen</h3>
          <JourneyMap stages={campaign.stages} />

          <details className="source-panel">
            <summary>Kilder og avgrensninger</summary>
            {activeContent.sources.map((source) => (
              <div key={source.id}>
                <strong>{source.title}</strong>
                <p>{source.note}</p>
              </div>
            ))}
          </details>
        </aside>
      </section>

      <section className="learning-dock" aria-label="Oppdragsdialog">
        {!assessmentActive && quest.stage === 'orientation' && (
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

        {!assessmentActive && quest.stage === 'dialogue' && (
          <Dialogue
            index={quest.dialogueIndex}
            onAdvance={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}
          />
        )}

        {!assessmentActive && quest.stage === 'casebuilder' && (
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

        {!assessmentActive && quest.stage === 'decision' && (
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

        {!assessmentActive && quest.stage === 'complete' && (
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
              <div className="completion-card__actions">
                <button className="button button--primary" type="button" onClick={beginAssessment}>
                  Fortsett til Speilsalen
                </button>
                <button className="button button--secondary" type="button" onClick={restart}>
                  Start kampanjen på nytt
                </button>
              </div>
            </div>
          </section>
        )}

        {assessmentActive && (
          <UnderstandAssessQuest
            state={assessment}
            dispatch={dispatchAssessment}
            onOpenCampaign={() => setCampaignOpen(true)}
          />
        )}
      </section>
    </main>
  )
}
