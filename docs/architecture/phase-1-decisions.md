# Phase 1 architecture decisions

Status: accepted for the technical vertical slice on 2026-07-15. Decisions marked deferred require a new approval gate before implementation.

## Context

Repository discovery found no pre-existing application, router, state store, API, authentication, test stack, build system, or deployment configuration. The safest reversible baseline is therefore one application shell with a contained lazy-loaded game feature. There is no legacy runtime behaviour to preserve beyond keeping the internal source documents local and untracked.

## ADR-001 - Game placement

- Decision: place Game Mode in `src/game` inside the single React application.
- Reason: this is the smallest boundary that avoids a parallel frontend while remaining removable.
- Alternatives: a workspace package adds coordination without current reuse; a separate deployable duplicates the shell and deployment.
- Rollback: remove the `/game` route and `src/game`; the landing route remains functional.

## ADR-002 - Route and bundle

- Decision: use React Router with `React.lazy` at `/game`.
- Reason: the landing route does not statically import Three.js, React Three Fiber, Drei, or Rapier.
- Alternatives: a feature flag may be added when runtime configuration exists; a separate deployable is not justified.
- Evidence: `src/App.tsx` and the production build chunk report.

## ADR-003 - State model

- Decision: keep learning/business state in a pure reducer and frame-loop state inside the 3D components.
- Reason: Phase 1 state is small, deterministic, and testable without adding a global store.
- Deferred trigger: evaluate Zustand or a state-machine library when multiple campaigns, persistence, or shared sessions make reducer composition difficult.

## ADR-004 - Content format

- Decision: use typed TypeScript definitions with a numeric content version for Phase 1.
- Reason: the current content set is small and gains compile-time reference validation.
- Deferred trigger: introduce runtime schema validation before content becomes independently authored or remotely delivered.

## ADR-005 - Domain adapter

- Decision: invoke learning readiness through `needReadinessAdapter`.
- Reason: the repository has no existing business service to reuse. The local implementation is explicitly not a Helsenorge eligibility validator and can be replaced behind a typed contract.
- Rejected: embedding readiness rules directly in UI components would couple learning flow and presentation.

## ADR-006 - Asset pipeline

- Decision: use procedural primitive geometry and CSS for Phase 1; track every future external item in `docs/asset-manifest.md` before commit.
- Reason: the slice needs no external runtime asset and therefore carries no unverified licence or attribution.
- Deferred trigger: add glTF optimisation and validation when the first reviewed GLB asset is approved.

## ADR-007 - Save model

- Decision: no persistent progression in Phase 1; provide an explicit replay action.
- Reason: the technical slice is short, replayable, and contains no account system.
- Deferred trigger: use versioned local browser persistence for the single-player MVP after the state schema is stable; evaluate backend persistence only with an approved identity boundary.

## ADR-008 - Nor implementation

- Decision: deterministic, content-bounded dialogue only.
- Reason: this meets the Phase 1 guide requirement without hallucination, external data transfer, or hidden approval claims.
- Deferred trigger: retrieval or generative modes require approved sources, evaluation, prompt-injection controls, privacy review, and failure handling.

## ADR-009 - Multiplayer boundary

- Decision: deferred until the single-player campaign state, save/replay, and Gate E evidence are stable.
- Reason: Phase 1 must prove learning value and deterministic transitions before synchronisation.
- Prohibited in the current phase: session transport, matchmaking, chat, server authority, or shared persistence.

## ADR-010 - Telemetry and privacy

- Decision: no analytics or remote telemetry in Phase 1.
- Reason: the slice can be tested without collecting player data. Console diagnostics are limited to contained 3D startup failures and include no scenario payload.
- Deferred trigger: any analytics design must be anonymous or explicitly consented, data-minimised, documented, and approved.

## Gate B check

- Game presentation, learning state, content, and adapters have stable boundaries.
- Game Mode can be removed without breaking the landing route.
- Multiplayer, persistence, generative AI, telemetry, and external assets have explicit deferral triggers.
- The bounded slice, integration target, asset budget, and test plan are recorded in `docs/vertical-slice.md`.
