import type { Dispatch, FormEvent } from 'react'
import {
  understandAssess,
  type AssessmentActorId,
} from '../content/understandAssess'
import type {
  AssessmentEvent,
  AssessmentState,
} from '../state/assessmentMachine'

interface UnderstandAssessQuestProps {
  state: AssessmentState
  dispatch: Dispatch<AssessmentEvent>
  onOpenCampaign: () => void
}
function actorLabel(actorId: AssessmentActorId | null) {
  return understandAssess.actors.find((actor) => actor.id === actorId)?.label
}

export function UnderstandAssessQuest({
  state,
  dispatch,
  onOpenCampaign,
}: UnderstandAssessQuestProps) {
  const submitMapping = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_MAPPING' })
  }

  if (state.stage === 'locked') return null

  if (state.stage === 'dialogue') {
    const isLast = state.dialogueIndex === understandAssess.npc.dialogue.length - 1
    return (
      <section className="dialogue-panel" aria-labelledby="assessment-dialogue-speaker">
        <div className="dialogue-panel__portrait" aria-hidden="true">N</div>
        <div>
          <p className="eyebrow" id="assessment-dialogue-speaker">
            {understandAssess.npc.name} · {understandAssess.npc.role}
          </p>
          <p>{understandAssess.npc.dialogue[state.dialogueIndex]}</p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}
          >
            {isLast ? 'Åpne aktørkartet' : 'Fortsett'}
          </button>
        </div>
      </section>
    )
  }

  if (state.stage === 'actor-map') {
    return (
      <form className="casebuilder actor-map" onSubmit={submitMapping}>
        <div className="casebuilder__heading">
          <div>
            <p className="eyebrow">Speilsalen · aktørkart</p>
            <h2>{understandAssess.scenario.organisation}</h2>
          </div>
          <span className="data-badge">Kun syntetiske data</span>
        </div>
        <p>{understandAssess.scenario.summary}</p>

        <fieldset>
          <legend>Hvem påvirkes av behovet eller arbeidet rundt det?</legend>
          <p className="field-help">
            Velg minst tre. Målgruppen fra forrige steg, {actorLabel(state.requiredActorId)}, er låst som del av aktørbildet.
          </p>
          <div className="actor-grid">
            {understandAssess.actors.map((actor) => {
              const required = actor.id === state.requiredActorId
              return (
                <label className="actor-card" key={actor.id}>
                  <input
                    type="checkbox"
                    checked={state.selectedActorIds.includes(actor.id)}
                    disabled={required}
                    onChange={() => dispatch({ type: 'TOGGLE_ACTOR', actorId: actor.id })}
                  />
                  <span>
                    <strong>{actor.label}</strong>
                    <small>{actor.role}</small>
                    <p>{actor.perspective}</p>
                    <em>{actor.openQuestion}</em>
                    {required && <b>Målgruppe fra steg 1</b>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <label htmlFor="expected-value">
          Hvilken verdi forventer laget dersom behovet blir bedre forstått?
        </label>
        <textarea
          id="expected-value"
          value={state.expectedValue}
          onChange={(event) => dispatch({ type: 'SET_EXPECTED_VALUE', value: event.target.value })}
          rows={3}
          aria-describedby="expected-value-help"
          placeholder="Eksempel: Innbyggeren kan møte bedre forberedt ..."
        />
        <small id="expected-value-help">
          Beskriv ønsket forskjell uten å love at den allerede er dokumentert.
        </small>

        <label htmlFor="open-uncertainty">
          Hvilken viktig usikkerhet må undersøkes videre?
        </label>
        <textarea
          id="open-uncertainty"
          value={state.uncertainty}
          onChange={(event) => dispatch({ type: 'SET_UNCERTAINTY', value: event.target.value })}
          rows={3}
          aria-describedby="open-uncertainty-help"
          placeholder="Eksempel: Laget vet ennå ikke ..."
        />
        <small id="open-uncertainty-help">
          En åpen usikkerhet er evidens på ærlig vurdering, ikke et feilresultat.
        </small>

        {state.feedback && (
          <p className="feedback feedback--warning" role="alert">{state.feedback}</p>
        )}
        <button className="button button--primary" type="submit">
          Prøv usikkerhetsporten
        </button>
      </form>
    )
  }

  if (state.stage === 'gate') {
    const selectedActors = understandAssess.actors.filter((actor) =>
      state.selectedActorIds.includes(actor.id),
    )
    return (
      <section className="decision-gate" aria-labelledby="assessment-gate-title">
        <p className="eyebrow">Usikkerhetsport</p>
        <h2 id="assessment-gate-title">Hva bør laget gjøre med vurderingen?</h2>
        <dl className="assessment-summary">
          <div>
            <dt>Aktørbilde</dt>
            <dd>{selectedActors.map((actor) => actor.label).join(', ')}</dd>
          </div>
          <div>
            <dt>Forventet verdi</dt>
            <dd>{state.expectedValue}</dd>
          </div>
          <div>
            <dt>Åpen usikkerhet</dt>
            <dd>{state.uncertainty}</dd>
          </div>
        </dl>
        <div className="decision-list">
          {understandAssess.decisions.map((decision) => (
            <button
              key={decision.id}
              type="button"
              onClick={() => dispatch({ type: 'CHOOSE_DECISION', decisionId: decision.id })}
            >
              <span aria-hidden="true">◇</span>
              {decision.label}
            </button>
          ))}
        </div>
        {state.feedback && (
          <p className={`feedback${state.unsuccessfulAttempts ? ' feedback--warning' : ''}`} role="status">
            {state.feedback}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="completion-card" aria-labelledby="assessment-completion-title">
      <span className="completion-card__sigil" aria-hidden="true">✓</span>
      <div>
        <p className="eyebrow">Vurdering dokumentert</p>
        <h2 id="assessment-completion-title">Speilsalens port er åpen</h2>
        <p>{state.feedback}</p>
        <p>
          <strong>Læringspoeng:</strong> Forventet verdi blir et bedre beslutningsgrunnlag når berørte perspektiver og åpne spørsmål er synlige samtidig.
        </p>
        <button className="button button--primary" type="button" onClick={onOpenCampaign}>
          Se evidens og neste steg
        </button>
      </div>
    </section>
  )
}
