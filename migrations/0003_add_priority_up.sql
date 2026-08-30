-- release/v1.4.0: add an order priority. Reversible — the column is new, added with
-- a default, so dropping it in the down migration loses nothing that existed before.
ALTER TABLE orders ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;
