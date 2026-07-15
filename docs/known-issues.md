# Known issues and deferred work

- The Phase 1 world is a procedural placeholder and has no glTF/GLB pipeline yet. This is intentional until a licensed asset is approved.
- Phase 2 exposes all nine campaign stages. Discover and Understand and assess are playable; Clarify and order is active after completion and is the next content increment.
- The campaign dashboard provides locally persisted decision history but not account sync, cloud backup, export, or searchable knowledge-journal functionality.
- The asset-loader contract is tested but unused because no external runtime asset has passed the licence/provenance gate.
- Progress is persisted only in the current browser. Unknown save/content versions are deliberately preserved but cannot resume until a reviewed migration is added or the player explicitly resets them.
- Gamepad controls, remapping, touch movement, and camera sensitivity are deferred.
- The 2D alternative covers the complete learning path; the 3D canvas itself is not expected to expose scene geometry meaningfully to a screen reader.
- Gate C has a production-build capture harness and evaluator, but reference hardware, browser version, thresholds and approval are still unset; formal approval remains pending.
- First-frame and FPS diagnostics are local estimates. The memory value is Chromium-specific, headless captures are measurement-only, and none of these readings are a formal baseline yet.
- The current Three/Rapier development stack emits upstream deprecation warnings for `THREE.Clock` and a physics initialisation signature. They do not currently fail the build or browser flow, but dependency updates must be monitored.
- The isolated game route is approximately 3.19 MB minified / 1.10 MB gzip in the current production build, largely due to the 3D and physics runtime. The normal shell remains separate at approximately 236 kB / 76 kB gzip.
- Nor is deterministic dialogue only; it does not retrieve documents or generate advice.
- No real Helsenorge service is called and no integration eligibility is evaluated.
- Multiplayer remains explicitly deferred until campaign state and content are stable.
