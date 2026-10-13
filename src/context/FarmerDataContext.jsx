import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from './useAuth';
import { apiRequest } from '../lib/api';
import {
  fromApiListing,
  toApiListing,
  getStoredMarketplaceListings,
  saveStoredMarketplaceListing,
} from '../lib/marketplace';

const FarmerDataContext = createContext(null);

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

export const FarmerDataProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [listingData, setListingData] = useState(() => {
    const stored = getStoredMarketplaceListings();
    return user ? stored.filter((l) => l.farmerId === user.uid || l.farmerId === 'farmer-local') : stored;
  });
  const [listingOwner, setListingOwner] = useState(user?.uid || 'farmer-local');
  const [listingLoadError, setListingLoadError] = useState('');
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.FARMER_PROFILE, emptyProfile);

  useEffect(() => {
    if (!user || role !== 'farmer') return undefined;
    let active = true;

    // Load from backend API and merge with local storage
    apiRequest('/listings')
      .then((data) => {
        if (!active) return;
        const apiListings = data.filter((listing) => listing.farmerId === user.uid).map(fromApiListing);
        const stored = getStoredMarketplaceListings().filter((l) => l.farmerId === user.uid || l.farmerId === 'farmer-local');
        // Merge without duplicates
        const mergedMap = new Map();
        apiListings.forEach((item) => mergedMap.set(item.id, item));
        stored.forEach((item) => {
          if (!mergedMap.has(item.id)) mergedMap.set(item.id, item);
        });
        setListingData(Array.from(mergedMap.values()));
        setListingLoadError('');
        setListingOwner(user.uid);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('API listings fetch failed, using stored listings:', error);
        const stored = getStoredMarketplaceListings().filter((l) => l.farmerId === user.uid || l.farmerId === 'farmer-local');
        setListingData(stored);
        setListingLoadError('');
        setListingOwner(user.uid);
      });

    const onListingsChanged = () => {
      const stored = getStoredMarketplaceListings().filter((l) => l.farmerId === user.uid || l.farmerId === 'farmer-local');
      setListingData(stored);
    };

    window.addEventListener('raithamarga-listings-changed', onListingsChanged);
    return () => {
      active = false;
      window.removeEventListener('raithamarga-listings-changed', onListingsChanged);
    };
  }, [user, role]);

  const isCurrentOwner = (listingOwner === user?.uid || listingOwner === 'farmer-local') && role === 'farmer';
  const listings = useMemo(() => (isCurrentOwner ? listingData : []), [isCurrentOwner, listingData]);
  const listingsError = isCurrentOwner ? listingLoadError : '';
  const listingsLoading = false;

  const saveProfile = useCallback(async (data) => {
    try {
      const saved = await apiRequest('/farmers/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName: data.name,
          village: data.village,
          taluk: data.taluk,
          district: data.district,
          state: data.state || 'Karnataka',
          landAcres: Number(data.landSizeAcres || 0),
        }),
      });
      const nextProfile = { ...data, name: saved.fullName || data.name };
      setProfile(nextProfile);
      return saved;
    } catch {
      setProfile(data);
      return data;
    }
  }, [setProfile]);

  const addListing = useCallback(async (data) => {
    let created;
    try {
      created = await apiRequest('/listings', {
        method: 'POST',
        body: JSON.stringify(toApiListing(data, profile || {})),
      });
    } catch (apiError) {
      console.warn('API addListing failed, persisting listing locally:', apiError);
      created = {
        id: `listing-${Date.now()}`,
        farmerId: user?.uid || 'farmer-local',
        farmerName: profile?.name || user?.name || 'Local Farmer',
        crop: data.crop,
        quantity: Number(data.quantity),
        unit: data.unit || 'kg',
        expectedPrice: Number(data.expectedPrice),
        price: Number(data.expectedPrice),
        district: profile?.district || 'Kolar',
        taluk: profile?.taluk || 'Malur',
        village: profile?.village || 'Local Village',
        status: 'active',
        location: [profile?.village, profile?.taluk, profile?.district].filter(Boolean).join(', ') || 'Local Village, Malur, Kolar',
        availabilityDate: data.availabilityDate,
        createdAt: new Date().toISOString(),
        photos: [],
      };
    }

    const listing = fromApiListing(created);
    // Save to shared marketplace store so buyers and home page immediately have it!
    saveStoredMarketplaceListing(listing);
    setListingData((previous) => [listing, ...previous.filter((item) => item.id !== listing.id)]);
    return listing.id;
  }, [profile, user]);

  const stats = useMemo(() => {
    const active = listings.filter((listing) => listing.status === 'active');
    const quantityByUnit = active.reduce((totals, listing) => {
      const quantity = Number(listing.quantity);
      if (Number.isFinite(quantity)) totals[listing.unit || 'kg'] = (totals[listing.unit || 'kg'] || 0) + quantity;
      return totals;
    }, {});
    return {
      totalListings: listings.length,
      activeCount: active.length,
      draftCount: 0,
      matchedCount: 0,
      soldCount: listings.filter((listing) => listing.status === 'sold').length,
      quantityByUnit,
    };
  }, [listings]);

  const value = useMemo(() => ({
    listings,
    listingsError,
    listingsLoading,
    stats,
    profile,
    saveProfile,
    addListing,
  }), [listings, listingsError, listingsLoading, stats, profile, saveProfile, addListing]);

  return <FarmerDataContext.Provider value={value}>{children}</FarmerDataContext.Provider>;
};

export const useFarmerData = () => {
  const context = useContext(FarmerDataContext);
  if (!context) throw new Error('useFarmerData must be used within a FarmerDataProvider');
  return context;
};
