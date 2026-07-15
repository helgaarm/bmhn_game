import type { ProductionRuleId } from '../compliance/productionRuleSchema'

export type ConnectServiceId = 'citizen-dialogue' | 'professional-fhir'
export type ConnectRouteId =
  | 'service-owner-dialogue'
  | 'helseid-fhir-test'
  | 'browser-secret'
export type ConnectDecisionId = 'record-learning-evidence' | 'approve-production'

export const connect = {
  id: 'connect',
  title: 'Koble på',
  level: 'N2 · Forbindelsesbroen',
  learningObjective:
    'Velg samarbeids- og forbindelsesvei fra dokumentert aktørtype og tjenestekapasitet, og behold produksjonsporten stengt til faktisk evidens er godkjent.',
  scenario: {
    organisation: 'Fjordglimt kommune',
    summary:
      'Bestillingsgrunnlaget skal nå kobles til én av to syntetiske tjenestekontekster. Kortene er læringsdata, ikke dokumentasjon av virkelige tjenester.',
  },
  npc: {
    name: 'Nor',
    role: 'Brobygger',
    dialogue: [
      'På Forbindelsesbroen begynner vi med tjenestens dokumenterte kapasitet, ikke med en teknologi vi liker.',
      'Samme behov kan gi ulike veier. Aktørtype og tjenestedokumentasjon avgjør om HelseID, FHIR eller SMART er relevant.',
      'Her registrerer vi læringsevidens. Produksjon forblir blokkert til riktig instans har kontrollert faktisk løsning og gjeldende dokumentasjon.',
    ],
  },
  services: [
    {
      id: 'citizen-dialogue',
      title: 'Syntetisk innbyggerdialog',
      actorType: 'Innbygger',
      owner: 'Syntetisk tjenesteeier A',
      documentation:
        'Læringskort 2026-07-15: kortet annonserer ikke HelseID, FHIR eller SMART.',
      advertisedCapabilities: [] as const,
      correctRouteId: 'service-owner-dialogue',
    },
    {
      id: 'professional-fhir',
      title: 'Syntetisk fagflate med FHIR',
      actorType: 'Helsepersonell og fagsystem',
      owner: 'Syntetisk tjenesteeier B',
      documentation:
        'Læringskort 2026-07-15: HelseID i test og FHIR R4 4.0.1 er annonsert; SMART er ikke annonsert.',
      advertisedCapabilities: ['HelseID', 'FHIR R4 4.0.1'] as const,
      correctRouteId: 'helseid-fhir-test',
    },
  ] as const satisfies readonly {
    id: ConnectServiceId
    title: string
    actorType: string
    owner: string
    documentation: string
    advertisedCapabilities: readonly string[]
    correctRouteId: ConnectRouteId
  }[],
  routes: [
    {
      id: 'service-owner-dialogue',
      label:
        'Avklar videre med tjenesteeier uten å anta HelseID, FHIR eller SMART',
      consequence:
        'Riktig for et tjenestekort som ikke annonserer en teknisk forbindelse.',
    },
    {
      id: 'helseid-fhir-test',
      label:
        'Bruk konfidensiell backend, start HelseID i test og bekreft FHIR-versjon og profiler',
      consequence:
        'Riktig når tjenestekortet uttrykkelig annonserer HelseID og FHIR, men ikke SMART.',
    },
    {
      id: 'browser-secret',
      label: 'Legg klienthemmeligheten i nettleseren og anta SMART-støtte',
      consequence:
        'Avvises: kortet annonserer ikke SMART, og en hemmelighet skal ikke ligge i nettleserkode.',
    },
  ] as const satisfies readonly {
    id: ConnectRouteId
    label: string
    consequence: string
  }[],
  decisions: [
    {
      id: 'record-learning-evidence',
      label:
        'Registrer betinget læringsevidens og behold produksjonsporten blokkert',
      completesGate: true,
      consequence:
        'Læringsporten åpnes. Designarbeid kan forberedes, men ingen produksjonsgodkjenning er gitt.',
    },
    {
      id: 'approve-production',
      label: 'Godkjenn produksjon fra det syntetiske tjenestekortet',
      completesGate: false,
      consequence:
        'Et syntetisk kort og en spillbeslutning kan ikke erstatte tjenesteeiers og faginstansenes godkjenning.',
    },
  ] as const,
  requiredRuleIds: [
    'cn-helseid-suitability',
    'cn-helseid-production',
    'cn-helseid-client',
    'cn-fhir-conformance',
    'cn-smart-launch',
  ] as const satisfies readonly ProductionRuleId[],
  sources: [
    {
      id: 'strategy-journey',
      title: 'Bygg med Helsenorge · aktørreisen',
      note: 'Connect følger etter at behov, aktører, ansvar og dokumentasjonsstatus er avklart.',
    },
    {
      id: 'production-rule-register',
      title: 'Versjonert produksjonsregelregister',
      note: 'Reglene er kildebundet, men avventer fortsatt faglig verifikasjon før produksjon.',
    },
  ],
} as const
