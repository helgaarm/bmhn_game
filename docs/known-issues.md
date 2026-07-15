# Known issues and deferred work

- The Phase 1 world is a procedural placeholder and has no glTF/GLB pipeline yet. This is intentional until a licensed asset is approved.
- Progress is not persisted. Refreshing `/game` restarts the short vertical slice.
- Gamepad controls, remapping, touch movement, and camera sensitivity are deferred.
- The 2D alternative covers the complete learning path; the 3D canvas itself is not expected to expose scene geometry meaningfully to a screen reader.
- No automated FPS, memory, or WebGL visual-regression threshold is established because reference hardware and browser targets are not yet approved.
- The current Three/Rapier development stack emits upstream deprecation warnings for `THREE.Clock` and a physics initialisation signature. They do not currently fail the build or browser flow, but dependency updates must be monitored.
- The isolated game route is approximately 3.16 MB minified / 1.09 MB gzip in the Phase 1 production build, largely due to the 3D and physics runtime. The normal shell remains separate at approximately 235 kB / 75 kB gzip.
- Nor is deterministic dialogue only; it does not retrieve documents or generate advice.
- No real Helsenorge service is called and no integration eligibility is evaluated.
- Multiplayer is explicitly outside Phase 1.
