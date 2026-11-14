import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCartLine,
  buyerCartStorageKey,
  cartLineTotal,
  cartSubtotal,
  cartTotals,
  mergeGuestCart,
  clearCheckoutIdempotencyKey,
  getCheckoutIdempotencyKey,
  readBuyerCart,
  removeCartLine,
  updateCartLineQuantity,
  writeBuyerCart,
} from '../src/lib/cart.js';
import { resolveAvailabilityCart } from '../src/lib/resolveCart.js';

const listing = (id, overrides = {}) => ({
  id,
  crop: `Crop ${id}`,
  farmerName: 'Test farmer',
  quantity: 100,
  unit: 'kg',
  expectedPrice: 18.5,
  ...overrides,
});

test('adds 1, 10, and 50 distinct lines without an artificial small-cart cap', () => {
  for (const count of [1, 10, 50]) {
    const cart = Array.from({ length: count }, (_, index) => listing(`server-${count}-${index}`))
      .reduce((items, item) => addCartLine(items, item), []);
    assert.equal(cart.length, count);
  }
});

test('adding the same listing updates its existing line and preserves distinct listings', () => {
  const cart = addCartLine(addCartLine([], listing('listing-a')), listing('listing-a'));
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);
  assert.equal(cartSubtotal(cart), 37);
});

test('edits and removes lines using immutable cart data and calculates totals', () => {
  const cart = [listing('server-a'), listing('server-b', { expectedPrice: 25 })]
    .reduce((items, item) => addCartLine(items, item), []);
  const edited = updateCartLineQuantity(cart, 'server-a', 3.5);
  assert.equal(edited[0].quantity, 3.5);
  assert.equal(cartLineTotal(edited[0]), 64.75);
  assert.equal(cartSubtotal(edited), 89.75);
  assert.equal(removeCartLine(edited, 'server-b').length, 1);
  assert.equal(edited.length, 2);
});

test('buyer carts persist in separate UID-scoped storage keys', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
  const buyerCart = addCartLine([], listing('server-a'));
  writeBuyerCart('buyer-a', buyerCart, storage);
  assert.deepEqual(readBuyerCart('buyer-a', storage), buyerCart);
  assert.deepEqual(readBuyerCart('buyer-b', storage), []);
  assert.notEqual(buyerCartStorageKey('buyer-a'), buyerCartStorageKey('buyer-b'));
});

test('checkout retries reuse the buyer-scoped key for identical cart contents', () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  const cart = [listing('server-a'), listing('server-b', { expectedPrice: 25 })]
    .reduce((items, item) => addCartLine(items, item), []);
  const firstKey = getCheckoutIdempotencyKey('buyer-a', cart, storage);

  assert.equal(getCheckoutIdempotencyKey('buyer-a', cart, storage), firstKey);
  assert.notEqual(getCheckoutIdempotencyKey('buyer-b', cart, storage), firstKey);
  assert.notEqual(getCheckoutIdempotencyKey('buyer-a', [...cart].reverse(), storage), firstKey);

  clearCheckoutIdempotencyKey('buyer-a', storage);
  assert.notEqual(getCheckoutIdempotencyKey('buyer-a', cart, storage), firstKey);
});

test('rejects a quantity greater than the cart stock snapshot', () => {
  const cart = addCartLine([], listing('server-a', { quantity: 5 }));
  assert.throws(() => updateCartLineQuantity(cart, 'server-a', 6), /available stock/);
});

test('adds the exact typed quantity and calculates both 1% fees in rupees', () => {
  const cart = addCartLine([], listing('server-tomato', { quantity: 1000, expectedPrice: 25 }), 100);
  assert.equal(cart[0].quantity, 100);
  assert.deepEqual(cartTotals(cart), { subtotal: 2500, fee: 25, total: 2525, farmerReceives: 2475 });
  assert.equal(cartTotals(updateCartLineQuantity(cart, 'server-tomato', 150)).total, 3787.5);
  assert.throws(() => addCartLine([], listing('server-tomato'), 0));
  assert.throws(() => updateCartLineQuantity(cart, 'server-tomato', 0.5));
});

test('merges guest selections into a buyer cart without mixing other buyers', () => {
  const saved = addCartLine([], listing('server-a'), 20);
  const guest = addCartLine(addCartLine([], listing('server-a'), 30), listing('server-b'), 50);
  const merged = mergeGuestCart(saved, guest);
  assert.equal(merged.find((line) => line.listingId === 'server-a').quantity, 50);
  assert.equal(merged.find((line) => line.listingId === 'server-b').quantity, 50);
  assert.equal(saved[0].quantity, 20);
  assert.equal(mergeGuestCart(saved, [ { ...guest[0], quantity: 100 } ])[0].quantity, 100);
});

test('resolves public crop totals into actual farmer listings without changing price or quantity', () => {
  const guest = addCartLine([], listing('public-Tomato-kg', { crop: 'Tomato', quantity: 1000, expectedPrice: 25, pendingAvailability: true }), 100);
  const farmers = [listing('server-a', { crop: 'Tomato', quantity: 60, expectedPrice: 25, status: 'active' }), listing('server-b', { crop: 'Tomato', quantity: 100, expectedPrice: 25, status: 'active' })];
  const resolved = resolveAvailabilityCart(guest, farmers);
  assert.deepEqual(resolved.map((line) => [line.listingId, line.quantity]), [['server-a', 60], ['server-b', 40]]);
  assert.equal(cartSubtotal(resolved), 2500);
  assert.equal(guest[0].pendingAvailability, true);
  assert.deepEqual(resolveAvailabilityCart(guest, []), guest);
  assert.deepEqual(resolveAvailabilityCart(guest, farmers.map((line) => ({ ...line, expectedPrice: 30 }))), guest);
});

test('public stock allocation accounts for farmer quantities already in the cart', () => {
  const farmer = listing('server-a', { crop: 'Tomato', quantity: 100, expectedPrice: 25, status: 'active' });
  const saved = addCartLine([], farmer, 20);
  const guest = addCartLine(saved, { ...farmer, id: 'public-Tomato-kg', pendingAvailability: true }, 70);
  const resolved = resolveAvailabilityCart(guest, [farmer]);
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0].quantity, 90);
  assert.equal(saved[0].quantity, 20);
});
