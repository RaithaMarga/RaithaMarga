import { STORAGE_KEYS } from '../data/storageKeys';
import { findImageCrop } from '../data/crops';

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

// Initial seed listings so the marketplace and homepage always have active produce visible
export const SEED_LISTINGS = [
  {
    id: 'listing-seed-onion',
    farmerId: 'farmer-local',
    farmerName: 'Basavarajappa Gowda',
    crop: 'Onion (ಈರುಳ್ಳಿ)',
    quantity: 332.5,
    unit: 'kg',
    grade: 'Grade A',
    expectedPrice: 33,
    price: 33,
    district: 'Kolar',
    taluk: 'Malur',
    village: 'Local Village',
    status: 'active',
    location: 'Local Village, Malur, Kolar',
    availabilityDate: '2026-10-15',
    createdAt: new Date().toISOString(),
    photos: [],
  },
  {
    id: 'listing-seed-tomato',
    farmerId: 'farmer-demo-2',
    farmerName: 'Manjunath Reddy',
    crop: 'Tomato (ಟೊಮೆಟೊ)',
    quantity: 500,
    unit: 'kg',
    grade: 'Grade A',
    expectedPrice: 18,
    price: 18,
    district: 'Kolar',
    taluk: 'Srinivaspur',
    village: 'Rayalpadu',
    status: 'active',
    location: 'Rayalpadu, Srinivaspur, Kolar',
    availabilityDate: '2026-10-14',
    createdAt: new Date().toISOString(),
    photos: [],
  },
  {
    id: 'listing-seed-potato',
    farmerId: 'farmer-demo-3',
    farmerName: 'Anand Kumar',
    crop: 'Potato (ಆಲೂಗಡ್ಡೆ)',
    quantity: 400,
    unit: 'kg',
    grade: 'Grade A',
    expectedPrice: 24,
    price: 24,
    district: 'Hassan',
    taluk: 'Channarayapatna',
    village: 'Kikkeri',
    status: 'active',
    location: 'Kikkeri, Channarayapatna, Hassan',
    availabilityDate: '2026-10-16',
    createdAt: new Date().toISOString(),
    photos: [],
  },
  {
    id: 'listing-seed-chilli',
    farmerId: 'farmer-demo-4',
    farmerName: 'Ramesh Patil',
    crop: 'Green Chilli (ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ)',
    quantity: 150,
    unit: 'kg',
    grade: 'Grade A',
    expectedPrice: 42,
    price: 42,
    district: 'Haveri',
    taluk: 'Byadagi',
    village: 'Motebennur',
    status: 'active',
    location: 'Motebennur, Byadagi, Haveri',
    availabilityDate: '2026-10-15',
    createdAt: new Date().toISOString(),
    photos: [],
  },
];

export function getStoredMarketplaceListings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MARKETPLACE_LISTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(SEED_LISTINGS));
      return SEED_LISTINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_LISTINGS;
  } catch {
    return SEED_LISTINGS;
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
  return listing?.photos?.[0] || findImageCrop(listing?.crop)?.image || null;
}

const TO_KG = { kg: 1, quintal: 100, ton: 1000 };

// Computes aggregate availability for a given crop name.
// kg / quintal / ton are converted and summed as kg; other units (dozen, crate) are kept separate.
export function getCropAvailability(cropName, listings = null) {
  if (!cropName) return null;
  const allListings = listings || getStoredMarketplaceListings();
  const cleanTarget = String(cropName).replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();

  const matching = allListings.filter((l) => {
    if (l.status && l.status !== 'active') return false;
    const lCrop = String(l.crop || '').replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();
    return lCrop === cleanTarget || lCrop.replace(/-/g, ' ') === cleanTarget.replace(/-/g, ' ');
  });

  if (!matching.length) return null;

  const byUnit = {};
  matching.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const unit = String(item.unit || 'kg').toLowerCase();
    const key = TO_KG[unit] ? 'kg' : unit;
    byUnit[key] = (byUnit[key] || 0) + qty * (TO_KG[unit] || 1);
  });
  const totals = Object.entries(byUnit)
    .map(([unit, quantity]) => ({ unit, quantity: Math.round(quantity * 100) / 100 }))
    .filter((t) => t.quantity > 0)
    .sort((a, b) => (a.unit === 'kg' ? -1 : b.unit === 'kg' ? 1 : 0));
  if (!totals.length) return null;

  const prices = matching.map((m) => Number(m.expectedPrice ?? m.price ?? 0)).filter(Boolean);

  return {
    count: matching.length,
    totals,
    totalQuantity: totals[0].quantity,
    unit: totals[0].unit,
    minPrice: prices.length ? Math.min(...prices) : null,
    location: matching[0]?.location || matching[0]?.district || '',
  };
}

// ---------------------------------------------------------------------------
// Local deals: listings that only exist in this browser (demo/seed listings, or ones the
// farmer saved locally because the backend was unreachable) are unknown to the backend, so
// "I'm Interested" on them is handled here instead of via POST /deals.
// ---------------------------------------------------------------------------
export const isLocalListing = (listingOrId) => {
  const id = typeof listingOrId === 'object' ? listingOrId?.id : listingOrId;
  return String(id || '').startsWith('listing-');
};
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
