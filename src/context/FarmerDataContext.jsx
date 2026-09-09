import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';

const FarmerDataContext = createContext(null);

const LISTING_STATUSES = ['draft', 'active', 'matched', 'sold', 'expired'];

const emptyProfile = {
  name: '',
  phone: '',
  village: '',
  taluk: '',
  district: '',
  state: 'Karnataka',
  pincode: '',
  landSizeAcres: '',
  preferredCrops: '',
  contactPreference: 'call',
};

const emptyVerification = {
  status: 'not_submitted', // not_submitted | pending | needs_attention | verified
  documents: [], // { id, label, fileName, uploadedAt }
  submittedAt: null,
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const FarmerDataProvider = ({ children }) => {
  const [listings, setListings] = useLocalStorage(STORAGE_KEYS.FARMER_LISTINGS, []);
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.FARMER_PROFILE, emptyProfile);
  const [verification, setVerification] = useLocalStorage(STORAGE_KEYS.FARMER_VERIFICATION, emptyVerification);

  const addListing = useCallback((data, status = 'active') => {
    const listing = {
      id: makeId(),
      crop: '',
      quantity: '',
      unit: 'kg',
      grade: '',
      expectedPrice: '',
      location: '',
      availabilityDate: '',
      photos: [],
      ...data,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setListings((prev) => [listing, ...prev]);
    return listing.id;
  }, [setListings]);

  const updateListing = useCallback((id, data) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l))
    );
  }, [setListings]);

  const setListingStatus = useCallback((id, status) => {
    if (!LISTING_STATUSES.includes(status)) return;
    updateListing(id, { status });
  }, [updateListing]);

  const deleteListing = useCallback((id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, [setListings]);

  const getListing = useCallback((id) => listings.find((l) => l.id === id), [listings]);

  // Weighing-proof photos, per the Live Photo Verification blueprint.
  // Stored on the listing itself for now (frontend-only). Genuinely
  // guaranteeing these weren't spoofed (fake GPS/clock) needs
  // server-side cross-checks — see LiveCameraCapture.jsx for the full
  // caveat. Status starts, and stays, at 'Pending_Verification' until
  // a backend exists to confirm it; nothing here can self-promote it.
  const addWeighingProof = useCallback((listingId, proof) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? { ...l, weighingProofs: [proof, ...(l.weighingProofs || [])], updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, [setListings]);

  const removeWeighingProof = useCallback((listingId, proofId) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? { ...l, weighingProofs: (l.weighingProofs || []).filter((p) => p.id !== proofId) }
          : l
      )
    );
  }, [setListings]);

  const submitForVerification = useCallback((documents) => {
    setVerification((prev) => ({
      ...prev,
      status: 'pending',
      documents: documents.length ? documents : prev.documents,
      submittedAt: new Date().toISOString(),
    }));
  }, [setVerification]);

  const stats = useMemo(() => {
    const active = listings.filter((l) => l.status === 'active');
    const draft = listings.filter((l) => l.status === 'draft');
    const matched = listings.filter((l) => l.status === 'matched');
    const sold = listings.filter((l) => l.status === 'sold');

    const quantityByUnit = active.reduce((acc, l) => {
      const qty = parseFloat(l.quantity);
      if (!Number.isFinite(qty)) return acc;
      const unit = l.unit || 'kg';
      acc[unit] = (acc[unit] || 0) + qty;
      return acc;
    }, {});

    return {
      totalListings: listings.length,
      activeCount: active.length,
      draftCount: draft.length,
      matchedCount: matched.length,
      soldCount: sold.length,
      quantityByUnit,
    };
  }, [listings]);

  const value = useMemo(() => ({
    listings,
    addListing,
    updateListing,
    setListingStatus,
    deleteListing,
    getListing,
    addWeighingProof,
    removeWeighingProof,
    profile,
    setProfile,
    verification,
    submitForVerification,
    stats,
    LISTING_STATUSES,
  }), [listings, addListing, updateListing, setListingStatus, deleteListing, getListing, addWeighingProof, removeWeighingProof, profile, setProfile, verification, submitForVerification, stats]);

  return (
    <FarmerDataContext.Provider value={value}>
      {children}
    </FarmerDataContext.Provider>
  );
};

export const useFarmerData = () => {
  const ctx = useContext(FarmerDataContext);
  if (!ctx) {
    throw new Error('useFarmerData must be used within a FarmerDataProvider');
  }
  return ctx;
};
