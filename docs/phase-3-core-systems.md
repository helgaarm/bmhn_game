# Phase 3 core game systems

## Status

Phase 3 is in progress. The first increment strengthens player movement and collision; it does not claim that the complete Phase 3 scope is finished.

## Increment 1: movement and collision

Implemented:

- Configurable player speed from 2.4 to 5.2 metres per second.
- Frame-rate-independent acceleration and deceleration with normalised diagonal movement.
- Rapier player body with controlled horizontal velocity and preserved gravity.
- Physical floors and room boundaries plus colliders for the locked progression gate, its side barriers, showroom trees, Nor and warehouse shelving.
- A continuous visible and physical showroom barrier. Unlocking removes only the central door collider and leaves one controlled opening.
- Ray-based third-person camera collision that shortens the camera arm before a world collider and excludes the player body from the query.
- Safe room entry, camera snap after transitions and fall recovery from the existing Phase 2 foundation.
- Opt-in local navigation diagnostics for player position, camera distance and obstruction state. Nothing is transmitted.

## Verification

- Pure motion tests cover acceleration, deceleration, diagonal normalisation and speed limits.
- World tests cover portal boundaries, room-safe spawn/camera positions and the showroom camera-height boundary.
- Playwright drives the real Rapier scene and verifies that the player moves, cannot cross the locked gate, cannot cross the showroom wall and reports camera obstruction.
- The existing complete four-stage browser journey remains the regression path for the unlocked portal and all three current campaign rooms.

## Remaining Phase 3 work

- Grounded-state, slope, step-height and moving-obstacle behaviour.
- A swept-volume camera query and visual tuning for narrow corners; the first increment uses a ray.
- Collision verification in Speilsalen, Ansvarslageret and Forbindelsesbroen, including all intended/non-intended obstacle classes.
- A common typed interaction contract for NPC, gate, portal, document, workbench and world marker.
- Conditional and role-specific dialogue, transcript and validated dialogue schemas.
- Complete deterministic replay fixtures for every quest reducer.
- Knowledge journal, building-sheet entries and N1/N2/N3 search/filtering.
- A formal Phase 3 acceptance run covering movement, interaction, quest, gate and debrief with keyboard and reduced movement.

## Boundary

This increment proves local synthetic gameplay mechanics only. It adds no multiplayer, external assets, real service integration, analytics or production approval.
