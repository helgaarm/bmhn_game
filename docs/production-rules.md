# Production-rule register

Status: implemented as mandatory learning gates on 2026-07-15; production approval remains blocked.

The machine-readable authority is `src/game/compliance/productionRules.ts`. The registry contains the exact claim, affected journey stage, service scope, applicability condition, exceptions, expected evidence, required approver roles, sources, versions, verification date and mandatory recheck date for every rule.

## Approval boundary

Product approval has activated the rules in the campaign. It is not legal, regulatory, security, standards or service-owner approval. No person or organisation is recorded as having provided such approval.

The production evaluator fails closed until every rule has:

1. a structured applicability decision for the concrete service and scenario;
2. evidence and rationale for either `applicable` or `not-applicable`;
3. sources that have not passed their mandatory recheck date;
4. a named approval for every required professional role;
5. approvals made against the current registry version and no earlier than the latest source verification; and
6. no rejection from a required approver.

Synthetic test approvals exist only in test fixtures and are never loaded by the application.

## Mandatory rules

| Rule ID | Journey stage | Required professional roles | Current production state |
| --- | --- | --- | --- |
| `co-purpose-legal-basis` | Clarify and order | Privacy lawyer or DPO; controller | Pending |
| `co-risk-dpia` | Clarify and order | DPO; security owner | Pending |
| `co-need-before-connection` | Clarify and order | Product owner; integration architect | Pending |
| `cn-helseid-suitability` | Connect | Identity architect; service owner | Pending |
| `cn-helseid-production` | Connect | Integration owner; HelseID service owner | Pending |
| `cn-helseid-client` | Connect | HelseID-qualified security architect | Pending |
| `cn-fhir-conformance` | Connect | FHIR architect; service integration owner | Pending |
| `cn-smart-launch` | Connect | OAuth/SMART architect; service owner | Pending |
| `db-privacy-default` | Design and build | DPO; product owner | Pending |
| `db-access-audit` | Design and build | Security owner; data owner | Pending |
| `db-encryption-integrity` | Design and build | Security architect; clinical/domain owner | Pending |

## Source schedule

| Source | Recorded version | Verified | Recheck no later than |
| --- | --- | --- | --- |
| Norwegian Personal Data Act / GDPR | Regulation (EU) 2016/679 in LOV-2018-06-15-38 | 2026-07-15 | 2027-01-11 |
| Normen | 7.0, last professional change 2025-09-25 | 2026-07-15 | 2026-10-13 |
| HelseID overview and self-service | Unversioned live documentation | 2026-07-15 | 2026-10-13 |
| HelseID security profile | Unversioned live documentation | 2026-07-15 | 2026-10-13 |
| HL7 FHIR | R4 4.0.1 | 2026-07-15 | 2027-01-11 |
| SMART App Launch | 2.2.0, STU 2.2 | 2026-07-15 | 2027-01-11 |

Any source change, selected service version change or new production release triggers an immediate review even if the date above has not been reached. Internal Helsenorge material may supplement the public sources only when its owner, version, access boundary and review date are recorded; it cannot silently replace the public claim.

## Runtime enforcement

- Campaign stages 3–5 reference the rule IDs in validated campaign content.
- The campaign reducer refuses completion if a required rule lacks structured learning evidence or a reasoned not-applicable outcome.
- The campaign dashboard exposes the exact claims, evidence, exceptions, sources and current blocked production state.
- `evaluateProductionReadiness` is a separate fail-closed evaluator for real applicability decisions and named professional approvals.
- `npm run build:production` invokes the approval gate before building and currently fails by design. Development and CI prototype builds remain available; any future production deployment must use this command.
- Registry, campaign binding, failure, recovery, source expiry and complete-approval paths are unit tested.
