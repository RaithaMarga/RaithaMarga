import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const BuyerDataProvider = ({ children }) => {
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.BUYER_PROFILE, emptyProfile);
  const [requirements, setRequirements] = useLocalStorage(STORAGE_KEYS.BUYER_REQUIREMENTS, []);
  const [requests, setRequests] = useLocalStorage(STORAGE_KEYS.BUYER_REQUESTS, []);

  // Sync requirements on mount
  useEffect(() => {
    fetch(`${API_BASE}/requirements`)
      .then((r) => r.json())
      .then((data) => {
        if (data.requirements && data.requirements.length > 0) {
          setRequirements((prev) => {
            const map = new Map();
            data.requirements.forEach((req) => map.set(req.id, req));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((e) => console.warn('Buyer sync note:', e.message));
  }, [setRequirements]);

  const addRequirement = useCallback((data) => {
    const requirement = {
      id: makeId(),
      buyerId: profile.phone || 'buyer-kolar-1',
      buyerName: profile.businessName || profile.contactName || 'Suresh Agro Traders',
      buyerPhone: profile.phone || '9845012345',
      district: profile.location || 'Kolar',
      ...emptyRequirement,
      ...data,
      createdAt: new Date().toISOString()
    };
    setRequirements((prev) => [requirement, ...prev]);

    fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirement),
    }).catch((err) => console.warn('Backend requirement sync error:', err.message));
  }, [setRequirements, profile]);

  const removeRequirement = useCallback((id) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    fetch(`${API_BASE}/requirements/${id}`, { method: 'DELETE' }).catch(() => {});
  }, [setRequirements]);

  // Express interest in a listing. Synchronizes to backend API, creates a deal,
  // and updates Firestore so the farmer and APMC CRM see the deal immediately.
  const expressInterest = useCallback((listing) => {
    setRequests((prev) => {
      if (prev.some((r) => r.listingId === listing.id && r.status === 'requested')) {
        return prev;
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

    fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        farmerId: listing.farmerId,
        farmerName: listing.farmerName,
        buyerId: profile.phone || 'buyer-kolar-1',
        buyerName: profile.businessName || profile.contactName || 'Suresh Agro Traders',
        buyerPhone: profile.phone || '9845012345',
        crop: listing.crop,
        quantity: listing.quantity,
        unit: listing.unit,
        agreedPrice: listing.expectedPrice,
        notes: 'Interest expressed via Browse Marketplace'
      })
    }).catch((err) => console.warn('Deal creation note:', err.message));
  }, [setRequests, profile]);

  const cancelRequest = useCallback((id, dealId) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)));
    if (dealId) {
      fetch(`${API_BASE}/deals/${dealId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus: 'cancelled', note: 'Buyer cancelled interest request' })
      }).catch(() => {});
    }
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
