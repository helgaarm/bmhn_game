# Phase 2 architecture decisions

Status: accepted for the current Phase 2 increments on 2026-07-15. This record does not approve multiplayer, broad campaign production, analytics, formal Gate C, or technical Helsenorge eligibility rules.

## Scope interpretation

The source documents use two Phase 2 scopes. The implementation plan defines an isolated 3D foundation; the system prompt defines Phase 2 and later as the first complete nine-step campaign. This increment closes remaining foundation gaps and starts the campaign spine without claiming that all nine stages are playable.

## ADR-201 - Campaign content validation

- Decision: define a Zod schema for the nine-stage campaign and execute it in unit/CI tests.
- Runtime boundary: application code imports only inferred TypeScript types; Zod remains a development dependency and is not included in the game chunk.
- Failure rule: duplicate stages, wrong order, broken next-stage references, invalid content profile, or missing gate/evidence fields fail the content test.
- Deferred trigger: add a standalone content compiler when non-developers or remote packages author campaign data.

## ADR-202 - Campaign progression state

- Decision: use a second pure reducer for campaign state rather than expanding frame-loop or UI state.
- Status vocabulary: unavailable, available, active, blocked, ready, completed, and failed-with-learning.
- Current integration: the first four quests record evidence and decisions in order; completing Connect activates Design and build.
- Persistence: local schema version 3 is approved under ADR-208; schemas 1 and 2 migrate purely and unknown versions remain preserved until an explicit migration exists.

## ADR-203 - Decision journal

- Decision: record choice, rationale, role, source, and consequence as deterministic campaign state.
- Privacy: records contain only the synthetic scenario and player-entered prototype text. They may be persisted locally under ADR-208, but are never transmitted.
- Authority: the journal is learning evidence, not legal, privacy, security, or production approval.

## ADR-204 - Input abstraction

- Decision: define named actions and key bindings outside the rendered player component.
- Current actions: forward, backward, left, right, interact, camera yaw/pitch and camera reset. Mouse drag and Q/R plus Page Up/Page Down share the same yaw/pitch state.
- Movement space: local input is rotated by camera yaw before velocity is applied, so forward follows the view while strafing remains orthogonal.
- Accessibility: sensitivity is adjustable; reduced movement lowers angular input and removes follow-camera interpolation. Existing piltast movement remains available.
- Focus boundary: editable fields and form controls always produce a zero movement vector and suppress global `E`/`T` shortcuts; controls resume when focus leaves the field.
- Deferred trigger: expose remapping UI and controller bindings only after the accessibility/control design is approved.

## ADR-205 - Asset loading contract

- Decision: provide a fetch-based binary loader with byte progress, AbortSignal cancellation, explicit fallback, and structured diagnostic events.
- Current usage: contract and tests only; no external runtime asset is introduced.
- Asset gate: a GLB or other asset still requires item-level licence/provenance approval and manifest registration before use.

## ADR-206 - Performance diagnostics

- Decision: keep first-frame, sampled FPS, and optional Chromium heap estimates in an opt-in local diagnostics panel.
- Privacy: no telemetry, storage, network reporting, scenario payload, or player identifier.
- Evidence boundary: readings support debugging but do not constitute a representative hardware baseline until reference devices and a measurement protocol are approved.

## ADR-207 - Playable Understand and assess boundary

- Decision: implement stage 2 as its own pure reducer and versioned content module rather than expanding the Discover quest machine.
- Entry gate: the stage remains locked until Discover supplies its selected primary actor.
- Evidence rule: at least three actors including the prior primary actor, a concrete expected-value statement, and one open uncertainty are required before the decision gate.
- Learning boundary: the successful choice keeps uncertainty visible and assigns follow-up responsibility; it does not approve technology, integration, privacy, security, or production readiness.
- Presentation: the existing lazy game route is reused with project-authored procedural Speilsalen geometry and a complete semantic path. The hall is a separate enclosed 24 x 28 metre zone, is not mounted before the learning gate opens, and uses an opaque collidable door while locked. An open portal transfers the player only after a physical threshold crossing; reload restores the player outside the hall so entry is explicit. The teleport target reserves space for the third-person camera and snaps it inside on the first frame, preventing the front wall from hiding the room until movement begins.

## ADR-208 - Versioned local persistence

- Decision: autosave the five deterministic reducers plus unfinished Casebuilder draft in one schema-versioned local envelope.
- Compatibility: save schema and campaign content version are independent gates. Current version is restored only after full structural/domain validation.
- Recovery: corrupt current saves are removed with a visible notice; unknown schema/content versions are preserved and never overwritten automatically.
- Migration: version 2 added Clarify and order state; version 3 adds Connect state. Pure, tested migrations from schemas 1 and 2 initialize missing reducers as locked while preserving earlier progress. Every future bump requires a pure migration, fixtures, recovery tests and an explicit supported-version policy before release.
- Privacy: local only, synthetic data only, no account sync, telemetry or network transmission; Settings provides explicit reset.

## ADR-209 - Machine-readable asset approval

- Decision: `assets/manifest.json` is the release gate for every external runtime asset.
- Required fields: item-level HTTPS source and licence, creator, licence id, explicit redistribution permission, attribution, download/review dates, SHA-256, modifications, reviewer and controlled runtime path.
- Failure rule: missing provenance, duplicate ids/paths, non-approved status, unknown digest or a path outside `/game-assets/` fails tests.
- Current state: manifest version 1 contains zero items; procedural project-authored geometry remains outside this external-asset registry.

## ADR-210 - Gate C refuses unapproved baselines

- Decision: keep the reference profile, capture harness and evaluator separate from local diagnostics and routine CI.
- Protocol: production build, one warm-up, five measured runs, pinned viewport and single worker; capture first-frame, FPS samples and optional Chromium heap.
- Approval rule: no pass/fail evaluation until physical reference details, browser, network profile, thresholds, owner and date are approved.
- Evidence: local/headless capture is labelled measurement-only and does not itself satisfy Gate C.

## ADR-211 - Multiplayer remains gated

- Decision: do not install or design around a multiplayer runtime until the nine-step single-player campaign, migrations and event semantics are stable.
- Minimum future architecture: server-authoritative state, ordered/idempotent events, reconnect/replay and solo/accessibility parity.
- Exclusions for the first experiment: chat, voice, trading, combat, real identity, real organisations and real health data.
- Approval checklist: `docs/multiplayer-readiness.md`.

## ADR-212 - Versioned technical rules fail closed

- Decision: implement the approved rule set as a versioned, schema-validated registry and bind every rule to Clarify and order, Connect or Design and build.
- Learning gate: a governed campaign stage cannot complete without structured evidence or a reasoned not-applicable outcome for every bound rule.
- Authority boundary: product approval activates learning content only. It does not represent legal, regulatory, NHN, Helsenorge, HelseID, HL7, SMART, privacy or security approval.
- Production gate: applicability, source currency and named approvals are evaluated separately. Missing, rejected, stale or wrong-version evidence blocks production.
- Build boundary: `npm run build:production` executes the fail-closed approval gate. A future deployment workflow must use this command rather than the prototype build command.
- Update rule: source changes, service/version selection, control-date expiry or a new release require re-verification and may invalidate earlier approvals.
- Persistence: campaign content remains version 3; save schema 3 persists the fourth quest state and preserves incompatible future saves.
- Register: `docs/production-rules.md` and `src/game/compliance/productionRules.ts`.

## ADR-213 - Playable Clarify and order boundary

- Decision: implement stage 3 as a separate pure reducer and typed content module, reusing the campaign rule-evidence contract rather than embedding approval state in the 3D frame loop.
- Entry gate: stage 3 remains locked until Understand and assess completes; the player then enters a separate enclosed procedural Ansvarslager at a camera-safe position that is visible on its first rendered frame.
- Evidence rule: purpose/scope, information flow/data direction, named service and documentation status, correct professional ownership, and planned risk/DPIA screening are required before the decision gate.
- Failure paths: false production approval and technology-first selection never open the gate and return an understandable consequence.
- Authority boundary: successful completion satisfies the learning gate only. Every evidence package records pending professional approval and the independent production evaluator remains blocked.
- Progression: successful learning evidence completes Clarify and order and activates the playable Connect increment.

## ADR-214 - Camera-relative single-player navigation

- Decision: implement orbit yaw/pitch as frame-local refs and keep learning/business state outside the render loop.
- Input: primary-button mouse drag rotates the camera; Q/R and Page Up/Page Down are the keyboard alternative; C resets yaw and pitch.
- Movement: named movement actions are transformed by camera yaw before Rapier velocity and avatar facing are updated.
- Motion: sensitivity is clamped to 0.25–2×. Reduced movement scales angular input and snaps the follow camera instead of interpolating it.
- Focus boundary: camera keys are ignored while a text or form control has focus, matching the existing movement and dialogue-shortcut boundary.
- Verification: pure transform/clamp tests plus Playwright mouse/keyboard exercise in Visningshallen, Speilsalen and Ansvarslageret.

## ADR-215 - Playable Connect boundary

- Decision: implement stage 4 as a separate pure reducer, typed content module and enclosed procedural Forbindelsesbro.
- Scenario-first gate: the player must select one explicit synthetic service card before choosing a route. The card declares actor type, synthetic owner, documentation timestamp and advertised capabilities.
- Conditional rules: all five required rules receive structured evidence. A rule is satisfied only when the synthetic card activates it; otherwise it receives a reasoned not-applicable outcome.
- Failure paths: unsupported SMART/browser-secret selection and production approval from synthetic evidence never complete their gates.
- Authority boundary: service cards are learning fixtures, not claims about real services. Every completion records that current service documentation and professional approval still block production.
- Progression: successful learning evidence completes Connect and activates Design and build.

## Rollback

Remove the campaign dashboard, campaign, assessment and clarification reducer/content modules, persistence module, diagnostics/Gate C modules, asset-loader/manifest modules, and Zod development dependency. The Phase 1 route and Discover reducer remain independently functional after its initial state is restored to non-persistent construction.
