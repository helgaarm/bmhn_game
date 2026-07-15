import type { Dispatch, FormEvent } from 'react'
import { connect } from '../content/connect'
import type { ConnectEvent, ConnectState } from '../state/connectMachine'

interface ConnectQuestProps {
  state: ConnectState
  dispatch: Dispatch<ConnectEvent>
  onOpenCampaign: () => void
  renderDialogue?: boolean
}

export function ConnectQuest({
  state,
  dispatch,
  onOpenCampaign,
  renderDialogue = true,
}: ConnectQuestProps) {
  if (state.stage === 'locked') return null

  if (state.stage === 'dialogue') {
    if (!renderDialogue) return null
    const isLast = state.dialogueIndex === connect.npc.dialogue.length - 1
    return (
      <section className="dialogue-panel" aria-labelledby="connect-dialogue-speaker">
        <div className="dialogue-panel__portrait" aria-hidden="true">N</div>
        <div>
          <p className="eyebrow" id="connect-dialogue-speaker">
            {connect.npc.name} · {connect.npc.role}
          </p>
          <p>{connect.npc.dialogue[state.dialogueIndex]}</p>
          <button className="button button--primary" type="button" onClick={() => dispatch({ type: 'ADVANCE_DIALOGUE' })}>
            {isLast ? 'Åpne veikartet' : 'Fortsett'}
          </button>
        </div>
      </section>
    )
  }

  if (state.stage === 'route-map') {
    const submit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      dispatch({ type: 'SUBMIT_ROUTE' })
    }
    return (
      <form className="casebuilder connect-map" onSubmit={submit}>
        <div className="casebuilder__heading">
          <div>
            <p className="eyebrow">Forbindelsesbroen · betinget veikart</p>
            <h2>{connect.scenario.organisation}</h2>
          </div>
          <span className="data-badge">Kun syntetiske data</span>
        </div>
        <p>{connect.scenario.summary}</p>
        <p className="approval-boundary" role="note">
          <strong>Læringsevidens – ikke produksjonsgodkjenning.</strong> Tjenestekortene er laget for spillet og må ikke tolkes som dokumentasjon av en virkelig tjeneste.
        </p>

        <fieldset>
          <legend>1. Velg dokumentert tjenestekontekst</legend>
          <div className="service-card-grid">
            {connect.services.map((service) => (
              <label className="service-card" key={service.id}>
                <input
                  type="radio"
                  name="connect-service"
                  checked={state.selectedServiceId === service.id}
                  onChange={() => dispatch({ type: 'SELECT_SERVICE', serviceId: service.id })}
                />
                <span>
                  <strong>{service.title}</strong>
                  <small>Aktør: {service.actorType}</small>
                  <small>Eier: {service.owner}</small>
                  <small>{service.documentation}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>2. Velg vei som tjenestekortet faktisk støtter</legend>
          <div className="choice-grid choice-grid--single-column">
            {connect.routes.map((route) => (
              <label key={route.id}>
                <input
                  type="radio"
                  name="connect-route"
                  checked={state.selectedRouteId === route.id}
                  onChange={() => dispatch({ type: 'SELECT_ROUTE', routeId: route.id })}
                />
                <span>{route.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="connect-rationale">3. Begrunn valget fra aktørtype og dokumentert kapasitet</label>
        <textarea
          id="connect-rationale"
          rows={3}
          value={state.rationale}
          onChange={(event) => dispatch({ type: 'SET_RATIONALE', value: event.target.value })}
          placeholder="Tjenestekortet viser ... Derfor velger vi ..."
        />

        {state.feedback && <p className="feedback feedback--warning" role="alert">{state.feedback}</p>}
        <button className="button button--primary" type="submit">Prøv forbindelsesporten</button>
      </form>
    )
  }

  if (state.stage === 'gate') {
    const service = connect.services.find((item) => item.id === state.selectedServiceId)
    const route = connect.routes.find((item) => item.id === state.selectedRouteId)
    return (
      <section className="decision-gate" aria-labelledby="connect-gate-title">
        <p className="eyebrow">Forbindelsesport</p>
        <h2 id="connect-gate-title">Hva kan laget registrere nå?</h2>
        <dl className="assessment-summary">
          <div><dt>Tjenestekort</dt><dd>{service?.title}</dd></div>
          <div><dt>Valgt vei</dt><dd>{route?.label}</dd></div>
          <div><dt>Begrunnelse</dt><dd>{state.rationale}</dd></div>
          <div><dt>Produksjonsstatus</dt><dd>Blokkert – faglig verifikasjon gjenstår</dd></div>
        </dl>
        <div className="decision-list">
          {connect.decisions.map((decision) => (
            <button key={decision.id} type="button" onClick={() => dispatch({ type: 'CHOOSE_DECISION', decisionId: decision.id })}>
              <span aria-hidden="true">◇</span>{decision.label}
            </button>
          ))}
        </div>
        {state.feedback && <p className={`feedback${state.unsuccessfulAttempts ? ' feedback--warning' : ''}`} role="status">{state.feedback}</p>}
      </section>
    )
  }

  return (
    <section className="completion-card" aria-labelledby="connect-completion-title">
      <span className="completion-card__sigil" aria-hidden="true">✓</span>
      <div>
        <p className="eyebrow">Betinget forbindelsesvei dokumentert</p>
        <h2 id="connect-completion-title">Forbindelsesporten er åpen</h2>
        <p>{state.feedback}</p>
        <p><strong>Læringspoeng:</strong> Tjenestens dokumenterte kapasitet avgjør hvilke regler som er relevante. Produksjon forblir blokkert til reglene er kontrollert mot den faktiske tjenesten.</p>
        <button className="button button--primary" type="button" onClick={onOpenCampaign}>Se evidens og neste steg</button>
      </div>
    </section>
  )
}
