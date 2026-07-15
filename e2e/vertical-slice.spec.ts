import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('completes the accessible Phase 1 vertical slice', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Bygg med Helsenorge' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Gå inn i visningshallen' }).click()
  await expect(
    page.getByRole('heading', { name: 'Visningshallen', exact: true }),
  ).toBeVisible()

  if (process.env.VISUAL_REVIEW === '1') {
    await page.screenshot({
      path: testInfo.outputPath('phase-1-game.png'),
      fullPage: true,
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
  const gameResults = await new AxeBuilder({ page }).analyze()
  expect(gameResults.violations).toEqual([])
})
