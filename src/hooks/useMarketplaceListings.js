import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from '../context/useAuth';
import { apiRequest, publicRequest } from '../lib/api';
import { fromApiListing, getStoredMarketplaceListings, mergeListings } from '../lib/marketplace';

/**
 * Live marketplace listings for any page (including the public home page).
 * - Always reads the shared local marketplace store, and refreshes the moment a farmer
 *   publishes (same tab via 'raithamarga-listings-changed', other tabs via 'storage').
 * - Signed in: merges the backend listings. Signed out: real totals from GET /api/public/availability
 *   (falls back to local listings only if the backend can't be reached).
 */
export function useMarketplaceListings() {
  const { user } = useAuth();
  const [stored, setStored] = useState(getStoredMarketplaceListings);
  const [remote, setRemote] = useState([]);
  const [publicListings, setPublicListings] = useState(null);

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

  // Visitors who are not signed in: real totals from the backend's public availability endpoint.
  useEffect(() => {
    if (user) return undefined;
    let active = true;
    publicRequest('/public/availability')
      .then((rows) => {
        if (!active) return;
        setPublicListings(rows.map((row) => ({
          id: `public-${row.crop}-${row.unit}`,
          crop: row.crop,
          unit: row.unit,
          quantity: row.availableQuantity,
          expectedPrice: row.minPrice,
          status: 'active',
        })));
      })
      .catch(() => { if (active) setPublicListings(null); });
    return () => { active = false; };
  }, [user]);

  if (user) return mergeListings(remote, stored);
  // Backend reachable: show only real data. Otherwise fall back to this browser's local listings.
  return publicListings ?? stored;
}
