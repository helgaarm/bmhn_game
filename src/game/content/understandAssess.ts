export const understandAssess = {
  id: 'fjordglimt-understand-assess',
  version: 1,
  title: 'Speilene rundt behovet',
  level: 'N1 Speilsalen',
  learningObjective:
    'Spilleren kan beskrive hvem som berøres, hvilken verdi laget forventer, og hvilken usikkerhet som må undersøkes før bestilling.',
  scenario: {
    organisation: 'Fjordglimt kommune',
    summary:
      'Laget har beskrevet behovet. Nå må de undersøke hvordan situasjonen ser ut for flere berørte aktører, uten å gjøre antakelser til fakta.',
    dataClassification: 'syntetisk',
  },
  npc: {
    name: 'Nor',
    role: 'Kildebundet veiviser',
    dialogue: [
      'Et tydelig behov er bare starten. I Speilsalen ser vi samme situasjon fra flere aktørers ståsted.',
      'Forventet verdi er noe laget ønsker å oppnå, ikke et løfte. Skriv derfor også ned hva dere ennå ikke vet.',
      'Velg berørte aktører, beskriv forventet verdi og behold minst én viktig usikkerhet synlig før dere går videre.',
    ],
  },
  actors: [
    {
      id: 'citizen',
      label: 'Innbygger',
      role: 'Skal forstå og forberede seg',
      perspective: 'Trenger et forståelig og sammenhengende tilbud.',
      openQuestion: 'Hvilke behov og forutsetninger varierer mellom innbyggere?',
    },
    {
      id: 'clinician',
      label: 'Behandler',
      role: 'Følger opp avtalen',
      perspective: 'Trenger at forberedelsen støtter møtet uten å skape merarbeid.',
      openQuestion: 'Hvordan påvirkes arbeidsflyt og ansvar?',
    },
    {
      id: 'service-owner',
      label: 'Tjenesteeier',
      role: 'Har ansvar for tilbudet',
      perspective: 'Trenger et tydelig mål og grunnlag for å følge opp verdi.',
      openQuestion: 'Hvem eier resultatet og hvordan kan det følges opp?',
    },
    {
      id: 'support-team',
      label: 'Støtteteam',
      role: 'Hjelper når den vanlige veien ikke fungerer',
      perspective: 'Trenger synlige støttebehov og realistiske kontaktveier.',
      openQuestion: 'Hvem trenger hjelp, og når må en alternativ vei finnes?',
    },
  ],
  decisions: [
    {
      id: 'carry-uncertainty-forward',
      label: 'Gå videre med åpne spørsmål synlig og gi noen ansvar for å undersøke dem',
      consequence:
        'Porten åpner seg. Laget kan forklare forventet verdi, berørte aktører og hva som fortsatt må undersøkes.',
      completesGate: true,
    },
    {
      id: 'assume-shared-needs',
      label: 'Anta at alle aktørene har samme behov',
      consequence:
        'Porten forblir stengt. Et felles mål betyr ikke at aktørene har samme perspektiv, ansvar eller hindringer.',
      completesGate: false,
    },
    {
      id: 'hide-uncertainty',
      label: 'Fjern usikkerheten fra vurderingen og bestill nå',
      consequence:
        'Porten forblir stengt. Usikkerheten forsvinner ikke når den utelates; laget mister bare muligheten til å undersøke den.',
      completesGate: false,
    },
  ],
  sources: [
    {
      id: 'strategy-journey',
      title: 'Ni-trinns aktørreise',
      note: 'Læringsdesignet bruker rapportens steg for å forstå verdi, aktører og usikkerhet. Det interne kildedokumentet distribueres ikke.',
    },
    {
      id: 'technical-boundary',
      title: 'Teknisk avgrensning',
      note: 'Vurderingen gjelder behov og innsikt. Den avgjør ikke integrasjon, personvern, sikkerhet eller produksjonsgodkjenning.',
    },
  ],
} as const

export type AssessmentActorId = (typeof understandAssess.actors)[number]['id']
export type AssessmentDecisionId = (typeof understandAssess.decisions)[number]['id']
