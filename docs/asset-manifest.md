# Asset and attribution manifest

## Phase 1 runtime assets

No external visual, audio, font, model, texture, animation, icon, or generated bitmap asset is included.

| Item | Type | Origin | Licence | Attribution | Runtime path |
| --- | --- | --- | --- | --- | --- |
| Showroom and Speilsalen geometry | Three.js primitives | Original project code | Project licence | Not required | `src/game/components/GameCanvas.tsx` |
| Player and Nor forms | Three.js primitives | Original project code | Project licence | Not required | `src/game/components/GameCanvas.tsx` |
| UI motifs and gradients | CSS | Original project code | Project licence | Not required | `src/styles.css` |
| Connection glyph | Inline SVG | Original project code, informed by NHN's published connection concept | Project licence | Not required | `src/components/BrandLockup.tsx` |

## Brand reference boundary

The [Norsk helsenett Brandpad](https://brandpad.io/norsk-helsenett/) is used as a design specification for palette, system typography, placement, and visual principles. No downloadable Brandpad logo, design element, illustration, icon, photo, template, or font asset is included because the public page does not provide an item-level redistribution licence.

## Intake gate for future assets

Every future item requires an item-level source URL, creator, exact licence/version, download date, modification record, attribution text, reviewer, and approved runtime path before commit. Collection-level assumptions are not sufficient. Unclear, non-commercial, or incompatible terms are rejected.

The machine-readable release record is `assets/manifest.json` (schema version 1). An approved record additionally requires explicit redistribution permission, a SHA-256 digest, HTTPS item/licence URLs, unique id and path, review date, and a runtime path below `/game-assets/`. `src/game/assets/assetManifest.test.ts` fails CI when these controls are missing. The current item array is empty.

Phase 2 adds a tested loader contract for progress, cancellation, fallback, and diagnostics. It does not add a runtime asset and therefore does not change the item table above.
