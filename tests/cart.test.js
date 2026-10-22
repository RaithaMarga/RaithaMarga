import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addCartLine,
  buyerCartStorageKey,
  cartLineTotal,
  cartSubtotal,
  clearCheckoutIdempotencyKey,
  getCheckoutIdempotencyKey,
  readBuyerCart,
  removeCartLine,
  updateCartLineQuantity,
  writeBuyerCart,
} from '../src/lib/cart.js';

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
