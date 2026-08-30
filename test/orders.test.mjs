import { test } from 'node:test';
import assert from 'node:assert/strict';
import { totalCents, forCustomer, byPriority } from '../src/orders.mjs';

const sample = [
  { id: 1, customer: 'acme', total_cents: 12000, priority: 0 },
  { id: 2, customer: 'globex', total_cents: 4500, priority: 5 },
  { id: 3, customer: 'initech', total_cents: 9900, priority: 0 },
];

test('totalCents sums every order', () => {
  assert.equal(totalCents(sample), 26400);
});

test('forCustomer filters by customer', () => {
  assert.deepEqual(forCustomer(sample, 'globex'), [sample[1]]);
});

test('byPriority sorts highest priority first, then by id', () => {
  assert.deepEqual(
    byPriority(sample).map((o) => o.id),
    [2, 1, 3],
  );
});
