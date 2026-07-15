import { readFile, writeFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import type { GateCProfile } from '../src/game/performance/gateC'

interface CapturedMeasurement {
  run: number
  firstFrameMs: number
  fpsSamples: number[]
  heapMb: number | null
}

test('captures a measurement-only Gate C report', async ({ page }, testInfo) => {
  const profile = JSON.parse(
    await readFile(new URL('./gate-c.profile.json', import.meta.url), 'utf8'),
  ) as GateCProfile
  const totalRuns = profile.protocol.warmupRuns + profile.protocol.measuredRuns
  const measurements: CapturedMeasurement[] = []

  for (let run = 1; run <= totalRuns; run += 1) {
    await page.goto('/game')
    await expect(
      page.getByRole('heading', { name: 'Visningshallen', exact: true }),
    ).toBeVisible()
    await expect(page.getByText('Klargjør visningshallen')).toBeHidden()
    await page.getByRole('button', { name: 'Innstillinger' }).click()
    await page.getByRole('button', { name: 'Vis teknisk diagnose' }).click()
    const diagnostics = page.locator('#performance-diagnostics')
    await expect(diagnostics.locator('dd').nth(2)).toHaveText(/^\d+$/)

    const firstFrameText = await diagnostics.locator('dd').nth(1).innerText()
    const fpsSamples = [
      Number.parseInt(await diagnostics.locator('dd').nth(2).innerText(), 10),
    ]
    const additionalSamples = Math.max(
      0,
      Math.floor(profile.protocol.fpsSampleSeconds / 1.5) - 1,
    )
    for (let sample = 0; sample < additionalSamples; sample += 1) {
      await page.waitForTimeout(1500)
      fpsSamples.push(
        Number.parseInt(await diagnostics.locator('dd').nth(2).innerText(), 10),
      )
    }
    const heapText = await diagnostics.locator('dd').nth(3).innerText()
    if (run > profile.protocol.warmupRuns) {
      measurements.push({
        run: run - profile.protocol.warmupRuns,
        firstFrameMs: Number.parseInt(firstFrameText, 10),
        fpsSamples,
        heapMb: heapText === 'Ikke tilgjengelig' ? null : Number.parseInt(heapText, 10),
      })
    }
  }

  const report = {
    kind: 'measurement-only',
    gateStatus: 'not-evaluated',
    reason: 'Reference profile and thresholds are not approved.',
    capturedAt: new Date().toISOString(),
    profile,
    userAgent: await page.evaluate(() => navigator.userAgent),
    measurements,
  }
  const outputPath = testInfo.outputPath('gate-c-capture.json')
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await testInfo.attach('gate-c-capture', {
    path: outputPath,
    contentType: 'application/json',
  })

  expect(measurements).toHaveLength(profile.protocol.measuredRuns)
})
