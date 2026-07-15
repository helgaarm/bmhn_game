# Phase 2 foundation and campaign start

## Outcome of this increment

Phase 2 now has a validated public campaign spine across all nine actor-journey stages. Discover and Understand and assess are playable: each records evidence and a decision before advancing campaign state. The remaining stages are intentionally informational and unavailable.

## Isolated 3D foundation coverage

| Requirement | Evidence | State |
| --- | --- | --- |
| Lazy Game Mode route | `src/App.tsx`, separate production game chunk | Complete |
| Canvas, camera, lighting, error boundary | `GameCanvas.tsx`, `GameErrorBoundary.tsx` | Complete |
| Controlled loading and fallback | First-frame loading overlay and contained 2D error state | Complete for primitive scene |
| Input abstraction | `input/controlMap.ts` named actions and bindings | Complete for keyboard |
| Primitive placeholder world | Project-authored Three.js geometry | Complete |
| Asset loader contract | Progress, cancellation, fallback, diagnostics plus unit tests | Complete; no external asset loaded |
| Physics when required | Rapier character movement and collision | Complete for current world |
| Route smoke coverage | Landing, direct `/game`, navigation, refresh, unknown route | Complete in Playwright |
| Bundle baseline | Vite production output recorded below | Complete |
| Representative load/memory/FPS baseline | Local opt-in instrumentation exists | Pending approved hardware/protocol |

## Campaign foundation coverage

- Versioned, public-only campaign definition.
- Exactly nine ordered stages with owner, information level, entry criteria, exit evidence, gate kind, success condition, sources, and next-stage reference.
- CI validation for stage order and broken references.
- Deterministic campaign status reducer and replay tests.
- Campaign dashboard with progress, stage details, gates, and evidence requirements.
- Decision journal with choice, rationale, role, source, and consequence.
- Discover completion unlocks a playable Understand and assess quest.
- Understand and assess requires at least three affected actors, expected value, an open uncertainty, and a responsible gate decision.
- Completion records the actor map, value, uncertainty, and decision before activating Clarify and order.

## Current production bundle baseline

Captured with `npm run build` on 2026-07-15:

- HTML: 0.59 kB minified / 0.36 kB gzip.
- Shared shell JavaScript: 235.95 kB / 75.72 kB gzip.
- Styles: 22.43 kB / 5.09 kB gzip.
- Lazy game route: 3,185.43 kB / 1,096.83 kB gzip.

Zod validation was initially measured in the runtime route and then moved to development/test execution, removing about 67 kB minified from the game chunk while preserving CI validation.

## Verification

- Unit/content tests cover campaign validation, broken transitions, deterministic replay, both playable quests, stage ordering, progress, fallback loading, and cancellation.
- Playwright covers both accessible quest paths, failed and successful gates, evidence, journal entries, direct route, refresh, diagnostics, unknown route, and Axe scans.
- Visual inspection covers the NHN-branded landing/game routes, Speilsalen, and the campaign evidence state.

## Deliberately incomplete

- Stages 3–9 do not yet have playable quests, dialogue, interactions, or debriefs.
- No save/resume or state migration.
- No Library, searchable journal, building sheets, role switching, or full Casebuilder route derivation.
- No external GLB, audio, texture, icon, or animation asset.
- No agreed reference hardware baseline or formal Gate C approval.
- No multiplayer.

## Smallest next increment

Make Clarify and order playable with one synthetic scope-and-responsibility interaction, an explicit dependency gate, Nor dialogue, journal evidence, and deterministic tests. Verify any technical statement against current official sources before it becomes mandatory gameplay.
