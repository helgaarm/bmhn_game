# Release notes

## Unreleased - Phase 2 foundation and campaign start

- Started Phase 3 core systems with configurable movement speed, frame-rate-independent acceleration/deceleration and normalised diagonal movement.
- Added ray-based camera collision, taller showroom world boundaries and local navigation diagnostics for player position and camera obstruction.
- Added physical colliders for showroom trees, Nor, gate pillars and continuous gate side barriers so the locked portal can no longer be bypassed.
- Added a real-scene Playwright collision test that verifies movement and physical stopping at the locked gate and showroom wall.
- Moved the in-world Nor dialogue from the bottom edge to a centred upper viewport position, keeping blur, hover, focus and keyboard controls intact.
- Added mouse-drag and keyboard-controlled third-person camera rotation, camera-relative movement, adjustable sensitivity, reset control and reduced-movement behaviour without changing the existing movement keys.
- Added pure camera transform tests and Playwright coverage that exercises the controls in Visningshallen, Speilsalen and Ansvarslageret.
- Added a playable Connect quest in a separate procedural Forbindelsesbro with Nor dialogue, two synthetic service cards, conditional connection routes and explicit unsupported/false-approval failure paths.
- Added structured satisfied/not-applicable evidence for all five Connect rules; actual service verification and production approval remain blocked.
- Upgraded local persistence to schema 3 with pure migrations from schemas 1 and 2 and refresh recovery after Connect.
- Added eleven source-bounded rules for Clarify and order, Connect, and Design and build, including exact claims, conditions, exceptions, evidence, source versions, recheck dates and required professional roles.
- Added fail-closed campaign enforcement: governed stages cannot complete without structured evidence or a reasoned not-applicable outcome for every required rule.
- Added a separate production-readiness evaluator that blocks missing applicability decisions, expired sources, missing/rejected approvals and approvals against an older source or registry version.
- Added an accessible Rules view showing the exact claims and explicitly blocked production status; no authority or professional approval is claimed.
- Added a schema-validated public campaign spine across all nine actor-journey stages.
- Added deterministic campaign progression with full status vocabulary and replay tests.
- Connected Discover completion to campaign evidence, decision logging, and activation of Understand and assess.
- Added a playable Understand and assess quest with source-bounded Nor dialogue, synthetic actor mapping, expected-value and uncertainty evidence, failed choices, and an explicit gate.
- Added a procedural Speilsalen as a separate, enclosed 24 x 28 metre play area without external assets; it remains unmounted and invisible until the learning gate opens, and entry requires physically passing through the portal.
- Connected successful assessment to three evidence records, a second journal decision, and activation of Clarify and order.
- Added a playable Clarify and order quest with Nor dialogue, a synthetic order sheet, scoped purpose, information flow, service-documentation status, professional role assignment and explicit risk/DPIA follow-up.
- Added failed paths for false prototype approval and technology-first selection, plus an Ansvarsport that records all three required rule-evidence packages while production remains blocked.
- Added a separate enclosed procedural Ansvarslager with accessible 2D parity and no external assets.
- Moved all Nor conversations into the 3D viewport as a blurred glass panel that opens on hover or keyboard focus, toggles with `T`, closes with `Esc`, and preserves the complete semantic dialogue path.
- Made room transitions visible on the first rendered frame by using camera-safe entry points and snapping the follow camera after portal teleports, room changes, returns and fall recovery.
- Paused movement and global game shortcuts whenever focus is in an input, textarea, select or content-editable region, so WASD, arrows, `E` and `T` can be used safely while entering text or choosing form values.
- Previously upgraded local persistence to schema 2 for Clarify and order; schema 3 now supersedes it for Connect.
- Added versioned, debounced local save/resume for both quests, campaign evidence and unfinished Casebuilder input, with validation, recovery notices, unknown-version preservation and explicit reset.
- Added a machine-readable external-asset manifest gate for item-level licence, provenance, redistribution, digest, review and runtime-path validation; no external asset was added.
- Added a draft Gate C reference profile, pure validator/evaluator and production-build measurement harness that refuses formal evaluation until hardware, browser, thresholds and approval are agreed.
- Added explicit multiplayer readiness and stop criteria; no networking dependency or multiplayer runtime was introduced.
- Added an accessible campaign dashboard with progress, stage criteria, gates, and a decision journal.
- Added remapping-ready named input actions.
- Added a tested binary asset-loader contract with progress, cancellation, fallback, and structured diagnostics; no external asset was introduced.
- Added controlled scene readiness plus opt-in local first-frame, FPS, and optional memory diagnostics without telemetry.
- Extended Playwright/Axe coverage to all four playable stages, failed and successful gates, campaign evidence, journal, direct navigation, refresh, diagnostics, and the campaign modal.
- The full campaign is not complete; stages 5–9 remain unavailable for play.

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
