import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';

const FarmerDataContext = createContext(null);
const API_BASE = 'http://localhost:5000/api';

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

  // Sync with Backend API & Cloud Firestore on mount
  useEffect(() => {
    fetch(`${API_BASE}/listings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.listings && data.listings.length > 0) {
          setListings((prev) => {
            const map = new Map();
            data.listings.forEach((l) => map.set(l.id, l));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch((e) => console.warn('Backend sync note:', e.message));

    // Also sync farmer verification status from backend / Firestore
    fetch(`${API_BASE}/farmers`)
      .then((r) => r.json())
      .then((data) => {
        if (data.farmers && data.farmers.length > 0) {
          const currentFarmer = data.farmers.find(f => f.phone === profile.phone || f.userId === 'farmer-kolar-1') || data.farmers[0];
          if (currentFarmer && currentFarmer.verification_status) {
            setVerification((prev) => ({
              ...prev,
              status: currentFarmer.verification_status
            }));
          }
        }
      })
      .catch(() => {});
  }, [setListings, setVerification, profile.phone]);

  const addListing = useCallback((data, status = 'active') => {
    const listing = {
      id: makeId(),
      farmerId: profile.phone || 'farmer-kolar-1',
      farmerName: profile.name || 'Ramesh Gowda',
      farmerPhone: profile.phone || '9876543210',
      district: profile.district || 'Kolar',
      crop: '',
      quantity: '',
      unit: 'kg',
      grade: '',
      expectedPrice: '',
      location: profile.village ? `${profile.village}, ${profile.district || 'Kolar'}` : 'Kolar Mandi',
      availabilityDate: '',
      photos: [],
      ...data,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setListings((prev) => [listing, ...prev]);

    // Send to Backend API & Cloud Firestore
    fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    }).catch((err) => console.warn('Backend listing sync error:', err.message));

    return listing.id;
  }, [setListings]);

  const updateListing = useCallback((id, data) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l))
    );
    fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => {});
  }, [setListings]);

  const setListingStatus = useCallback((id, status) => {
    if (!LISTING_STATUSES.includes(status)) return;
    updateListing(id, { status });
  }, [updateListing]);

  const deleteListing = useCallback((id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    fetch(`${API_BASE}/listings/${id}`, { method: 'DELETE' }).catch(() => {});
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

    const targetListing = listings.find((l) => l.id === listingId);
    fetch(`${API_BASE}/proofs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId,
        crop: targetListing?.crop || 'Produce',
        farmerId: profile?.id || 'farmer-kolar-1',
        farmerName: profile?.name || 'Farmer Member',
        proofUrl: proof.image,
        actualWeight: targetListing?.quantity || 100,
        unit: targetListing?.unit || 'quintal',
        slipNumber: proof.id || `PROOF-${Date.now().toString(36).toUpperCase()}`,
        notes: `Live photo captured at GPS ${proof.latitude?.toFixed(4) || 'N/A'}, ${proof.longitude?.toFixed(4) || 'N/A'}. Source: ${proof.source || 'camera'}`
      }),
    }).catch((err) => console.warn('Weighing proof sync failed:', err.message));
  }, [setListings, listings, profile]);

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

    // Post to backend API & sync to Cloud Firestore
    fetch(`${API_BASE}/verifications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.phone || 'farmer-kolar-1',
        userName: profile.name || 'Ramesh Gowda',
        userPhone: profile.phone || '9876543210',
        role: 'farmer',
        district: profile.district || 'Kolar',
        documents: documents,
        notes: 'Submitted via Farmer Portal document verification desk'
      })
    }).catch((err) => console.warn('Verification submit sync error:', err.message));
  }, [setVerification, profile]);

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
