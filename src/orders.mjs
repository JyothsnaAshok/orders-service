/**
 * The tiny orders module the migrations back. Just enough surface area for the
 * release candidate to show a real code diff alongside the schema change.
 */

/** @typedef {{ id: number, customer: string, total_cents: number }} Order */

/** Total value of all orders, in cents. */
export function totalCents(/** @type {Order[]} */ orders) {
  return orders.reduce((sum, o) => sum + o.total_cents, 0);
}

/** Orders for one customer. */
export function forCustomer(/** @type {Order[]} */ orders, /** @type {string} */ customer) {
  return orders.filter((o) => o.customer === customer);
}
