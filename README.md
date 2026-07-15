# Bygg med Helsenorge - Game

An original browser-based 3D fantasy learning experience built around the nine-step "Bygg med Helsenorge" actor journey.

Phase 1 is a single-player technical vertical slice. It provides a lazy-loaded game route, an original low-poly scene, third-person movement, one source-bounded guide, Casebuilder input, an explicit dependency gate, a decision consequence, and a complete accessible 2D path. Multiplayer is intentionally deferred.

Phase 2 has started with a validated nine-stage campaign spine, campaign dashboard, decision journal, versioned local save/resume, controlled scene readiness, remapping-ready input actions, a licensed-asset intake gate, a cancellable/fallback asset-loader contract, and opt-in local diagnostics. Discover, Understand and assess, Clarify and order, and Connect are playable; stages 5–9 remain deliberately visible but unavailable.

## Run locally

Requirements: Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The regular shell is at `/` and the lazy-loaded game is at `/game`.

Move relative to the camera with WASD or the arrow keys. Drag the mouse to turn, use `Q`/`R` and Page Up/Page Down as the keyboard camera alternative, and press `C` to reset the view. Camera sensitivity and reduced movement are available in Settings. Nor dialogue appears inside the 3D viewport and opens on hover or keyboard focus; `T` toggles it and `Esc` closes it. The complete learning path is also available through the semantic 2D route.
Movement and game shortcuts pause automatically while focus is in a text field or form control.

## Quality commands

```bash
npm run lint
npm run test:content
npm test
npm run build
npm run test:e2e
npm run test:gate-c
```

`npm run check` runs lint, unit tests, and the production build. Playwright requires a Chromium installation (`npx playwright install chromium`).

## Architecture

- The game is a contained feature module under `src/game` and is loaded only from the `/game` route.
- Quest progression is a deterministic reducer; frame-loop state remains inside React Three Fiber/Rapier.
- Learning content is typed, versioned, and separate from presentation.
- A typed adapter isolates the Phase 1 learning validation from future verified domain services.
- The full learning flow can be completed without precise 3D navigation.

See [Phase 1 decisions](docs/architecture/phase-1-decisions.md) and the [vertical-slice brief](docs/vertical-slice.md).
Phase 2 scope and evidence are tracked in the [Phase 2 foundation report](docs/phase-2-foundation.md), [Phase 2 decisions](docs/architecture/phase-2-decisions.md), [save/resume contract](docs/save-resume.md), [Gate C protocol](docs/performance-gate-c.md), and [multiplayer readiness gate](docs/multiplayer-readiness.md).

## Branding

The interface follows the published [Norsk helsenett digital profile guide](https://brandpad.io/norsk-helsenett/): the verified green palette, supporting yellow/orange accents, Arial system typography, upper-left brand placement, and an original connection motif. No downloadable logo, illustration, icon pack, or licensed Helvetica Now font is bundled. See the [brand implementation record](docs/brand-system.md).

## Public repository policy

Only reviewed, anonymized, non-sensitive material may be committed. Internal source reports, personal contact information, operational findings, credentials, and real citizen data must remain outside this public repository. The repository ignore rules enforce the current source-document boundary.
