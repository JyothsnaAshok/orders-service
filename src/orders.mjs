/**
 * The tiny orders module the migrations back. Just enough surface area for the
 * release candidate to show a real code diff alongside the schema change.
 */

/** @typedef {{ id: number, customer: string, total_cents: number, status?: string }} Order */

/** Total value of all orders, in cents. */
export function totalCents(/** @type {Order[]} */ orders) {
  return orders.reduce((sum, o) => sum + o.total_cents, 0);
}

/** Orders for one customer. */
export function forCustomer(/** @type {Order[]} */ orders, /** @type {string} */ customer) {
  return orders.filter((o) => o.customer === customer);
}

/** Human label for an order's fulfilment state. */
export function statusLabel(/** @type {Order} */ order) {
  switch (order.status) {
    case 'shipped':
      return 'Shipped';
    case 'refunded':
      return 'Refunded';
    case 'pending':
    case undefined:
      return 'Pending';
    default:
      return order.status;
  }
}
