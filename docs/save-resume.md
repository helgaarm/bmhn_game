# Local save and resume

## Decision

Phase 2 uses a versioned local browser save for synthetic single-player progress. The save contains the Discover, Understand and assess, Clarify and order, and Connect quest states, campaign state, decision evidence, and an unfinished Casebuilder draft. It is never transmitted, used for analytics, or presented as a server record.

## Envelope and compatibility

- Storage key: `bmhn.game.save`.
- Save schema: version 3.
- Campaign id and campaign content version are stored independently from the save schema.
- A save is restored only when its schema, campaign identity, content version, stage ids, status vocabulary, decisions, evidence, actor ids, and choice ids validate.
- Writes are debounced by 300 milliseconds to avoid synchronous storage work on every keystroke.

Schema 2 added Clarify and order state; schema 3 adds Connect state. Pure migrations restore valid schema-1 and schema-2 envelopes with missing reducers in their locked initial state; invalid legacy shapes are rejected. Every future schema or campaign-content bump must add a reviewed, pure migration and fixture tests before compatibility is expanded. Until such a migration exists, an unknown version is preserved and autosave is disabled so an older client cannot destroy newer progress.

## Recovery rules

| Condition | Behaviour |
| --- | --- |
| No save | Start fresh and create a local save. |
| Valid current save | Restore all learning and campaign state. |
| Valid schema-1 save | Migrate in memory to schema 3 with Clarify and order and Connect initially locked. |
| Valid schema-2 save | Migrate in memory to schema 3 with Connect initially locked. |
| Invalid JSON or invalid state shape | Remove it, start fresh, and show a recovery notice. |
| Unknown schema or campaign content version | Preserve it, start fresh without autosave, and require explicit local reset. |
| Storage denied or quota failure | Continue without persistence and show a notice. |
| Player selects local reset | Remove the old envelope, reset reducers, and create a fresh versioned save. |

## Privacy boundary

The UI states that only synthetic data is permitted. Local storage still persists text on the device, so players can inspect and delete it from Settings. Real citizen, patient, credential, contact, or production data remains prohibited. Account sync, cloud backup, analytics, and multiplayer state are not part of this save.

## Verification

Unit tests cover round-trip restore, schema-1/schema-2 migration, corrupt JSON, invalid reducer state, future schema preservation, campaign-version preservation, unavailable storage, and explicit clearing. Playwright covers refresh restore after Connect and corrupt-save recovery.
