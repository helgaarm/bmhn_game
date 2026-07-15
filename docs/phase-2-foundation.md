# Phase 2 foundation and campaign start

## Outcome of this increment

Phase 2 now has a validated public campaign spine across all nine actor-journey stages. Discover, Understand and assess, Clarify and order, and Connect are playable: each records evidence and a decision before advancing campaign state. The remaining stages are intentionally informational and unavailable.

## Isolated 3D foundation coverage

| Requirement | Evidence | State |
| --- | --- | --- |
| Lazy Game Mode route | `src/App.tsx`, separate production game chunk | Complete |
| Canvas, camera, lighting, error boundary | `GameCanvas.tsx`, `GameErrorBoundary.tsx` | Complete |
| Controlled loading and fallback | First-frame loading overlay and contained 2D error state | Complete for primitive scene |
| Input abstraction | Named movement/camera actions, mouse drag, camera-relative movement, sensitivity and reduced movement | Complete for current keyboard/mouse scope |
| Primitive placeholder world | Project-authored Three.js geometry | Complete |
| Asset loader contract | Progress, cancellation, fallback, diagnostics plus unit tests | Complete; no external asset loaded |
| Asset approval gate | Machine-readable item-level licence, provenance, digest and path validation | Complete; manifest empty |
| Physics when required | Rapier character movement and collision | Complete for current world |
| Route smoke coverage | Landing, direct `/game`, navigation, refresh, unknown route | Complete in Playwright |
| Bundle baseline | Vite production output recorded below | Complete |
| Representative load/memory/FPS baseline | Production capture and evaluator exist | Protocol scaffold complete; formal Gate C pending approved profile |

## Campaign foundation coverage

- Versioned, public-only campaign definition.
- Exactly nine ordered stages with owner, information level, entry criteria, exit evidence, gate kind, success condition, sources, and next-stage reference.
- CI validation for stage order and broken references.
- Deterministic campaign status reducer and replay tests.
- Campaign dashboard with progress, stage details, gates, and evidence requirements.
- Decision journal with choice, rationale, role, source, and consequence.
- Versioned local save/resume with domain validation, safe recovery and explicit reset.
- Discover completion unlocks a playable Understand and assess quest.
- Understand and assess requires at least three affected actors, expected value, an open uncertainty, and a responsible gate decision.
- Completion records the actor map, value, uncertainty, and decision before activating Clarify and order.
- Clarify and order requires scoped purpose, information flow, service/documentation status, correct professional ownership, risk/DPIA follow-up and an explicit no-false-approval decision.
- Completion records structured learning evidence for all three bound rules while preserving the separate blocked production status, then activates Connect.
- Connect derives the route from one of two explicit synthetic service cards, exercises an unsupported path, and records satisfied or not-applicable evidence for all five bound rules while production remains blocked.

## Current production bundle baseline

Captured with `npm run build` on 2026-07-15:

- HTML: 0.59 kB minified / 0.35 kB gzip.
- Shared shell JavaScript: 235.95 kB / 75.72 kB gzip.
- Styles: 30.19 kB / 6.34 kB gzip.
- Lazy game route: 3,258.13 kB / 1,115.03 kB gzip.

Zod validation was initially measured in the runtime route and then moved to development/test execution, removing about 67 kB minified from the game chunk while preserving CI validation.

## Verification

- Unit/content tests cover campaign validation, broken transitions, deterministic replay, all four playable quests, stage ordering, schema-1/schema-2 migration, save/recovery, camera transforms, asset approval, Gate C refusal/evaluation, fallback loading, and cancellation.
- Playwright covers all four accessible quest paths, mouse/tastaturkamera in the three earlier rooms, failed and successful gates, conditional rule evidence, journal entries, save/resume, corrupt-save recovery, direct route, refresh, diagnostics, unknown route, and Axe scans.
- The separate production Gate C harness successfully captures a measurement-only report; it cannot pass while the profile remains draft.
- Visual inspection covers the NHN-branded landing/game routes, blurred/open in-world Nor dialogue, Speilsalen, Ansvarslageret, and the campaign evidence state.

## Deliberately incomplete

- Stages 5–9 do not yet have playable quests, dialogue, interactions, or debriefs.
- No cloud/account save. Schema version 3 includes pure, tested migrations from schemas 1 and 2; future version changes require a new reviewed migration before compatibility is extended.
- No Library, searchable journal, building sheets, role switching, or full Casebuilder route derivation.
- No external GLB, audio, texture, icon, or animation asset.
- No agreed reference hardware, approved thresholds, or formal Gate C approval.
- No multiplayer.

## Smallest next increment

Make Design and build playable without weakening the production boundary: derive a small building sheet from the selected Connect route, validate synthetic outputs against the chosen conditional rules, and keep professional approvals external to the game.
