# Publishing this repo

One-time, from this directory. Creates `main` (tag `v1.2.0`) and the release
candidate branch `release/v1.3.0` that adds the irreversible migration.

```bash
git init -b main
git add .
git commit -m "orders-service v1.2.0 — orders module + migrations 0001, 0002"
git tag v1.2.0

# create the release candidate: the irreversible column drop + the matching code change
git checkout -b release/v1.3.0

cat > migrations/0003_drop_status_column_up.sql <<'SQL'
-- Release candidate under test touches this migration.
-- It drops a column with live data and has NO faithful reverse: the down migration
-- recreates the column but cannot restore the values. Rollback Check must flag this
-- as migration_reversible = false.
ALTER TABLE orders DROP COLUMN status;
SQL

cat > migrations/0003_drop_status_column_down.sql <<'SQL'
-- Structurally restores the column, but every row's status collapses to 'pending':
-- the original 'shipped' / 'pending' / 'refunded' values are gone. Schema and
-- row-count parity both pass; row-content parity is what catches the loss.
ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
SQL

# the code change that goes with dropping the column
git apply <<'PATCH' || true
PATCH
# (or hand-edit src/orders.mjs to remove statusLabel; keep it small)

git add migrations/0003_drop_status_column_up.sql migrations/0003_drop_status_column_down.sql
git commit -m "release/v1.3.0 — drop orders.status (superseded by fulfilments table)"

git checkout main
git remote add origin https://github.com/JyothsnaAshok/orders-service
git push -u origin main --tags
git push origin release/v1.3.0
```

Then in TrueForge: **Settings → Connectors → GitHub** with a fine-grained PAT scoped
to this repo (Contents: read, Actions: read). Release Guardian points its Readiness
and Rollback checks at `release/v1.3.0` vs `v1.2.0`.
