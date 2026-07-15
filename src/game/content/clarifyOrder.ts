import type { ProductionRuleId } from '../compliance/productionRuleSchema'

export type ClarifyWorkstreamId =
  | 'purpose-and-privacy'
  | 'risk-and-dpia'
  | 'service-readiness'

export type ClarifyRoleId =
  | 'need-owner'
  | 'privacy-legal'
  | 'security-privacy'
  | 'product-integration'

export type ClarifyDecisionId =
  | 'request-professional-review'
  | 'approve-from-prototype'
  | 'choose-technology-now'

export type RiskDispositionId = 'screen-and-assess' | 'prototype-means-no-risk'

export const clarifyOrder = {
  id: 'clarify-order',
  title: 'Avklare og bestille',
  level: 'N2 · Ansvarslageret',
  learningObjective:
    'Gjør omfang, ansvar, informasjonsflyt, avhengigheter og åpne godkjenninger tydelige før laget velger teknisk vei.',
  scenario: {
    organisation: 'Fjordglimt kommune',
    summary:
      'Teamet skal lage et syntetisk bestillingsgrunnlag for den tidligere beskrevne situasjonen. Dokumentet er læringsevidens og kan ikke brukes som produksjonsgodkjenning.',
  },
  npc: {
    name: 'Nor',
    role: 'Lagerforvalter',
    dialogue: [
      'I Ansvarslageret får hver avhengighet en synlig plass og en navngitt eier.',
      'Vi dokumenterer hva som må avklares. Vi later ikke som en prototype har juridisk eller sikkerhetsfaglig godkjenning.',
      'Beskriv behovets omfang og informasjonsflyt før dere navngir tjeneste og gjeldende dokumentasjon. Først deretter kan laget vurdere en teknisk forbindelse.',
    ],
  },
  roles: [
    { id: 'need-owner', label: 'Behovseier' },
    { id: 'privacy-legal', label: 'Personvernjurist eller personvernombud' },
    { id: 'security-privacy', label: 'Sikkerhetsansvarlig og personvernombud' },
    { id: 'product-integration', label: 'Produkteier og integrasjonsarkitekt' },
  ] as const,
  workstreams: [
    {
      id: 'purpose-and-privacy',
      ruleId: 'co-purpose-legal-basis',
      title: 'Formål og behandlingsrammer',
      summary:
        'Dokumenter konkret formål, behandlingsroller og opplysningsrammer. Foreslått behandlingsgrunnlag må vurderes faglig.',
      correctRoleId: 'privacy-legal',
    },
    {
      id: 'risk-and-dpia',
      ruleId: 'co-risk-dpia',
      title: 'Risiko og DPIA-screening',
      summary:
        'Planlegg risikovurdering og avgjør med begrunnelse om en vurdering av personvernkonsekvenser er nødvendig.',
      correctRoleId: 'security-privacy',
    },
    {
      id: 'service-readiness',
      ruleId: 'co-need-before-connection',
      title: 'Behov før forbindelsestype',
      summary:
        'Navngi informasjonsflyt, dataretning, tjeneste, tjenesteeier og dokumentasjonsstatus før teknisk forbindelse velges.',
      correctRoleId: 'product-integration',
    },
  ] as const satisfies readonly {
    id: ClarifyWorkstreamId
    ruleId: ProductionRuleId
    title: string
    summary: string
    correctRoleId: ClarifyRoleId
  }[],
  riskDispositions: [
    {
      id: 'screen-and-assess',
      label: 'Bestill risikovurdering og DPIA-screening før behandling starter',
      acceptable: true,
    },
    {
      id: 'prototype-means-no-risk',
      label: 'Hopp over vurdering fordi løsningen foreløpig er en prototype',
      acceptable: false,
    },
  ] as const,
  decisions: [
    {
      id: 'request-professional-review',
      label:
        'Bestill faglige vurderinger, behold status åpen og send avklart grunnlag videre',
      completesGate: true,
      consequence:
        'Læringsporten åpnes. Produksjonsporten forblir blokkert til riktige fagroller har kontrollert faktisk evidens.',
    },
    {
      id: 'approve-from-prototype',
      label: 'Marker reglene som produksjonsgodkjent ut fra prototypen',
      completesGate: false,
      consequence:
        'En prototype kan vise arbeidsflyt, men kan ikke gi juridisk, sikkerhetsfaglig eller tjenestefaglig godkjenning.',
    },
    {
      id: 'choose-technology-now',
      label: 'Velg FHIR, SMART eller HelseID nå for å komme raskere videre',
      completesGate: false,
      consequence:
        'Teknologien kan ikke velges før den navngitte tjenesten, aktørene, informasjonsflyten og gjeldende dokumentasjon støtter valget.',
    },
  ] as const,
  sources: [
    {
      id: 'strategy-journey',
      title: 'Bygg med Helsenorge · aktørreisen',
      note:
        'Steget følger rapportens rekkefølge: behov og ansvar avklares før tilkoblingsvalg.',
    },
    {
      id: 'production-rule-register',
      title: 'Versjonert produksjonsregelregister',
      note:
        'Reglene brukes i læringsporten. Registeret markerer dem fortsatt som avventende faglig produksjonsgodkjenning.',
    },
  ],
} as const
