// Central registry of localStorage keys used across the app.
export const STORAGE_KEYS = {
  FARMER_PROFILE: 'raithamarga.farmerProfile',
  BUYER_PROFILE: 'raithamarga.buyerProfile',
  MARKETPLACE_LISTINGS: 'raithamarga.marketplaceListings',
  BUYER_DEALS: 'raithamarga.buyerDeals',
};

export function accountStorageKey(key, uid) {
  if (!uid) throw new Error('A signed-in account is required for profile storage.');
  return `${key}.${encodeURIComponent(uid)}`;
}