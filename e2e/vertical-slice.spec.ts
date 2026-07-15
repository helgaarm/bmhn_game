import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function exerciseCameraControls(page: Page) {
  const canvas = page.locator('canvas')
  const box = await canvas.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.43, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.press('KeyQ')
  await page.keyboard.press('KeyC')
}

test('completes the first four stages through Connect', async ({ page }, testInfo) => {
  test.setTimeout(300_000)
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Bygg med Helsenorge' }),
  ).toBeVisible()

  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('nhn-branded-home.png'),
      fullPage: true,
    })
  }

  await page.getByRole('link', { name: 'Gå inn i visningshallen' }).click()
  await expect(
    page.getByRole('heading', { name: 'Visningshallen', exact: true }),
  ).toBeVisible()
  await exerciseCameraControls(page)

  if (process.env.VISUAL_REVIEW === '1') {
    await page.waitForTimeout(1800)
    await page.screenshot({
      path: testInfo.outputPath('nhn-branded-game.png'),
      fullPage: false,
    })
  }

  await page.getByRole('button', { name: 'Bruk tilgjengelig 2D-vei' }).click()
  await page.getByRole('button', { name: 'Snakk med Nor' }).click()

  const inGameDialogue = page.getByLabel('Dialog med Nor')
  const dialogueToggle = inGameDialogue.locator('.in-game-dialogue__toggle')
  await expect(dialogueToggle).toHaveAttribute('aria-expanded', 'false')
  if (process.env.VISUAL_REVIEW === '1') {
    await page.locator('.canvas-container').screenshot({
      path: testInfo.outputPath('phase-2-dialogue-overlay-blurred.png'),
    })
  }
  await inGameDialogue.hover()
  await expect(dialogueToggle).toHaveAttribute('aria-expanded', 'true')
  await page.locator('.world-shell__heading').hover()
  await expect(dialogueToggle).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('KeyT')
  await expect(dialogueToggle).toHaveAttribute('aria-expanded', 'true')

  if (process.env.VISUAL_REVIEW === '1') {
    await page.locator('.canvas-container').screenshot({
      path: testInfo.outputPath('phase-2-dialogue-overlay.png'),
    })
  }

  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Åpne Casebuilder' }).click()

  await page.getByLabel('Hvilket konkret behov skal laget forstå?').fill(
    'Innbyggeren trenger tydelig hjelp til å forberede seg til avtalen.',
  )
  await page.getByLabel('Innbygger som skal forberede seg').check()
  await page.getByRole('button', { name: 'Prøv avhengighetsporten' }).click()

  await page
    .getByRole('button', { name: 'Velg en tilkoblingstype med en gang' })
    .click()
  await expect(page.getByText(/Porten forblir stengt/)).toBeVisible()

  await page
    .getByRole('button', {
      name: 'Avklar behov, målgruppe og rammer med de berørte aktørene',
    })
    .click()

  await expect(
    page.getByRole('heading', { name: 'Porten til forståelse er åpen' }),
  ).toBeVisible()
  await expect(page.getByText('Klar for neste steg', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Kampanje', exact: true }).click()
  const campaignDialog = page.getByRole('dialog', {
    name: 'Fjordglimt: Fra behov til trygg avslutning',
  })
  await expect(campaignDialog).toBeVisible()
  await expect(campaignDialog.getByText('1 av 9 steg fullført')).toBeVisible()
  await expect(
    campaignDialog.getByRole('button', { name: /Forstå og vurdere.*Aktiv/ }),
  ).toBeVisible()

  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('phase-2-campaign-dashboard.png'),
      fullPage: false,
    })
  }

  await campaignDialog.getByRole('tab', { name: /Regler \(11\)/ }).click()
  await expect(
    campaignDialog.getByText(/Blokkert.*faglig verifikasjon og godkjenning/),
  ).toBeVisible()
  await expect(
    campaignDialog.getByRole('heading', { name: 'HelseID-klientarkitektur' }),
  ).toBeVisible()
  await expect(
    campaignDialog.getByText('11 anvendelsesvurderinger mangler'),
  ).toBeVisible()
  const ruleResults = await new AxeBuilder({ page })
    .include('.production-rules')
    .analyze()
  expect(ruleResults.violations).toEqual([])

  await campaignDialog.getByRole('tab', { name: /Beslutningsjournal/ }).click()
  await expect(
    campaignDialog.getByRole('heading', {
      name: 'Avklar behov, målgruppe og rammer med de berørte aktørene',
    }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', { name: 'Lukk' }).click()

  await page.getByRole('button', { name: 'Fortsett til Speilsalen' }).click()
  await expect(
    page.getByRole('heading', { name: 'Porten til Speilsalen', exact: true }),
  ).toBeVisible()
  await page.locator('canvas').click()
  await page.keyboard.down('ArrowUp')
  try {
    await expect(
      page.getByRole('heading', { name: 'Speilsalen', exact: true }),
    ).toBeVisible()
  } finally {
    await page.keyboard.up('ArrowUp')
  }
  await page.evaluate(() => new Promise(requestAnimationFrame))
  await exerciseCameraControls(page)
  if (process.env.VISUAL_REVIEW === '1') {
    await page.locator('.canvas-container').screenshot({
      path: testInfo.outputPath('phase-2-mirror-hall-world.png'),
    })
  }
  await page.keyboard.press('KeyT')
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Åpne aktørkartet' }).click()

  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('phase-2-speilsalen.png'),
      fullPage: false,
    })
    await page.locator('.actor-map').screenshot({
      path: testInfo.outputPath('phase-2-actor-map.png'),
    })
  }

  const actorMapResults = await new AxeBuilder({ page })
    .include('.actor-map')
    .analyze()
  expect(actorMapResults.violations).toEqual([])

  await page.getByRole('button', { name: 'Prøv usikkerhetsporten' }).click()
  await expect(page.getByText('Velg minst 3 berørte aktører')).toBeVisible()

  await page.getByRole('checkbox', { name: /^Behandler/ }).check()
  await page.getByRole('checkbox', { name: /^Tjenesteeier/ }).check()
  await page.getByLabel(
    'Hvilken verdi forventer laget dersom behovet blir bedre forstått?',
  ).fill('Innbyggeren kan møte bedre forberedt og forstå hva som skal skje.')
  await page.getByLabel(
    'Hvilken viktig usikkerhet må undersøkes videre?',
  ).fill('Laget vet ennå ikke hvilke grupper som trenger en alternativ støttevei.')
  await page.getByRole('button', { name: 'Prøv usikkerhetsporten' }).click()

  await page.getByRole('button', {
    name: 'Fjern usikkerheten fra vurderingen og bestill nå',
  }).click()
  await expect(page.getByText(/Usikkerheten forsvinner ikke/)).toBeVisible()

  await page.getByRole('button', {
    name: 'Gå videre med åpne spørsmål synlig og gi noen ansvar for å undersøke dem',
  }).click()
  await expect(
    page.getByRole('heading', { name: 'Speilsalens port er åpen' }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Se evidens og neste steg' }).click()
  await expect(campaignDialog.getByText('2 av 9 steg fullført')).toBeVisible()
  await expect(
    campaignDialog.getByRole('button', { name: /Avklare og bestille.*Aktiv/ }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', { name: /Forstå og vurdere.*Fullført/ }).click()
  await expect(campaignDialog.getByText(/Aktørbilde: Innbygger, Behandler, Tjenesteeier/)).toBeVisible()
  await expect(campaignDialog.getByText(/Åpen usikkerhet: Laget vet ennå ikke/)).toBeVisible()

  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('phase-2-understand-assess-complete.png'),
      fullPage: false,
    })
  }

  await campaignDialog.getByRole('tab', { name: /Beslutningsjournal \(2\)/ }).click()
  await expect(
    campaignDialog.getByRole('heading', {
      name: 'Gå videre med åpne spørsmål synlig og gi noen ansvar for å undersøke dem',
    }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', { name: 'Lukk' }).click()

  await page.getByRole('button', { name: 'Fortsett til Ansvarslageret' }).click()
  await expect(
    page.getByRole('heading', { name: 'Ansvarslageret', exact: true }),
  ).toBeVisible()
  await exerciseCameraControls(page)
  if (process.env.VISUAL_REVIEW === '1') {
    await page.evaluate(() => new Promise(requestAnimationFrame))
    await page.locator('.canvas-container').screenshot({
      path: testInfo.outputPath('phase-2-responsibility-warehouse-world.png'),
    })
  }

  await page.keyboard.press('KeyT')
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Åpne bestillingssiden' }).click()

  const orderSheetResults = await new AxeBuilder({ page })
    .include('.order-sheet')
    .analyze()
  expect(orderSheetResults.violations).toEqual([])

  await page.getByRole('button', { name: 'Prøv ansvarsporten' }).click()
  await expect(page.getByText(/Formål og omfang må beskrives/)).toBeVisible()

  await page.getByLabel('Formål og avgrenset omfang').fill(
    'Innbyggeren skal kunne forberede dialogen; diagnostikk og behandling er utenfor.',
  )
  await page.getByLabel('Informasjonsflyt og dataretning').fill(
    'Innbyggeren gir forberedende opplysninger til kommunen og mottar en oppsummering tilbake.',
  )
  await page.getByLabel(
    'Navngitt tjeneste, tjenesteeier og dokumentasjonsstatus',
  ).fill(
    'Aktuell Helsenorge-tjeneste og tjenesteeier må navngis; gjeldende dokumentasjon skal kontrolleres.',
  )
  await page.locator('#owner-purpose-and-privacy').selectOption('privacy-legal')
  await page.locator('#owner-risk-and-dpia').selectOption('security-privacy')
  await page.locator('#owner-service-readiness').selectOption('product-integration')
  await page.getByRole('radio', {
    name: 'Bestill risikovurdering og DPIA-screening før behandling starter',
  }).check()
  await page.getByRole('button', { name: 'Prøv ansvarsporten' }).click()

  await page.getByRole('button', {
    name: 'Velg FHIR, SMART eller HelseID nå for å komme raskere videre',
  }).click()
  await expect(page.getByText(/Teknologien kan ikke velges/)).toBeVisible()
  await page.getByRole('button', {
    name: 'Bestill faglige vurderinger, behold status åpen og send avklart grunnlag videre',
  }).click()
  await expect(
    page.getByRole('heading', { name: 'Ansvarsporten er åpen' }),
  ).toBeVisible()
  await expect(page.getByText(/Produksjon forblir blokkert/)).toBeVisible()

  await page.getByRole('button', { name: 'Se evidens og neste steg' }).click()
  await expect(campaignDialog.getByText('3 av 9 steg fullført')).toBeVisible()
  await expect(
    campaignDialog.getByRole('button', { name: /Koble på.*Aktiv/ }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', {
    name: /Avklare og bestille.*Fullført/,
  }).click()
  await expect(
    campaignDialog.getByText(/Produksjonsstatus: blokkert/),
  ).toBeVisible()
  await campaignDialog.getByRole('tab', { name: /Beslutningsjournal \(3\)/ }).click()
  await expect(
    campaignDialog.getByRole('heading', {
      name: 'Bestill faglige vurderinger, behold status åpen og send avklart grunnlag videre',
    }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', { name: 'Lukk' }).click()

  await page.getByRole('button', { name: 'Fortsett til Forbindelsesbroen' }).click()
  await expect(page.getByRole('heading', { name: 'Forbindelsesbroen', exact: true })).toBeVisible()
  await page.keyboard.press('KeyT')
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Fortsett' }).click()
  await page.getByRole('button', { name: 'Åpne veikartet' }).click()

  await page.getByRole('radio', { name: /Syntetisk fagflate med FHIR/ }).check()
  await page.getByRole('radio', { name: 'Legg klienthemmeligheten i nettleseren og anta SMART-støtte' }).check()
  await page.getByLabel('3. Begrunn valget fra aktørtype og dokumentert kapasitet').fill(
    'Tjenestekortet navngir helsepersonell, HelseID i test og FHIR R4, men ikke SMART.',
  )
  await page.getByRole('button', { name: 'Prøv forbindelsesporten' }).click()
  await expect(page.getByText(/Avvises/)).toBeVisible()
  await page.getByRole('radio', { name: /Bruk konfidensiell backend/ }).check()
  await page.getByRole('button', { name: 'Prøv forbindelsesporten' }).click()
  await page.getByRole('button', { name: 'Godkjenn produksjon fra det syntetiske tjenestekortet' }).click()
  await expect(page.getByText(/kan ikke erstatte/)).toBeVisible()
  await page.getByRole('button', { name: 'Registrer betinget læringsevidens og behold produksjonsporten blokkert' }).click()
  await expect(page.getByRole('heading', { name: 'Forbindelsesporten er åpen' })).toBeVisible()

  const connectResults = await new AxeBuilder({ page }).include('.completion-card').analyze()
  expect(connectResults.violations).toEqual([])
  await page.getByRole('button', { name: 'Se evidens og neste steg' }).click()
  await expect(campaignDialog.getByText('4 av 9 steg fullført')).toBeVisible()
  await expect(campaignDialog.getByRole('button', { name: /Designe og bygge.*Aktiv/ })).toBeVisible()
  await campaignDialog.getByRole('button', { name: 'Lukk' }).click()

  await page.getByRole('button', { name: 'Innstillinger' }).click()
  await expect(page.getByText(/Lagret lokalt kl\./)).toBeVisible()
  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('phase-2-local-save.png'),
      fullPage: false,
    })
  }
  await page.getByRole('button', { name: 'Innstillinger' }).click()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Forbindelsesbroen', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Forbindelsesporten er åpen' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kampanje', exact: true }).click()
  await expect(campaignDialog.getByText('4 av 9 steg fullført')).toBeVisible()
})

test('Rapier blocks the player at the locked gate and showroom wall', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('/game')
  await expect(page.getByText('Klargjør visningshallen')).toBeHidden()

  await page.getByRole('button', { name: 'Innstillinger' }).click()
  await page.getByRole('button', { name: 'Vis teknisk diagnose' }).click()
  const position = page.getByTestId('player-position')
  const cameraCollision = page.getByTestId('camera-collision-status')
  await expect(position).not.toHaveText('Måler')
  await expect(cameraCollision).toContainText('Beskyttet')

  const readPosition = async () => {
    const values = (await position.textContent())
      ?.split(',')
      .map((value) => Number(value.trim()))
    expect(values).toHaveLength(3)
    return values ?? [0, 0, 0]
  }

  await page.locator('canvas').click({ position: { x: 120, y: 300 } })
  await page.keyboard.down('KeyD')
  await page.waitForTimeout(700)
  await page.keyboard.up('KeyD')
  await expect.poll(async () => (await readPosition())[0]).toBeGreaterThan(1)

  await page.keyboard.down('ArrowUp')
  await page.waitForTimeout(3_200)
  await page.keyboard.up('ArrowUp')
  await expect.poll(async () => (await readPosition())[2]).toBeLessThan(-2.5)
  const lockedGatePosition = await readPosition()
  expect(lockedGatePosition[2]).toBeGreaterThan(-3.75)

  await page.keyboard.down('ArrowDown')
  await page.waitForTimeout(1_500)
  await page.keyboard.up('ArrowDown')
  await expect.poll(async () => (await readPosition())[2]).toBeGreaterThan(0)

  await page.keyboard.down('KeyD')
  await page.waitForTimeout(3_200)
  await page.keyboard.up('KeyD')
  await expect.poll(async () => (await readPosition())[0]).toBeGreaterThan(8)
  const wallPosition = await readPosition()
  expect(wallPosition[0]).toBeLessThan(9.8)
})

test('unknown routes have a recovery path', async ({ page }) => {
  await page.goto('/ukjent')
  await expect(
    page.getByRole('heading', { name: 'Denne portalen finnes ikke.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tilbake til inngangen' })).toBeVisible()
})

test('recovers safely from a corrupt local save', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('bmhn.game.save', '{not-json')
  })
  await page.goto('/game')

  await expect(
    page.getByText(
      'Lokal fremdrift kunne ikke valideres og ble forkastet. Spillet startet trygt på nytt.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Finn den lysende veiviseren' })).toBeVisible()
  await expect.poll(async () =>
    page.evaluate(() => {
      const raw = window.localStorage.getItem('bmhn.game.save')
      if (!raw) return null
      return JSON.parse(raw).schemaVersion
    }),
  ).toBe(3)
})

test('landing and game entry have no automatically detectable accessibility violations', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await page.goto('/')
  const landingResults = await new AxeBuilder({ page }).analyze()
  expect(landingResults.violations).toEqual([])

  await page.goto('/game')
  await expect(
    page.getByRole('heading', { name: 'Visningshallen', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Klargjør visningshallen')).toBeHidden()

  await page.getByRole('button', { name: 'Innstillinger' }).click()
  await page.getByRole('button', { name: 'Vis teknisk diagnose' }).click()
  const diagnostics = page.locator('#performance-diagnostics')
  await expect(diagnostics.getByText('Klar', { exact: true })).toBeVisible()
  await expect(diagnostics.locator('dd').nth(1)).toHaveText(/\d+ ms/)
  await expect(diagnostics.locator('dd').nth(2)).toHaveText(/\d+/)
  await page.getByRole('button', { name: 'Innstillinger' }).click()

  const gameResults = await new AxeBuilder({ page }).analyze()
  expect(gameResults.violations).toEqual([])

  await page.getByRole('button', { name: 'Kampanje' }).click()
  const campaignResults = await new AxeBuilder({ page })
    .include('.campaign-modal')
    .analyze()
  expect(campaignResults.violations).toEqual([])

  await page.getByRole('button', { name: 'Lukk' }).click()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Visningshallen', exact: true }),
  ).toBeVisible()
})
