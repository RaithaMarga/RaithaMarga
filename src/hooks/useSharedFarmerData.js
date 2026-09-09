import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';

/**
 * Read-only view of published farmer listings, for Browse Produce.
 * There's no backend yet, so this is the same localStorage key the
 * Farmer Dashboard writes to — see src/data/storageKeys.js.
 */
export function useFarmerListings() {
  const [listings] = useLocalStorage(STORAGE_KEYS.FARMER_LISTINGS, []);
  return listings;
}

/**
 * Read-only view of the farmer's verification status, for showing a
 * trust badge next to listings. Never treat anything other than the
 * stored 'verified' status as verified.
 */
export function useFarmerVerification() {
  const [verification] = useLocalStorage(STORAGE_KEYS.FARMER_VERIFICATION, {
    status: 'not_submitted',
    documents: [],
    submittedAt: null,
  });
  return verification;
}
