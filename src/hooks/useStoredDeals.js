import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../data/storageKeys';
import { getStoredDeals } from '../lib/marketplace';

/** Deals created on local-only listings, kept live across tabs. */
export function useStoredDeals() {
  const [deals, setDeals] = useState(getStoredDeals);
  useEffect(() => {
    const refresh = () => setDeals(getStoredDeals());
    const onStorage = (e) => {
      if (!e.key || e.key === STORAGE_KEYS.BUYER_DEALS) refresh();
    };
    window.addEventListener('raithamarga-deals-changed', refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('raithamarga-deals-changed', refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  return deals;
}
