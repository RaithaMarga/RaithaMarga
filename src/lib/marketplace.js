import { STORAGE_KEYS } from '../data/storageKeys';

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

// Computes aggregate availability for a given crop name
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

  const totalQuantity = matching.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const unit = matching[0]?.unit || 'kg';
  const prices = matching.map((m) => Number(m.expectedPrice ?? m.price ?? 0)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const latestLocation = matching[0]?.location || matching[0]?.district || '';

  return {
    count: matching.length,
    totalQuantity,
    unit,
    minPrice,
    location: latestLocation,
  };
}
