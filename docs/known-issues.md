# Known issues and deferred work

- The Phase 1 world is a procedural placeholder and has no glTF/GLB pipeline yet. This is intentional until a licensed asset is approved.
- Phase 2 exposes all nine campaign stages. Discover and Understand and assess are playable; Clarify and order is active after completion and is the next content increment.
- The campaign dashboard currently provides decision history rather than a persisted or searchable knowledge journal.
- The asset-loader contract is tested but unused because no external runtime asset has passed the licence/provenance gate.
- Progress is not persisted. Refreshing `/game` restarts the short vertical slice.
- Gamepad controls, remapping, touch movement, and camera sensitivity are deferred.
- The 2D alternative covers the complete learning path; the 3D canvas itself is not expected to expose scene geometry meaningfully to a screen reader.
- No automated FPS, memory, or WebGL visual-regression threshold is established because reference hardware and browser targets are not yet approved.
- First-frame and FPS diagnostics are local estimates. The memory value is Chromium-specific when available and none of these readings are a formal performance baseline.
- The current Three/Rapier development stack emits upstream deprecation warnings for `THREE.Clock` and a physics initialisation signature. They do not currently fail the build or browser flow, but dependency updates must be monitored.
- The isolated game route is approximately 3.19 MB minified / 1.10 MB gzip in the current production build, largely due to the 3D and physics runtime. The normal shell remains separate at approximately 236 kB / 76 kB gzip.
- Nor is deterministic dialogue only; it does not retrieve documents or generate advice.
- No real Helsenorge service is called and no integration eligibility is evaluated.
- Multiplayer remains explicitly deferred until campaign state and content are stable.
