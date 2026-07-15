# Bygg med Helsenorge - Game

An original browser-based 3D fantasy learning experience built around the nine-step "Bygg med Helsenorge" actor journey.

Phase 1 is a single-player technical vertical slice. It provides a lazy-loaded game route, an original low-poly scene, third-person movement, one source-bounded guide, Casebuilder input, an explicit dependency gate, a decision consequence, and a complete accessible 2D path. Multiplayer is intentionally deferred.

## Run locally

Requirements: Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The regular shell is at `/` and the lazy-loaded game is at `/game`.

## Quality commands

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm run check` runs lint, unit tests, and the production build. Playwright requires a Chromium installation (`npx playwright install chromium`).

## Architecture

- The game is a contained feature module under `src/game` and is loaded only from the `/game` route.
- Quest progression is a deterministic reducer; frame-loop state remains inside React Three Fiber/Rapier.
- Learning content is typed, versioned, and separate from presentation.
- A typed adapter isolates the Phase 1 learning validation from future verified domain services.
- The full learning flow can be completed without precise 3D navigation.

See [Phase 1 decisions](docs/architecture/phase-1-decisions.md) and the [vertical-slice brief](docs/vertical-slice.md).

## Public repository policy

Only reviewed, anonymized, non-sensitive material may be committed. Internal source reports, personal contact information, operational findings, credentials, and real citizen data must remain outside this public repository. The repository ignore rules enforce the current source-document boundary.
