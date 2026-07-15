import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('completes the vertical slice and starts the Phase 2 campaign', async ({ page }, testInfo) => {
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

  if (process.env.VISUAL_REVIEW === '1') {
    await page.waitForTimeout(1800)
    await page.screenshot({
      path: testInfo.outputPath('nhn-branded-game.png'),
      fullPage: false,
    })
  }

  await page.getByRole('button', { name: 'Bruk tilgjengelig 2D-vei' }).click()
  await page.getByRole('button', { name: 'Snakk med Nor' }).click()

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
  await expect(page.getByText('Fullført', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Kampanje' }).click()
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

  await campaignDialog.getByRole('tab', { name: /Beslutningsjournal/ }).click()
  await expect(
    campaignDialog.getByRole('heading', {
      name: 'Avklar behov, målgruppe og rammer med de berørte aktørene',
    }),
  ).toBeVisible()
  await campaignDialog.getByRole('button', { name: 'Lukk' }).click()
})

test('unknown routes have a recovery path', async ({ page }) => {
  await page.goto('/ukjent')
  await expect(
    page.getByRole('heading', { name: 'Denne portalen finnes ikke.' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Tilbake til inngangen' })).toBeVisible()
})

test('landing and game entry have no automatically detectable accessibility violations', async ({
  page,
}) => {
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
