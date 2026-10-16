import { STORAGE_KEYS } from '../data/storageKeys';
import { getStoredMarketplaceListings, saveStoredMarketplaceListing } from './marketplace';

// "Assisted" farmers are added by the RaithaMarga team (for example from a WhatsApp message).
// They have no login and no email: just a name and a contact number.

export const normalizePhone = (value) => String(value || '').replace(/\D/g, '').slice(-10);

export function getAssistedFarmers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSISTED_FARMERS) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFarmers(farmers) {
  localStorage.setItem(STORAGE_KEYS.ASSISTED_FARMERS, JSON.stringify(farmers));
  window.dispatchEvent(new Event('raithamarga-assisted-farmers-changed'));
}

/** Creates the farmer, or updates the existing one with the same phone number. */
export function saveAssistedFarmer({ name, phone, village, taluk, district, notes }) {
  const farmers = getAssistedFarmers();
  const key = normalizePhone(phone);
  const existing = farmers.find((f) => normalizePhone(f.phone) === key);
  const record = {
    id: existing?.id || `assisted-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    village: village?.trim() || '',
    taluk: taluk?.trim() || '',
    district: district?.trim() || '',
    notes: notes?.trim() || '',
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  writeFarmers([record, ...farmers.filter((f) => f.id !== record.id)]);
  return { farmer: record, isNew: !existing };
}

/** Puts the farmer's produce on the shared marketplace (home page + buyer dashboard). */
export function addAssistedListing(farmer, produce) {
  const location = [farmer.village, farmer.taluk, farmer.district].filter(Boolean).join(', ');
  const listing = {
    id: `listing-${Date.now()}`,
    farmerId: farmer.id,
    farmerName: farmer.name,
    contactPhone: farmer.phone,
    source: 'admin',
    crop: produce.crop.trim(),
    quantity: Number(produce.quantity),
    unit: produce.unit || 'kg',
    grade: produce.grade || null,
    expectedPrice: Number(produce.price),
    price: Number(produce.price),
    village: farmer.village,
    taluk: farmer.taluk,
    district: farmer.district,
    location,
    availabilityDate: produce.availabilityDate || new Date().toISOString().slice(0, 10),
    status: 'active',
    createdAt: new Date().toISOString(),
    photos: [],
  };
  saveStoredMarketplaceListing(listing);
  return listing;
}

export function removeAssistedFarmer(farmerId) {
  writeFarmers(getAssistedFarmers().filter((f) => f.id !== farmerId));
  const remaining = getStoredMarketplaceListings().filter((l) => l.farmerId !== farmerId);
  localStorage.setItem(STORAGE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(remaining));
  window.dispatchEvent(new Event('raithamarga-listings-changed'));
}
