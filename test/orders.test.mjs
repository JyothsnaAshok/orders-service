import { test } from 'node:test';
import assert from 'node:assert/strict';
import { totalCents, forCustomer, statusLabel } from '../src/orders.mjs';

const sample = [
  { id: 1, customer: 'acme', total_cents: 12000, status: 'shipped' },
  { id: 2, customer: 'globex', total_cents: 4500, status: 'pending' },
  { id: 3, customer: 'initech', total_cents: 9900, status: 'refunded' },
];

test('totalCents sums every order', () => {
  assert.equal(totalCents(sample), 26400);
});

test('forCustomer filters by customer', () => {
  assert.deepEqual(forCustomer(sample, 'globex'), [sample[1]]);
});

test('statusLabel maps known states and falls back to pending', () => {
  assert.equal(statusLabel(sample[0]), 'Shipped');
  assert.equal(statusLabel({ id: 9, customer: 'x', total_cents: 0 }), 'Pending');
});
