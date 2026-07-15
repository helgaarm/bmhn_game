# Risk register

## Active risks

### Public information leakage - high impact, low likelihood

- Signal: internal report text, names, contacts, operational findings, or source binaries appear in a commit or build.
- Control: exact source files are ignored; public content is synthetic and reviewed; no report binary is bundled.
- Owner: release reviewer.

### Technical guidance becomes an unsupported rule - high impact, medium likelihood

- Signal: gameplay claims that a specific Helsenorge connection, identity, FHIR, SMART, or privacy choice is mandatory without a current official source.
- Control: Phase 1 teaches a process principle only; the adapter explicitly rejects eligibility semantics; source notes identify the technical boundary.
- Owner: content and architecture review.

### 3D bundle degrades the shell - medium impact, medium likelihood

- Signal: Three.js or physics appears in the initial landing chunk or route load regresses.
- Control: route-level dynamic import and production bundle inspection.
- Owner: frontend engineering.

### Accessibility depends on precise movement - high impact, medium likelihood

- Signal: a keyboard or screen-reader user cannot start or complete the quest.
- Control: complete 2D path, semantic forms, focus styles, text dialogue, reduced motion, and high contrast.
- Owner: UX/accessibility.

### Scope expands before the learning proof - high impact, high likelihood

- Signal: multiplayer, world size, art production, or networking begins before the slice is validated.
- Control: ADR deferrals and release ladder; no multiplayer dependency is installed.
- Owner: product and technical lead.

### Campaign breadth is mistaken for playable depth - high impact, medium likelihood

- Signal: the nine-stage dashboard is presented as a complete campaign even though stages 4–9 have no playable content.
- Control: explicit unavailable states, Phase 2 foundation report, release notes, and one-stage-at-a-time acceptance.
- Owner: product and learning design.

### Dependency or browser incompatibility - medium impact, medium likelihood

- Signal: build, WebGL, WASM physics, or automated browser tests fail on a supported target.
- Control: locked dependency graph, CI, error boundary, accessible fallback, and explicit browser verification.
- Owner: engineering.

### Local save becomes incompatible or contains unintended text - medium impact, medium likelihood

- Signal: a content/schema bump destroys progress, an older client overwrites a newer save, or a player enters non-synthetic information.
- Control: independent schema/content versions, full domain validation, preserve-unknown behaviour, explicit reset, migration fixtures before version expansion, local-only storage and repeated synthetic-data messaging.
- Owner: product, privacy and engineering.

### Measurement capture is mistaken for Gate C approval - high impact, medium likelihood

- Signal: a local/headless FPS result is presented as an approved performance baseline.
- Control: draft profile, mandatory hardware/browser/threshold/owner fields, evaluator refusal, `measurement-only` report label and separate release approval.
- Owner: product and technical lead.

### Multiplayer begins before authority and recovery are designed - high impact, high likelihood

- Signal: networking dependencies or client-authored shared completion appear before stable campaign ids, migrations and a server trust model.
- Control: explicit readiness checklist, no multiplayer dependency, server-authoritative requirement and smallest-slice exclusions.
- Owner: product, security and technical lead.
