import { isLocalListing } from './listingIds.js';

export const MAX_CHECKOUT_LINES = 100;

export function buyerCartStorageKey(uid) {
  if (!uid) throw new Error('A signed-in buyer is required to access the cart.');
  return `raithamarga.buyerCart.${encodeURIComponent(uid)}`;
}

export function readBuyerCart(uid, storage = globalThis.localStorage) {
  const raw = storage.getItem(buyerCartStorageKey(uid));
  if (!raw) return [];
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) throw new Error('The saved cart data is invalid.');
  return items;
}

export function writeBuyerCart(uid, items, storage = globalThis.localStorage) {
  storage.setItem(buyerCartStorageKey(uid), JSON.stringify(items));
}

function checkoutAttemptStorageKey(uid) {
  if (!uid) throw new Error('A signed-in buyer is required to check out.');
  return `raithamarga.checkoutAttempt.${encodeURIComponent(uid)}`;
}

function checkoutSignature(items) {
  return JSON.stringify(items.map((item) => [
    item.listingId,
    Number(item.quantity),
    Number(item.expectedPrice),
  ]));
}

export function getCheckoutIdempotencyKey(uid, items, storage = globalThis.localStorage) {
  const key = checkoutAttemptStorageKey(uid);
  const signature = checkoutSignature(items);
  const previous = storage.getItem(key);
  if (previous) {
    const attempt = JSON.parse(previous);
    if (attempt.signature === signature && typeof attempt.idempotencyKey === 'string') {
      return attempt.idempotencyKey;
    }
  }

  const idempotencyKey = globalThis.crypto?.randomUUID?.().replaceAll('-', '_');
  if (!idempotencyKey) throw new Error('Secure checkout is unavailable in this browser.');
  storage.setItem(key, JSON.stringify({ signature, idempotencyKey }));
  return idempotencyKey;
}

export function clearCheckoutIdempotencyKey(uid, storage = globalThis.localStorage) {
  storage.removeItem(checkoutAttemptStorageKey(uid));
}

export function addCartLine(items, listing, quantity = 1) {
  const id = String(listing?.id || '');
  const stock = Number(listing?.quantity);
  const price = Number(listing?.expectedPrice ?? listing?.price);
  if (!id || !Number.isFinite(stock) || stock <= 0 || !Number.isFinite(price) || price <= 0) {
    throw new Error('This produce listing is missing valid stock or price information.');
  }
  const existing = items.find((item) => item.listingId === id);
  if (existing?.deal) throw new Error('A deal already exists for this cart line. View your deals or remove this line before adding it again.');
  const startingQuantity = Number(quantity);
  if (!Number.isFinite(startingQuantity) || startingQuantity < 1 || startingQuantity > stock) {
    throw new Error(`Enter a quantity from 1 to ${stock} ${listing.unit || 'kg'}.`);
  }
  if (existing && existing.quantity + startingQuantity > stock) {
    throw new Error('The cart quantity cannot exceed the currently available stock.');
  }
  const line = {
    listingId: id,
    crop: listing.crop || 'Produce',
    farmerName: listing.farmerName || 'Farmer',
    unit: listing.unit || 'kg',
    quantity: (existing?.quantity || 0) + startingQuantity,
    expectedPrice: price,
    availableQuantity: stock,
    managed: Boolean(listing.managed),
    localOnly: isLocalListing(listing),
    photos: listing.photos || [],
    pendingAvailability: Boolean(listing.pendingAvailability),
  };
  return existing
    ? items.map((item) => item.listingId === id ? line : item)
    : [...items, line];
}

export function updateCartLineQuantity(items, listingId, quantity) {
  const nextQuantity = Number(quantity);
  const line = items.find((item) => item.listingId === listingId);
  if (!line) return items;
  if (line.deal) throw new Error('This deal quantity is agreed. View your deals for details.');
  if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
    throw new Error('Enter a quantity of at least 1.');
  }
  if (nextQuantity > Number(line.availableQuantity)) {
    throw new Error('Quantity cannot exceed the available stock shown in the cart.');
  }
  return items.map((item) => item.listingId === listingId
    ? { ...item, quantity: nextQuantity }
    : item);
}

export function removeCartLine(items, listingId) {
  return items.filter((item) => item.listingId !== listingId);
}

export function cartLineTotal(item) {
  return Math.round(Number(item.quantity) * Number(item.expectedPrice) * 100) / 100;
}

export function cartSubtotal(items) {
  return Math.round(items.reduce((total, item) => total + Math.round(cartLineTotal(item) * 100), 0)) / 100;
}

export function cartTotals(items) {
  const subtotal = cartSubtotal(items);
  const fee = Math.round(subtotal) / 100;
  return { subtotal, fee, total: Math.round((subtotal + fee) * 100) / 100, farmerReceives: Math.round((subtotal - fee) * 100) / 100 };
}

export function mergeGuestCart(saved, guest) {
  return guest.reduce((items, line) => {
    const existing = items.find((item) => item.listingId === line.listingId);
    return [...items.filter((item) => item.listingId !== line.listingId), {
      ...line, quantity: Math.min(Number(line.availableQuantity), Number(line.quantity) + Number(existing?.quantity || 0)),
    }];
  }, saved);
}
