import type { Dispatch, FormEvent } from 'react'
import { productionRuleRegistry } from '../compliance/productionRules'
import {
  clarifyOrder,
  type ClarifyRoleId,
} from '../content/clarifyOrder'
import type {
  ClarifyOrderEvent,
  ClarifyOrderState,
} from '../state/clarifyOrderMachine'

interface ClarifyOrderQuestProps {
  state: ClarifyOrderState
  dispatch: Dispatch<ClarifyOrderEvent>
  onOpenCampaign: () => void
  onBeginConnect: () => void
  renderDialogue?: boolean
}

export function ClarifyOrderQuest({
  state,
  dispatch,
  onOpenCampaign,
  onBeginConnect,
  renderDialogue = true,
}: ClarifyOrderQuestProps) {
  const submitOrderSheet = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'SUBMIT_ORDER_SHEET' })
  }

  if (state.stage === 'locked') return null

  if (state.stage === 'dialogue') {
    if (!renderDialogue) return null
    const isLast = state.dialogueIndex === clarifyOrder.npc.dialogue.length - 1
    return (
      <section className="dialogue-panel" aria-labelledby="clarify-dialogue-speaker">
        <div className="dialogue-panel__portrait" aria-hidden="true">N</div>
        <div>
          <p className="eyebrow" id="clarify-dialogue-speaker">
            {clarifyOrder.npc.name} · {clarifyOrder.npc.role}
          </p>
          <p>{clarifyOrder.npc.dialogue[state.dialogueIndex]}</p>
          <button
            className="button button--primary"
            type="button"
            onClick={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}
          >
            {isLast ? 'Åpne bestillingssiden' : 'Fortsett'}
          </button>
        </div>
      </section>
    )
  }

  if (state.stage === 'order-sheet') {
    return (
      <form className="casebuilder order-sheet" onSubmit={submitOrderSheet}>
        <div className="casebuilder__heading">
          <div>
            <p className="eyebrow">Ansvarslageret · bestillingsside</p>
            <h2>{clarifyOrder.scenario.organisation}</h2>
          </div>
          <span className="data-badge">Kun syntetiske data</span>
        </div>
        <p>{clarifyOrder.scenario.summary}</p>
        <p className="approval-boundary" role="note">
          <strong>Læringsbevis – ikke produksjonsgodkjenning.</strong>
          Alle tre reglene avventer kontroll og godkjenning fra angitte fagroller.
        </p>

        <label htmlFor="purpose-and-scope">Formål og avgrenset omfang</label>
        <textarea
          id="purpose-and-scope"
          value={state.purposeAndScope}
          onChange={(event) =>
            dispatch({ type: 'SET_PURPOSE_SCOPE', value: event.target.value })
          }
          rows={3}
          placeholder="Beskriv ønsket resultat, hva som er innenfor og hva som er utenfor ..."
        />

        <label htmlFor="information-flow">Informasjonsflyt og dataretning</label>
        <textarea
          id="information-flow"
          value={state.informationFlow}
          onChange={(event) =>
            dispatch({ type: 'SET_INFORMATION_FLOW', value: event.target.value })
          }
          rows={3}
          placeholder="Beskriv hvem som gir hvilken informasjon til hvem, og i hvilken retning ..."
        />

        <label htmlFor="service-documentation">
          Navngitt tjeneste, tjenesteeier og dokumentasjonsstatus
        </label>
        <textarea
          id="service-documentation"
          value={state.serviceDocumentation}
          onChange={(event) =>
            dispatch({
              type: 'SET_SERVICE_DOCUMENTATION',
              value: event.target.value,
            })
          }
          rows={3}
          placeholder="Registrer tjenesten som skal avklares, eier og hvilken dokumentasjon som må kontrolleres ..."
        />
        <small>
          Ikke velg HelseID, FHIR, SMART eller annen forbindelsestype her.
        </small>

        <fieldset>
          <legend>Fordel faglig ansvar</legend>
          <div className="responsibility-grid">
            {clarifyOrder.workstreams.map((workstream) => {
              const rule = productionRuleRegistry.rules.find(
                (candidate) => candidate.id === workstream.ruleId,
              )
              return (
                <article key={workstream.id} className="responsibility-card">
                  <span>{workstream.ruleId}</span>
                  <h3>{workstream.title}</h3>
                  <p>{workstream.summary}</p>
                  <label htmlFor={`owner-${workstream.id}`}>Faglig eier</label>
                  <select
                    id={`owner-${workstream.id}`}
                    value={state.assignments[workstream.id] ?? ''}
                    onChange={(event) =>
                      dispatch({
                        type: 'ASSIGN_OWNER',
                        workstreamId: workstream.id,
                        roleId: (event.target.value || null) as ClarifyRoleId | null,
                      })
                    }
                  >
                    <option value="">Velg ansvarlig rolle</option>
                    {clarifyOrder.roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                  <small>
                    Produksjonsstatus: {rule?.productionStatus === 'pending-professional-approval'
                      ? 'avventer faglig godkjenning'
                      : 'ukjent'}
                  </small>
                </article>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Hvordan håndteres risiko og personvernkonsekvenser?</legend>
          <div className="choice-grid choice-grid--single-column">
            {clarifyOrder.riskDispositions.map((choice) => (
              <label key={choice.id}>
                <input
                  type="radio"
                  name="risk-disposition"
                  value={choice.id}
                  checked={state.riskDispositionId === choice.id}
                  onChange={() =>
                    dispatch({ type: 'SET_RISK_DISPOSITION', value: choice.id })
                  }
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {state.feedback && (
          <p className="feedback feedback--warning" role="alert">{state.feedback}</p>
        )}
        <button className="button button--primary" type="submit">
          Prøv ansvarsporten
        </button>
      </form>
    )
  }

  if (state.stage === 'gate') {
    return (
      <section className="decision-gate" aria-labelledby="clarify-gate-title">
        <p className="eyebrow">Ansvarsport</p>
        <h2 id="clarify-gate-title">Hva kan laget beslutte nå?</h2>
        <dl className="assessment-summary">
          <div><dt>Formål og omfang</dt><dd>{state.purposeAndScope}</dd></div>
          <div><dt>Informasjonsflyt</dt><dd>{state.informationFlow}</dd></div>
          <div><dt>Tjenestedokumentasjon</dt><dd>{state.serviceDocumentation}</dd></div>
          <div><dt>Produksjonsstatus</dt><dd>Blokkert – faglig godkjenning gjenstår</dd></div>
        </dl>
        <div className="decision-list">
          {clarifyOrder.decisions.map((decision) => (
            <button
              key={decision.id}
              type="button"
              onClick={() =>
                dispatch({ type: 'CHOOSE_DECISION', decisionId: decision.id })
              }
            >
              <span aria-hidden="true">◇</span>
              {decision.label}
            </button>
          ))}
        </div>
        {state.feedback && (
          <p
            className={`feedback${state.unsuccessfulAttempts ? ' feedback--warning' : ''}`}
            role="status"
          >
            {state.feedback}
          </p>
        )}
      </section>
    )
  }

  return (
    <section className="completion-card" aria-labelledby="clarify-completion-title">
      <span className="completion-card__sigil" aria-hidden="true">✓</span>
      <div>
        <p className="eyebrow">Bestillingsgrunnlag dokumentert</p>
        <h2 id="clarify-completion-title">Ansvarsporten er åpen</h2>
        <p>{state.feedback}</p>
        <p>
          <strong>Læringspoeng:</strong> Steget kan fullføres når ansvar og åpne
          avklaringer er synlige. Produksjon forblir blokkert til faktisk evidens
          er faglig kontrollert og godkjent.
        </p>
        <div className="completion-card__actions">
          <button className="button button--primary" type="button" onClick={onBeginConnect}>
            Fortsett til Forbindelsesbroen
          </button>
          <button className="button button--secondary" type="button" onClick={onOpenCampaign}>
            Se evidens og neste steg
          </button>
        </div>
      </div>
    </section>
  )
}
