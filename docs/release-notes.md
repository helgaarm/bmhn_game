# Release notes

## Unreleased - Phase 2 foundation and campaign start

- Added a schema-validated public campaign spine across all nine actor-journey stages.
- Added deterministic campaign progression with full status vocabulary and replay tests.
- Connected Discover completion to campaign evidence, decision logging, and activation of Understand and assess.
- Added a playable Understand and assess quest with source-bounded Nor dialogue, synthetic actor mapping, expected-value and uncertainty evidence, failed choices, and an explicit gate.
- Added a procedural Speilsalen state to the existing 3D world without external assets.
- Connected successful assessment to three evidence records, a second journal decision, and activation of Clarify and order.
- Added versioned, debounced local save/resume for both quests, campaign evidence and unfinished Casebuilder input, with validation, recovery notices, unknown-version preservation and explicit reset.
- Added a machine-readable external-asset manifest gate for item-level licence, provenance, redistribution, digest, review and runtime-path validation; no external asset was added.
- Added a draft Gate C reference profile, pure validator/evaluator and production-build measurement harness that refuses formal evaluation until hardware, browser, thresholds and approval are agreed.
- Added explicit multiplayer readiness and stop criteria; no networking dependency or multiplayer runtime was introduced.
- Added an accessible campaign dashboard with progress, stage criteria, gates, and a decision journal.
- Added remapping-ready named input actions.
- Added a tested binary asset-loader contract with progress, cancellation, fallback, and structured diagnostics; no external asset was introduced.
- Added controlled scene readiness plus opt-in local first-frame, FPS, and optional memory diagnostics without telemetry.
- Extended Playwright/Axe coverage to both playable stages, failed and successful gates, campaign evidence, journal, direct navigation, refresh, diagnostics, and the campaign modal.
- The full campaign is not complete; stages 3–9 remain unavailable for play.

## Unreleased - Norsk helsenett brand alignment

- Applied the published Norsk helsenett primary, supporting, and neutral colour system to the application and procedural 3D world.
- Replaced the previous serif/display typography with the approved Arial system-font stack; no licensed Helvetica Now file is bundled.
- Added an upper-left text lockup and original connection glyph plus a restrained connection field on the landing route.
- Preserved reduced motion, high contrast, focus visibility, semantic labels, the complete 2D route, and the existing game identity.
- Added a brand implementation record and documented why no downloadable Brandpad asset was imported.

## 0.1.0 - Phase 1 technical vertical slice

- Added a React/TypeScript/Vite application shell and lazy-loaded `/game` route.
- Added an original procedural low-poly Showroom with third-person movement, follow camera, Rapier collision, Nor, and a proximity interaction.
- Added a deterministic, data-driven quest with dialogue, Casebuilder, dependency gate, incorrect-decision consequence, and completion.
- Added reduced-motion and high-contrast settings plus a complete semantic 2D path.
- Added unit, component, and Playwright tests with GitHub Actions CI.
- Added architecture decisions, source register, asset manifest, risk register, known issues, and vertical-slice acceptance criteria.
- No multiplayer, external assets, analytics, accounts, or real service integrations were introduced.
