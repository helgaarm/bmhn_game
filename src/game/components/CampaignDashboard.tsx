import { useEffect, useRef, useState } from 'react'
import { evaluateProductionReadiness } from '../compliance/productionReadiness'
import { productionApprovalState } from '../compliance/productionApprovalState'
import { productionRuleRegistry } from '../compliance/productionRules'
import type { CampaignDefinition } from '../content/campaignSchema'
import type {
  CampaignStageStatus,
  CampaignState,
} from '../state/campaignMachine'

interface CampaignDashboardProps {
  campaign: CampaignDefinition
  state: CampaignState
  open: boolean
  onClose: () => void
}

const statusLabels: Record<CampaignStageStatus, string> = {
  unavailable: 'Ikke tilgjengelig',
  available: 'Tilgjengelig',
  active: 'Aktiv',
  blocked: 'Blokkert',
  ready: 'Klar for port',
  completed: 'Fullført',
  'failed-with-learning': 'Prøv igjen med læring',
}

export function CampaignDashboard({
  campaign,
  state,
  open,
  onClose,
}: CampaignDashboardProps) {
  const [view, setView] = useState<'journey' | 'journal' | 'rules'>('journey')
  const [selectedStageId, setSelectedStageId] = useState(
    state.stages.find((stage) => stage.status === 'active')?.id ??
      campaign.stages[0].id,
  )
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setView('journey')
    const currentStage = state.stages.find((stage) => stage.status === 'active')
    if (currentStage) setSelectedStageId(currentStage.id)
    dialogRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose, open, state.stages])

  if (!open) return null

  const selectedStage =
    campaign.stages.find((stage) => stage.id === selectedStageId) ??
    campaign.stages[0]
  const selectedState = state.stages.find(
    (stage) => stage.id === selectedStage.id,
  )
  const completedCount = state.stages.filter(
    (stage) => stage.status === 'completed',
  ).length
  const productionReadiness = evaluateProductionReadiness(
    productionRuleRegistry,
    productionApprovalState.assessments,
    productionApprovalState.approvals,
  )
  const missingApplicabilityCount = productionReadiness.blockers.filter(
    (blocker) => blocker.kind === 'applicability-missing',
  ).length
  const missingApprovalCount = productionReadiness.blockers.filter(
    (blocker) => blocker.kind === 'approval-missing',
  ).length
  const expiredSourceCount = productionReadiness.blockers.filter(
    (blocker) => blocker.kind === 'source-expired',
  ).length

  return (
    <div className="campaign-modal__backdrop">
      <div
        ref={dialogRef}
        className="campaign-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-modal-title"
        tabIndex={-1}
      >
        <header className="campaign-modal__header">
          <div>
            <p className="eyebrow">Fase 2 · kampanjeryggrad</p>
            <h2 id="campaign-modal-title">{campaign.title}</h2>
            <p>{campaign.summary}</p>
          </div>
          <button
            className="button button--compact button--secondary"
            type="button"
            onClick={onClose}
          >
            Lukk
          </button>
        </header>

        <div className="campaign-progress" aria-label="Kampanjefremdrift">
          <span>{completedCount} av {campaign.stages.length} steg fullført</span>
          <progress value={completedCount} max={campaign.stages.length}>
            {completedCount} av {campaign.stages.length}
          </progress>
        </div>

        <div className="campaign-tabs" role="tablist" aria-label="Kampanjevisning">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'journey'}
            onClick={() => setView('journey')}
          >
            Aktørreise
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'journal'}
            onClick={() => setView('journal')}
          >
            Beslutningsjournal ({state.decisions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'rules'}
            onClick={() => setView('rules')}
          >
            Regler ({productionRuleRegistry.rules.length})
          </button>
        </div>

        {view === 'journey' ? (
          <div className="campaign-modal__body">
            <ol className="campaign-stage-list" aria-label="Kampanjesteg">
              {campaign.stages.map((stage) => {
                const stageState = state.stages.find(
                  (candidate) => candidate.id === stage.id,
                )
                const status = stageState?.status ?? 'unavailable'
                return (
                  <li key={stage.id}>
                    <button
                      type="button"
                      className={stage.id === selectedStage.id ? 'is-selected' : undefined}
                      aria-current={status === 'active' ? 'step' : undefined}
                      onClick={() => setSelectedStageId(stage.id)}
                    >
                      <span>{stage.sequence}</span>
                      <span>
                        <strong>{stage.label}</strong>
                        <small>{stage.zone} · {stage.informationLevel}</small>
                      </span>
                      <em data-status={status}>{statusLabels[status]}</em>
                    </button>
                  </li>
                )
              })}
            </ol>

            <article className="campaign-stage-detail" aria-live="polite">
              <p className="eyebrow">Steg {selectedStage.sequence} · {selectedStage.zone}</p>
              <h3>{selectedStage.label}</h3>
              <p>{selectedStage.objective}</p>

              <dl>
                <div>
                  <dt>Ansvarlig rolle</dt>
                  <dd>{selectedStage.ownerRole}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statusLabels[selectedState?.status ?? 'unavailable']}</dd>
                </div>
              </dl>

              <h4>Inngangskriterium</h4>
              <ul>
                {selectedStage.entryCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))}
              </ul>

              <h4>Nødvendig evidens</h4>
              <ul>
                {selectedStage.exitEvidence.map((evidence) => (
                  <li key={evidence}>{evidence}</li>
                ))}
              </ul>

              {selectedStage.requiredRuleIds.length > 0 && (
                <>
                  <h4>Obligatoriske regler</h4>
                  <ul className="campaign-required-rules">
                    {selectedStage.requiredRuleIds.map((ruleId) => {
                      const rule = productionRuleRegistry.rules.find(
                        (candidate) => candidate.id === ruleId,
                      )
                      return (
                        <li key={ruleId}>
                          <strong>{rule?.title ?? ruleId}</strong>
                          <span>Faglig produksjonsgodkjenning mangler</span>
                        </li>
                      )
                    })}
                  </ul>
                </>
              )}

              {selectedState && selectedState.evidence.length > 0 && (
                <>
                  <h4>Registrert evidens</h4>
                  <ul className="campaign-recorded-evidence">
                    {selectedState.evidence.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                </>
              )}

              <div className="campaign-gate-card">
                <span>Avhengighetsport · {selectedStage.gate.kind}</span>
                <strong>{selectedStage.gate.question}</strong>
                <p>{selectedStage.gate.successCondition}</p>
              </div>
            </article>
          </div>
        ) : view === 'journal' ? (
          <section className="decision-journal" role="tabpanel">
            {state.decisions.length === 0 ? (
              <div className="empty-state">
                <strong>Ingen beslutninger er registrert ennå.</strong>
                <p>Fullfør den første avhengighetsporten for å opprette en sporbar journalpost.</p>
              </div>
            ) : (
              state.decisions.map((decision, index) => (
                <article key={decision.id}>
                  <span>Beslutning {index + 1} · {decision.stageId}</span>
                  <h3>{decision.choice}</h3>
                  <dl>
                    <div><dt>Begrunnelse</dt><dd>{decision.rationale}</dd></div>
                    <div><dt>Rolle</dt><dd>{decision.role}</dd></div>
                    <div><dt>Konsekvens</dt><dd>{decision.consequence}</dd></div>
                    <div><dt>Kilde</dt><dd>{decision.sourceId}</dd></div>
                  </dl>
                </article>
              ))
            )}
          </section>
        ) : (
          <section className="production-rules" role="tabpanel" aria-label="Obligatoriske regler">
            <div className="production-gate" role="status">
              <span>Produksjonsport</span>
              <strong>Blokkert – faglig verifikasjon og godkjenning gjenstår</strong>
              <p>
                Reglene er obligatoriske i læringsløpet, men denne løsningen har
                ingen registrerte myndighets- eller faglige godkjenninger.
              </p>
              <ul>
                <li>{missingApplicabilityCount} anvendelsesvurderinger mangler</li>
                <li>{missingApprovalCount} rollegodkjenninger mangler</li>
                <li>{expiredSourceCount} kilder har passert kontrollfristen</li>
              </ul>
            </div>

            <div className="production-rule-list">
              {productionRuleRegistry.rules.map((rule) => (
                <article key={rule.id} id={`rule-${rule.id}`}>
                  <header>
                    <div>
                      <span>{rule.id}</span>
                      <h3>{rule.title}</h3>
                    </div>
                    <em>Avventer faglig godkjenning</em>
                  </header>
                  <blockquote>{rule.exactClaim}</blockquote>
                  <dl>
                    <div><dt>Gjelder når</dt><dd>{rule.appliesWhen}</dd></div>
                    <div><dt>Tjenesteområde</dt><dd>{rule.serviceScope}</dd></div>
                    <div><dt>Godkjennere</dt><dd>{rule.requiredApproverRoles.join(', ')}</dd></div>
                  </dl>
                  <h4>Forventet evidens</h4>
                  <ul>
                    {rule.expectedEvidence.map((evidence) => (
                      <li key={evidence}>{evidence}</li>
                    ))}
                  </ul>
                  {rule.exceptions.length > 0 && (
                    <details>
                      <summary>Unntak og avgrensninger</summary>
                      <ul>
                        {rule.exceptions.map((exception) => (
                          <li key={exception}>{exception}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="production-rule-sources">
                    {rule.sourceIds.map((sourceId) => {
                      const source = productionRuleRegistry.sources.find(
                        (candidate) => candidate.id === sourceId,
                      )
                      if (!source) return null
                      return (
                        <div key={sourceId}>
                          <strong>{source.title}</strong>
                          <span>
                            {source.version} · kontrollert {source.verifiedAt} · ny kontroll {source.recheckDueAt}
                          </span>
                          {source.urls.map((url, index) => (
                            <a key={url} href={url} target="_blank" rel="noreferrer">
                              Kilde {index + 1}
                            </a>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
