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
- Current integration: completing the existing Discover quest records evidence and a decision, completes stage 1, and activates stage 2.
- Persistence: local schema version 1 is now approved under ADR-208; unknown versions remain preserved until an explicit migration exists.

## ADR-203 - Decision journal

- Decision: record choice, rationale, role, source, and consequence as deterministic campaign state.
- Privacy: records contain only the synthetic scenario and player-entered prototype text. They may be persisted locally under ADR-208, but are never transmitted.
- Authority: the journal is learning evidence, not legal, privacy, security, or production approval.

## ADR-204 - Input abstraction

- Decision: define named actions and key bindings outside the rendered player component.
- Current actions: forward, backward, left, right, and interact.
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
- Presentation: the existing lazy game route is reused with project-authored procedural Speilsalen geometry and a complete semantic path.

## ADR-208 - Versioned local persistence

- Decision: autosave the three deterministic reducers plus unfinished Casebuilder draft in one schema-versioned local envelope.
- Compatibility: save schema and campaign content version are independent gates. Current version is restored only after full structural/domain validation.
- Recovery: corrupt current saves are removed with a visible notice; unknown schema/content versions are preserved and never overwritten automatically.
- Migration: version 1 is the first persistent schema. Every future bump requires a pure migration, fixtures, recovery tests and an explicit supported-version policy before release.
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

## Rollback

Remove the campaign dashboard, campaign and assessment reducer/content modules, persistence module, diagnostics/Gate C modules, asset-loader/manifest modules, and Zod development dependency. The Phase 1 route and Discover reducer remain independently functional after its initial state is restored to non-persistent construction.
