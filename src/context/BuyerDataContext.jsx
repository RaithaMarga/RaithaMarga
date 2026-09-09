import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';

const BuyerDataContext = createContext(null);

const emptyProfile = {
  businessName: '',
  contactName: '',
  phone: '',
  location: '',
  businessType: 'trader', // trader | processor | retailer | exporter | other
  contactPreference: 'call',
};

// A saved buying requirement — used by the future matching engine
// (Prompt 4) to power Recommended Matches. Captured now so that work
// isn't blocked later, even though nothing consumes it yet.
const emptyRequirement = {
  crop: '',
  requiredQuantity: '',
  unit: 'kg',
  quality: '',
  targetPrice: '',
  location: '',
  neededByDate: '',
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const BuyerDataProvider = ({ children }) => {
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.BUYER_PROFILE, emptyProfile);
  const [requirements, setRequirements] = useLocalStorage(STORAGE_KEYS.BUYER_REQUIREMENTS, []);
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.BUYER_REQUESTS, []);

  const addRequirement = useCallback((data) => {
    const requirement = { id: makeId(), ...emptyRequirement, ...data, createdAt: new Date().toISOString() };
    setRequirements((prev) => [requirement, ...prev]);
  }, [setRequirements]);

  const removeRequirement = useCallback((id) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
  }, [setRequirements]);

  // Express interest in a listing. This is recorded on the buyer's side
  // only — there's no backend yet to notify the farmer, so the status
  // stays 'requested' until that exists. We never fabricate an
  // 'accepted' or 'completed' state client-side.
  const expressInterest = useCallback((listing) => {
    setRequests((prev) => {
      if (prev.some((r) => r.listingId === listing.id && r.status === 'requested')) {
        return prev; // already requested, avoid duplicates
      }
      const request = {
        id: makeId(),
        listingId: listing.id,
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        expectedPrice: listing.expectedPrice,
        location: listing.location,
        status: 'requested',
        createdAt: new Date().toISOString(),
      };
      return [request, ...prev];
    });
  }, [setRequests]);

  const cancelRequest = useCallback((id) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
  }, [setRequests]);

  const hasRequested = useCallback((listingId) =>
    requests.some((r) => r.listingId === listingId && r.status === 'requested'),
  [requests]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === 'requested').length;
    const cancelled = requests.filter((r) => r.status === 'cancelled').length;
    return {
      totalRequests: requests.length,
      pendingCount: pending,
      cancelledCount: cancelled,
    };
  }, [requests]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    requirements,
    addRequirement,
    removeRequirement,
    requests,
    expressInterest,
    cancelRequest,
    hasRequested,
    stats,
  }), [profile, setProfile, requirements, addRequirement, removeRequirement, requests, expressInterest, cancelRequest, hasRequested, stats]);

  return (
    <BuyerDataContext.Provider value={value}>
      {children}
    </BuyerDataContext.Provider>
  );
};

export const useBuyerData = () => {
  const ctx = useContext(BuyerDataContext);
  if (!ctx) {
    throw new Error('useBuyerData must be used within a BuyerDataProvider');
  }
  return ctx;
};
