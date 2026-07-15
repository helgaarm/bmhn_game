# Multiplayer readiness gate

## Decision

Multiplayer remains deferred. No networking, lobby, presence, chat, account, or server-authority dependency is installed. Deterministic single-player state and versioned local persistence are preparation, not evidence that campaign content is stable enough for shared sessions.

## Entry criteria

Real-time work may start only after an explicit go decision confirms all of the following:

- The complete nine-step single-player campaign has stable content ids, events, gates, evidence and failure semantics.
- Save-schema and campaign-content migrations have fixtures, recovery tests and a supported-version policy.
- The shared event protocol defines identity, ordering, idempotency, replay, conflict handling and late join.
- A server-authoritative trust model prevents clients from granting completion, evidence or rewards.
- Authentication, party membership, session expiry, reconnect, host/server failure and instance cleanup are designed.
- Data classification, retention, logging, incident response and privacy responsibilities are approved.
- Solo and accessible semantic paths remain equivalent when networking is absent or fails.
- Load, latency, abuse, security, observability, deployment and rollback plans have measurable acceptance criteria.

## First permitted slice

After approval, the smallest multiplayer experiment is one to six synthetic players in a private instanced campaign with presence and synchronized quest events only. It excludes free text chat, voice, trading, combat, real identities, real organisations and real health data. A player must be able to disconnect and resume without corrupting the shared campaign.

## Stop conditions

Pause multiplayer work if content identifiers continue to change, single-player recovery is unreliable, clients can authoritatively complete gates, accessibility requires precise 3D movement, or privacy/security ownership is unresolved.
