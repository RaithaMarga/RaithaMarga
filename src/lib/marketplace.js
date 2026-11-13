import { STORAGE_KEYS } from '../data/storageKeys';
import { findImageCrop } from '../data/crops';

export { isLocalListing } from './listingIds.js';

export function fromApiListing(listing) {
  return {
    ...listing,
    expectedPrice: listing.expectedPrice ?? listing.price,
    price: listing.price ?? listing.expectedPrice,
    quantity: listing.availableQuantity ?? listing.quantity,
    location: listing.location || [listing.village, listing.taluk, listing.district].filter(Boolean).join(', '),
    status: String(listing.status || 'active').toLowerCase(),
    photos: listing.photos || [],
  };
}

export function toApiListing(listing, profile = {}) {
  const placeParts = String(listing.location || '').split(',').map((part) => part.trim()).filter(Boolean);
  const cleanCrop = String(listing.crop || '').replace(/\s*\([^)]*\)/g, '').trim();
  return {
    crop: cleanCrop || listing.crop,
    quantity: Number(listing.quantity),
    unit: listing.unit || 'kg',
    grade: listing.grade || null,
    price: Number(listing.expectedPrice),
    district: profile?.district || placeParts.at(-1) || 'Kolar',
    taluk: profile?.taluk || placeParts.at(-2) || null,
    village: profile?.village || placeParts[0] || null,
    state: profile?.state || 'Karnataka',
    availabilityDate: listing.availabilityDate,
  };
}

export function fromApiRequirement(requirement) {
  return {
    ...requirement,
    requiredQuantity: requirement.quantity,
    district: requirement.location,
    status: String(requirement.status || '').toLowerCase(),
  };
}

export function fromApiDeal(deal) {
  return {
    ...deal,
    status: String(deal.status || '').toLowerCase(),
    agreedPrice: deal.price,
    totalAmount: Number(deal.quantity || 0) * Number(deal.price || 0),
  };
}

// Older builds shipped four made-up "demo farmer" listings and wrote them into every browser's
// localStorage. They are no longer created, and any copy already saved is dropped on read.
const isLegacyDemoListing = (item) =>
  String(item?.id || '').startsWith('listing-seed-') || String(item?.farmerId || '').startsWith('farmer-demo');

function writeStoredListings(listings) {
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(listings));
}

export function getStoredMarketplaceListings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKETPLACE_LISTINGS) || '[]');
    if (!Array.isArray(parsed)) return [];
    const cleaned = parsed.filter((item) => !isLegacyDemoListing(item));
    if (cleaned.length !== parsed.length) writeStoredListings(cleaned);
    return cleaned;
  } catch {
    return [];
  }
}

export function saveStoredMarketplaceListing(newListing) {
  try {
    const current = getStoredMarketplaceListings();
    const formatted = fromApiListing(newListing);
    const updated = [formatted, ...current.filter((item) => item.id !== formatted.id)];
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('raithamarga-listings-changed'));
    return updated;
  } catch (err) {
    console.error('Failed to save listing to storage:', err);
    return [];
  }
}

export function removeStoredMarketplaceListing(id) {
  const remaining = getStoredMarketplaceListings().filter((item) => item.id !== id);
  writeStoredListings(remaining);
  window.dispatchEvent(new Event('raithamarga-listings-changed'));
}

// Merge several listing arrays by id (earlier arrays win), newest first.
export function mergeListings(...lists) {
  const map = new Map();
  lists.flat().forEach((item) => {
    if (item && !map.has(item.id)) map.set(item.id, item);
  });
  return Array.from(map.values());
}

// Image for a listing. Crop images live in the frontend bundle only (src/assets/images),
// they are looked up by crop name and are never sent to or stored by the backend.
export function getListingImage(listing) {
  if (listing?.managed) return findImageCrop(listing.crop)?.image || null;
  return listing?.photos?.[0] || findImageCrop(listing?.crop)?.image || null;
}

const TO_KG = { kg: 1, quintal: 100, ton: 1000 };

// Benchmark rates for crops (APMC average reference) when no active farmer has listed yet
export const CROP_BENCHMARKS = {
  tomato: 24,
  onion: 28,
  potato: 25,
  'green-chilli': 45,
  carrot: 35,
  cabbage: 20,
  cauliflower: 30,
  brinjal: 28,
  okra: 35,
  cucumber: 22,
  beans: 42,
  spinach: 18,
  mango: 60,
  banana: 30,
  apple: 120,
  orange: 55,
  papaya: 25,
  watermelon: 18,
  grapes: 75,
  pineapple: 40,
  guava: 35,
  pomegranate: 110,
  jackfruit: 30,
  lemon: 65,
};

// Computes aggregate availability and average farmer prices for a given crop name.
// When multiple farmers list different prices (e.g. Farmer 1: ₹23, Farmer 2: ₹24),
// computes the average price (₹23.5) and price range to display transparently.
export function getCropAvailability(cropName, listings = null) {
  if (!cropName) return null;
  const allListings = listings || getStoredMarketplaceListings();
  const targetImageCrop = findImageCrop(cropName);
  const cleanTarget = String(cropName).replace(/\s*\([^)]*\)/g, '').trim().toLowerCase().replace(/[\s_]+/g, ' ');

  const matching = allListings.filter((l) => {
    const listingImageCrop = findImageCrop(l.crop);
    const lCrop = String(l.crop || '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase().replace(/[\s_]+/g, ' ');
    if (targetImageCrop && listingImageCrop) return targetImageCrop.id === listingImageCrop.id;
    return lCrop === cleanTarget || lCrop.replace(/-/g, ' ') === cleanTarget.replace(/-/g, ' ');
  });

  const cropKey = targetImageCrop?.id || cleanTarget.replace(/\s+/g, '-');
  const benchmarkPrice = CROP_BENCHMARKS[cropKey] || 25;

  if (!matching.length) {
    return {
      count: 0,
      activeCount: 0,
      totals: [],
      totalQuantity: 0,
      unit: 'kg',
      averagePrice: null,
      minPrice: null,
      maxPrice: null,
      hasPriceRange: false,
      farmerCount: 0,
      benchmarkPrice,
      isSoldOut: false,
      isOpenToList: true,
      location: '',
    };
  }

  // Active listings with available stock
  const activeMatching = matching.filter(
    (l) => (!l.status || l.status === 'active') && Number(l.quantity) > 0
  );

  const byUnit = {};
  matching.forEach((item) => {
    // Only tally quantity for active listings
    if (item.status && item.status !== 'active') return;
    const qty = Number(item.quantity) || 0;
    const unit = String(item.unit || 'kg').toLowerCase();
    const key = TO_KG[unit] ? 'kg' : unit;
    byUnit[key] = (byUnit[key] || 0) + qty * (TO_KG[unit] || 1);
  });

  const totals = Object.entries(byUnit)
    .map(([unit, quantity]) => ({ unit, quantity: Math.round(quantity * 100) / 100 }))
    .filter((t) => t.quantity > 0)
    .sort((a, b) => (a.unit === 'kg' ? -1 : b.unit === 'kg' ? 1 : 0));

  const totalQuantity = totals.length ? totals[0].quantity : 0;

  // Determine if crop is sold out (was listed by farmers, but total available quantity is now 0)
  const isSoldOut = matching.length > 0 && totalQuantity <= 0;

  // Compute prices based on active listings, or previous listing prices if sold out
  const priceSourceListings = activeMatching.length > 0 ? activeMatching : matching;
  const prices = priceSourceListings
    .map((m) => Number(m.expectedPrice ?? m.price ?? 0))
    .filter(Boolean);

  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const sumPrice = prices.reduce((acc, p) => acc + p, 0);
  // User requested: "e.g. tomato one farmer 23 rs, another 24 rs calculate average of it and display in home page"
  const averagePrice = prices.length
    ? Math.round((sumPrice / prices.length) * 10) / 10
    : null;

  const uniqueFarmers = new Set(
    priceSourceListings
      .map((m) => m.farmerName || m.farmerId)
      .filter(Boolean)
  ).size || priceSourceListings.length;

  return {
    count: matching.length,
    activeCount: activeMatching.length,
    totals,
    totalQuantity,
    unit: totals.length ? totals[0].unit : 'kg',
    minPrice,
    maxPrice,
    averagePrice,
    hasPriceRange: minPrice !== null && maxPrice !== null && minPrice !== maxPrice,
    farmerCount: uniqueFarmers,
    benchmarkPrice,
    isSoldOut,
    isOpenToList: !isSoldOut && totalQuantity <= 0,
    location: matching[0]?.location || matching[0]?.district || '',
  };
}

// ---------------------------------------------------------------------------
// Local deals: listings that only exist in this browser (demo/seed listings, or ones the
// farmer saved locally because the backend was unreachable) are unknown to the backend, so
// "I'm Interested" on them is handled here instead of via POST /deals.
// ---------------------------------------------------------------------------
export const isLocalDeal = (dealOrId) => {
  const id = typeof dealOrId === 'object' ? dealOrId?.id : dealOrId;
  return String(id || '').startsWith('deal-local-');
};

export function getStoredDeals() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUYER_DEALS) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredDeals(deals) {
  localStorage.setItem(STORAGE_KEYS.BUYER_DEALS, JSON.stringify(deals));
  window.dispatchEvent(new Event('raithamarga-deals-changed'));
}

function adjustStoredListingQuantity(listingId, delta) {
  const current = getStoredMarketplaceListings();
  const updated = current.map((item) => {
    if (item.id !== listingId) return item;
    const quantity = Math.max(0, Number(item.quantity || 0) + delta);
    const status = quantity === 0 ? 'sold' : (item.status === 'sold' ? 'active' : item.status);
    return { ...item, quantity, status };
  });
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(updated));
  window.dispatchEvent(new Event('raithamarga-listings-changed'));
}

export function createLocalDeal(listing, quantity, buyerId) {
  const qty = Math.min(Number(quantity) || 0, Number(listing.quantity) || 0);
  if (qty <= 0) throw new Error('This listing has no quantity left.');
  const deal = {
    id: `deal-local-${Date.now()}`,
    listingId: listing.id,
    buyerId,
    farmerId: listing.farmerId,
    quantity: qty,
    price: Number(listing.expectedPrice ?? listing.price),
    status: 'INTERESTED',
    crop: listing.crop,
    unit: listing.unit,
    location: listing.location,
    createdAt: new Date().toISOString(),
  };
  writeStoredDeals([deal, ...getStoredDeals()]);
  adjustStoredListingQuantity(listing.id, -qty);
  return deal;
}

export function updateLocalDealStatus(dealId, status) {
  const deals = getStoredDeals();
  const deal = deals.find((d) => d.id === dealId);
  if (!deal) throw new Error('Deal was not found.');
  const wasOpen = !['CANCELLED', 'FAILED'].includes(String(deal.status).toUpperCase());
  writeStoredDeals(deals.map((d) => (d.id === dealId ? { ...d, status } : d)));
  // Cancelling gives the quantity back to the listing (and to the home page totals).
  if (status === 'CANCELLED' && wasOpen) adjustStoredListingQuantity(deal.listingId, Number(deal.quantity) || 0);
  return { ...deal, status };
}
