import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from './useAuth';
import { apiRequest } from '../lib/api';
import { fromApiListing, toApiListing } from '../lib/marketplace';

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
  const [listingData, setListingData] = useState([]);
  const [listingOwner, setListingOwner] = useState(null);
  const [listingLoadError, setListingLoadError] = useState('');
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.FARMER_PROFILE, emptyProfile);
  const [verification] = useState({
    status: 'not_submitted',
    documents: [],
    submittedAt: null,
  });

  useEffect(() => {
    if (!user || role !== 'farmer') return undefined;
    let active = true;
    apiRequest('/listings')
      .then((data) => {
        if (active) {
          setListingData(data.filter((listing) => listing.farmerId === user.uid).map(fromApiListing));
          setListingLoadError('');
          setListingOwner(user.uid);
        }
      })
      .catch((error) => {
        if (active) {
          setListingLoadError(error.message);
          setListingData([]);
          setListingOwner(user.uid);
        }
      });
    return () => { active = false; };
  }, [user, role]);

  const isCurrentOwner = listingOwner === user?.uid && role === 'farmer';
  const listings = useMemo(() => isCurrentOwner ? listingData : [], [isCurrentOwner, listingData]);
  const listingsError = isCurrentOwner ? listingLoadError : '';
  const listingsLoading = Boolean(user && role === 'farmer' && !isCurrentOwner);

  const saveProfile = useCallback(async (data) => {
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
  }, [setProfile]);

  const addListing = useCallback(async (data) => {
    const created = await apiRequest('/listings', {
      method: 'POST',
      body: JSON.stringify(toApiListing(data, profile)),
    });
    const listing = fromApiListing(created);
    setListingData((previous) => [listing, ...previous.filter((item) => item.id !== listing.id)]);
    return listing.id;
  }, [profile]);

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
    addListing,
    profile,
    setProfile,
    saveProfile,
    verification,
    stats,
  }), [listings, listingsError, listingsLoading, addListing, profile, setProfile, saveProfile, verification, stats]);

  return <FarmerDataContext.Provider value={value}>{children}</FarmerDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFarmerData = () => {
  const context = useContext(FarmerDataContext);
  if (!context) throw new Error('useFarmerData must be used within a FarmerDataProvider');
  return context;
};
