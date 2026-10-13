import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from '../context/useAuth';
import { apiRequest } from '../lib/api';
import { fromApiListing, getStoredMarketplaceListings, mergeListings } from '../lib/marketplace';

/**
 * Live marketplace listings for any page (including the public home page).
 * - Always reads the shared local marketplace store, and refreshes the moment a farmer
 *   publishes (same tab via 'raithamarga-listings-changed', other tabs via 'storage').
 * - If someone is signed in, also merges the backend listings.
 */
export function useMarketplaceListings() {
  const { user } = useAuth();
  const [stored, setStored] = useState(getStoredMarketplaceListings);
  const [remote, setRemote] = useState([]);

  useEffect(() => {
    const refresh = () => setStored(getStoredMarketplaceListings());
    const onStorage = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.MARKETPLACE_LISTINGS) refresh();
    };
    window.addEventListener('raithamarga-listings-changed', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('raithamarga-listings-changed', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    apiRequest('/listings')
      .then((data) => { if (active) setRemote(data.map(fromApiListing)); })
      .catch(() => { if (active) setRemote([]); });
    return () => { active = false; };
  }, [user]);

  return user ? mergeListings(remote, stored) : stored;
}
