/**
 * Minimal SQL migration runner for the demo service.
 *
 *   node scripts/migrate.mjs up <db>
 *       Apply every migration except the latest, load seed.sql (this is the
 *       "production" state the release inherits), then apply the latest migration.
 *
 *   node scripts/migrate.mjs down <db>
 *       Revert the highest-numbered migration.
 *
 *   node scripts/migrate.mjs verify-rollback <db>
 *       Snapshot the DB at the pre-latest-migration state (everything except the
 *       latest migration, plus seed). Then apply the latest up followed by the
 *       latest down and snapshot again. Exit 0 if the two snapshots are identical
 *       (the latest migration reverses cleanly), 1 if they differ (data or schema
 *       was lost). Prints the diff.
 *
 * Release Guardian's Rollback Check runs `verify-rollback` in a sandbox against the
 * release candidate's checkout.
 */

import Database from 'better-sqlite3';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIG_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

const [, , cmd, dbPath] = process.argv;
if (!cmd || !dbPath) {
  console.error('usage: migrate.mjs <up|down|verify-rollback> <db-path>');
  process.exit(2);
}

/** Ordered migration numbers, e.g. ['0001','0002','0003']. */
function migrationIds() {
  const ids = new Set();
  for (const f of readdirSync(MIG_DIR)) {
    const m = /^(\d+)_.*_(up|down)\.sql$/.exec(f);
    if (m) ids.add(m[1]);
  }
  return [...ids].sort();
}

function sqlFor(id, direction) {
  const file = readdirSync(MIG_DIR).find((f) => f.startsWith(`${id}_`) && f.endsWith(`_${direction}.sql`));
  if (!file) throw new Error(`no ${direction} migration for ${id}`);
  return readFileSync(join(MIG_DIR, file), 'utf8');
}

const applyUp = (db, id) => db.exec(sqlFor(id, 'up'));
const applyDown = (db, id) => db.exec(sqlFor(id, 'down'));
const seed = (db) => db.exec(readFileSync(join(MIG_DIR, 'seed.sql'), 'utf8'));

/** Full logical snapshot: every table's schema + all rows, order-stable. */
function snapshot(db) {
  const tables = db
    .prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all();
  return tables.map((t) => {
    const cols = db.prepare(`PRAGMA table_info(${t.name})`).all().map((c) => c.name);
    const rows = db.prepare(`SELECT * FROM ${t.name} ORDER BY ${cols[0]}`).all();
    return { table: t.name, schema: t.sql.replace(/\s+/g, ' ').trim(), rows };
  });
}

function fresh(path) {
  rmSync(path, { force: true });
  return new Database(path);
}

/** Bring a fresh DB to the state the release inherits: earlier migrations + seed. */
function toPreLatest(db, earlier) {
  for (const id of earlier) applyUp(db, id);
  seed(db);
}

const ids = migrationIds();
const latest = ids.at(-1);
const earlier = ids.slice(0, -1);

if (cmd === 'up') {
  const db = fresh(dbPath);
  toPreLatest(db, earlier);
  applyUp(db, latest);
  console.log(`applied ${ids.length} migration(s) over seed -> ${dbPath}`);
  process.exit(0);
}

if (cmd === 'down') {
  const db = new Database(dbPath);
  applyDown(db, latest);
  console.log(`reverted ${latest} on ${dbPath}`);
  process.exit(0);
}

if (cmd === 'verify-rollback') {
  const db = fresh(dbPath);
  toPreLatest(db, earlier);
  const before = JSON.stringify(snapshot(db));

  applyUp(db, latest);
  applyDown(db, latest);
  const after = JSON.stringify(snapshot(db));

  if (before === after) {
    console.log(`OK: migration ${latest} reverses cleanly (snapshots match)`);
    process.exit(0);
  }
  console.error(`LOSS: migration ${latest} does not reverse cleanly.`);
  console.error('before:', before);
  console.error('after :', after);
  process.exit(1);
}

console.error(`unknown command: ${cmd}`);
process.exit(2);
