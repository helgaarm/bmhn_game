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

### Dependency or browser incompatibility - medium impact, medium likelihood

- Signal: build, WebGL, WASM physics, or automated browser tests fail on a supported target.
- Control: locked dependency graph, CI, error boundary, accessible fallback, and explicit browser verification.
- Owner: engineering.
