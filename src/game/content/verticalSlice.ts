export const journeySteps = [
  { id: 'discover', label: 'Oppdage', status: 'active' },
  { id: 'understand', label: 'Forstå og vurdere', status: 'next' },
  { id: 'clarify', label: 'Avklare og bestille', status: 'next' },
  { id: 'connect', label: 'Koble på', status: 'locked' },
  { id: 'build', label: 'Designe og bygge', status: 'locked' },
  { id: 'test', label: 'Teste og kvalitetssikre', status: 'locked' },
  { id: 'operate', label: 'Forvalte', status: 'locked' },
  { id: 'improve', label: 'Følge opp og forbedre', status: 'locked' },
  { id: 'close', label: 'Avslutte', status: 'locked' },
] as const

export const verticalSlice = {
  id: 'showroom-first-need',
  version: 1,
  title: 'Lyset i visningshallen',
  level: 'N1 Visningshallen',
  learningObjective:
    'Spilleren kan forklare hvorfor et konkret behov og berørte aktører må beskrives før laget velger tilkoblingsmåte.',
  scenario: {
    organisation: 'Fjordglimt kommune',
    summary:
      'En anonymisert, fiktiv kommune ønsker å hjelpe innbyggere med å forberede seg til en avtale.',
    dataClassification: 'syntetisk',
  },
  npc: {
    name: 'Nor',
    role: 'Kildebundet veiviser',
    dialogue: [
      'Velkommen til visningshallen. Her starter vi med mennesket og situasjonen, ikke med en teknisk løsning.',
      'Fjordglimt kommune har en idé, men laget har ennå ikke beskrevet hvem som trenger hjelpen eller hvilket problem som skal løses.',
      'Formuler behovet og velg den viktigste målgruppen. Da kan avhengighetsporten vurdere om laget er klart for neste steg.',
    ],
  },
  audiences: [
    { id: 'citizen', label: 'Innbygger som skal forberede seg' },
    { id: 'clinician', label: 'Behandler som følger opp avtalen' },
    { id: 'service-owner', label: 'Tjenesteeier som forvalter tilbudet' },
  ],
  decisions: [
    {
      id: 'clarify-need',
      label: 'Avklar behov, målgruppe og rammer med de berørte aktørene',
      consequence:
        'Porten åpner seg. Laget har et etterprøvbart utgangspunkt for å undersøke mulige veier videre.',
      completesGate: true,
    },
    {
      id: 'choose-connection',
      label: 'Velg en tilkoblingstype med en gang',
      consequence:
        'Porten forblir stengt. En tilkoblingstype uten et avklart behov kan låse laget til feil problem.',
      completesGate: false,
    },
    {
      id: 'start-building',
      label: 'Start utvikling og avklar behovet senere',
      consequence:
        'Porten forblir stengt. Arbeidet mangler et felles mål og tydelige akseptansekriterier.',
      completesGate: false,
    },
  ],
  sources: [
    {
      id: 'strategy-journey',
      title: 'Ni-trinns aktørreise og scenario-først-prinsipp',
      note: 'Læringsdesign fra strategirapporten. Selve interne kildedokumentet distribueres ikke i den offentlige løsningen.',
    },
    {
      id: 'technical-boundary',
      title: 'Teknisk avgrensning',
      note: 'Dette vertikalsnittet lærer ikke bort en bestemt integrasjonsregel. Slike regler må kildeverifiseres før de publiseres.',
    },
  ],
} as const

export type DecisionId = (typeof verticalSlice.decisions)[number]['id']
export type AudienceId = (typeof verticalSlice.audiences)[number]['id']
