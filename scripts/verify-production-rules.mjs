import { spawnSync } from 'node:child_process'

const result = spawnSync(
  process.execPath,
  [
    'node_modules/vitest/vitest.mjs',
    'run',
    'src/game/compliance/productionApprovalGate.test.ts',
  ],
  {
    env: { ...process.env, PRODUCTION_APPROVAL_GATE: '1' },
    stdio: 'inherit',
  },
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
