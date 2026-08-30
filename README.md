# orders-service

A deliberately small demo application used as the **release candidate under test** by
[Release Guardian](https://github.com/JyothsnaAshok/Release-Guardian). It is not a real
service — it exists so the Guardian's checks have a real GitHub repo to read:

- **Readiness Check** reads the diff since the last release, the CI/Actions status, and
  the migration files it touches.
- **Rollback Check** reads the `up` / `down` migration SQL and replays it in a sandbox
  to verify the release can actually be undone.

## Layout

```
migrations/      NNNN_up.sql / NNNN_down.sql pairs + seed.sql
src/             the tiny orders module the migrations back
scripts/         migrate.mjs — apply up/down migrations to a SQLite file
.github/workflows/ci.yml   runs the migration round-trip + the unit test
```

## Releases

| Ref | What it is |
| --- | --- |
| tag `v1.2.0` | last shipped release — the compare base |
| branch `release/v1.3.0` | the candidate: adds `0003_drop_status_column`, which **cannot be faithfully reversed** (the `down` migration recreates the column but the row values are gone) |

CI is green on both — a human reading the PR would ship it. The Rollback Check is what
catches that `v1.3.0` is not safely reversible.

## Run locally

```bash
npm install
npm test
node scripts/migrate.mjs up   ./data.sqlite
node scripts/migrate.mjs down ./data.sqlite
```
