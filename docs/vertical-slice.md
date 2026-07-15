# Phase 1 vertical-slice brief

## Outcome

A player enters one small N1 Showroom area, finds Nor, reads three subtitled dialogue steps, describes a synthetic scenario in Casebuilder, passes one explicit dependency gate, sees a decision consequence, and reaches a completion state.

## Learning objective

The player can explain why a concrete need and affected actors must be described before the team selects an abstract connection approach.

## Scope

- Landing shell at `/` and lazy-loaded Game Mode at `/game`.
- Original primitive low-poly hall, third-person movement, camera, collision, NPC proximity, and interaction.
- One fictional organisation and no personal, patient, credential, or production data.
- One deterministic quest with orientation, dialogue, Casebuilder, decision, failure consequence, and completion.
- Nine-step journey overview with the first segment active.
- Keyboard/mouse controls, visible focus, subtitles as text, reduced motion, high contrast, and a complete 2D alternative.
- Typed local adapter for learning-flow readiness. It does not make technical, legal, privacy, or production approvals.

## Out of scope

- Multiplayer, chat, accounts, authentication, analytics, save/resume, combat, economy, or open-world systems.
- Real Helsenorge API calls or mandatory claims about HelseID, FHIR, SMART, privacy, or integration eligibility.
- External art, audio, fonts, glTF/GLB assets, or generative assistant calls.
- Full nine-step campaign production.

## Integration target

Phase 1 has no pre-existing domain service to reuse. `src/game/adapters/needReadinessAdapter.ts` is the replacement boundary for a future verified service. It only checks whether the learning prompt contains a minimally meaningful need description and a selected audience.

## Asset and performance budget

- External runtime assets: zero.
- Initial shell: must remain a separate bundle from the game chunk.
- 3D: primitive geometry, one animated guide, one player, static decoration, one directional shadow light.
- Reference target: 60 FPS where available and usable at 30 FPS; no claim is made until measured on agreed reference hardware.

Measured production bundle baseline on 2026-07-15:

- HTML: 0.59 kB minified / 0.36 kB gzip.
- Shared shell JavaScript: 235.95 kB / 75.72 kB gzip.
- Styles: 22.43 kB / 5.09 kB gzip.
- Lazy game route: 3,185.43 kB / 1,096.83 kB gzip.

The route boundary succeeds, but the game chunk exceeds the default Vite warning threshold and remains an explicit optimisation target.

## Test plan

- Unit: reducer ordering, incomplete gate, incorrect consequence, successful completion.
- Component: landing route and unknown-route recovery.
- E2E: complete the learning flow through the accessible path, verify the failure consequence, and run Axe against the landing and game entry routes.
- Build: TypeScript project build and Vite production output.
- Manual: movement, camera, proximity prompt, keyboard focus, reduced motion, high contrast, responsive layout, and screen-reader reading order.

## Acceptance

- Existing landing route loads without importing the game module at source level.
- `/game` loads directly and after navigation; 3D failure remains contained.
- A player cannot reach solution choices before describing the need and selecting an affected audience.
- An unsafe shortcut never completes the gate and displays an understandable consequence.
- The full critical path is possible without 3D navigation.
- Tests, source register, asset manifest, known issues, release notes, and decisions are updated.
