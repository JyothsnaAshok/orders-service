# Rollback runbook

Last exercised against: **release/v1.4.0** (2026-08-30).

## Prior artifact

Previous known-good release: tag **v1.2.0**. Redeploy that image / build to roll back
the service.

## Revert steps

1. Redeploy `v1.2.0`.
2. Revert the schema:
   ```
   node scripts/migrate.mjs verify-rollback   # confirms the latest migration reverses
   # then apply the down migration for the latest applied migration
   ```
3. Confirm `/healthz` on the redeployed instances.

## Migrations in this release

| Migration | Down | Reversible |
| --- | --- | --- |
| `0003_add_priority` | `0003_add_priority_down.sql` (`DROP COLUMN priority`) | Yes — the column is new, added with a default; dropping it loses nothing that predates the release. |

## Feature flags

None touched by this release.

## On-call / escalation

Primary on-call: Payments — Primary (PagerDuty). Escalate to the release manager if
the redeploy does not clear within 15 minutes.
