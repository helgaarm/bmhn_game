# Gate C performance protocol

## Current status

Gate C is **not approved**. The checked-in profile is intentionally `draft`; reference hardware, operating system, browser version, thresholds, approver, and approval date remain unset. Local diagnostics and measurement captures are evidence inputs, not a release verdict.

## Files and command

- Draft profile: `performance/gate-c.profile.json`.
- Pure validator and evaluator: `src/game/performance/gateC.ts`.
- Production-build capture: `performance/gate-c.spec.ts`.
- Run with `npm run test:gate-c`.

The command builds the application, serves the production output, runs one warm-up plus five measured runs in a single Chromium worker, and writes an ignored `gate-c-capture.json` test artifact. Until the profile is approved, every report is labelled `measurement-only` and `not-evaluated`.

## Required agreement before approval

The product and technical owners must record:

1. Reference CPU, GPU, memory, power mode, operating system and version.
2. Supported browser, exact version or managed channel, viewport and device scale factor.
3. Network profile, including whether load is local, cached, or shaped.
4. Warm-up count, measured run count and FPS sampling duration.
5. Maximum first-frame p95 and minimum FPS p50 and p05.
6. Whether Chromium heap is a gate or diagnostic only.
7. Approval owner, date, evidence location and revalidation trigger.

## Evaluation behaviour

- The evaluator refuses draft, incomplete, malformed, or unapproved profiles.
- It refuses the wrong number of measured runs or missing FPS samples.
- It reports first-frame p95, FPS p50, FPS p05 and optional maximum heap.
- A failure retains every breached metric and reason; it never converts a failed run to a warning.
- Headless capture is repeatable engineering evidence but does not replace inspection on the agreed physical device.

## Revalidation triggers

Re-run Gate C after material 3D/physics dependency changes, new runtime assets, lighting or shadow changes, route/bundle changes, supported-browser changes, or modifications to the reference device/profile. Formal results should be retained as release evidence, while routine local captures remain ignored.
