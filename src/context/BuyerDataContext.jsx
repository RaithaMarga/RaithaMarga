import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from './useAuth';
import { apiRequest } from '../lib/api';
import { fromApiDeal, fromApiListing, fromApiRequirement } from '../lib/marketplace';

const BuyerDataContext = createContext(null);

const emptyProfile = {
  businessName: '',
  contactName: '',
  phone: '',
  location: '',
  businessType: 'trader',
  contactPreference: 'call',
};

export const BuyerDataProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useLocalStorage(STORAGE_KEYS.BUYER_PROFILE, emptyProfile);
  const [requirementData, setRequirementData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [listingData, setListingData] = useState([]);
  const [dataOwner, setDataOwner] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user || role !== 'buyer') return undefined;
    let active = true;
    Promise.all([apiRequest('/requirements'), apiRequest('/deals'), apiRequest('/listings')])
      .then(([requirementsResponse, dealsResponse, listingsResponse]) => {
        if (!active) return;
        const listingsById = new Map(listingsResponse.map((item) => [item.id, fromApiListing(item)]));
        setListingData(Array.from(listingsById.values()));
        setRequirementData(requirementsResponse.map(fromApiRequirement));
        setRequestData(dealsResponse.map((item) => {
          const deal = fromApiDeal(item);
          const listing = listingsById.get(deal.listingId);
          return {
            ...deal,
            crop: listing?.crop || 'Produce listing',
            unit: listing?.unit || '',
            expectedPrice: deal.price,
            createdAt: deal.createdAt,
          };
        }));
        setLoadError('');
        setDataOwner(user.uid);
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message);
          setListingData([]);
          setRequirementData([]);
          setRequestData([]);
          setDataOwner(user.uid);
        }
      });
    return () => { active = false; };
  }, [user, role]);

  const isCurrentOwner = dataOwner === user?.uid && role === 'buyer';
  const requirements = useMemo(() => isCurrentOwner ? requirementData : [], [isCurrentOwner, requirementData]);
  const requests = useMemo(() => isCurrentOwner ? requestData : [], [isCurrentOwner, requestData]);
  const listings = useMemo(() => isCurrentOwner ? listingData : [], [isCurrentOwner, listingData]);
  const dataError = isCurrentOwner ? loadError : '';
  const dataLoading = Boolean(user && role === 'buyer' && !isCurrentOwner);

  const saveProfile = useCallback(async (data) => {
    const saved = await apiRequest('/buyers/profile', {
      method: 'POST',
      body: JSON.stringify({
        fullName: data.contactName,
        businessName: data.businessName,
        district: data.location.split(',').pop().trim(),
      }),
    });
    const nextProfile = {
      ...data,
      contactName: saved.fullName || data.contactName,
      businessName: saved.businessName || data.businessName,
    };
    setProfile(nextProfile);
    return saved;
  }, [setProfile]);

  const addRequirement = useCallback(async (data) => {
    const created = await apiRequest('/requirements', {
      method: 'POST',
      body: JSON.stringify({
        crop: data.crop,
        quantity: Number(data.requiredQuantity),
        unit: data.unit,
        quality: data.quality || null,
        location: data.location || profile.location.split(',').pop().trim(),
        targetPrice: Number(data.targetPrice),
      }),
    });
    setRequirementData((previous) => [fromApiRequirement(created), ...previous]);
    return created.id;
  }, [profile.location]);

  const expressInterest = useCallback(async (listing, requestedQuantity = listing.quantity) => {
    const created = await apiRequest('/deals', {
      method: 'POST',
      body: JSON.stringify({
        listingId: listing.id,
        quantity: Number(requestedQuantity),
        price: Number(listing.expectedPrice),
      }),
    });
    const deal = fromApiDeal(created);
    setListingData((previous) => previous.map((item) => item.id === listing.id
      ? { ...item, quantity: Math.max(0, Number(item.quantity) - Number(requestedQuantity)) }
      : item));
    setRequestData((previous) => [{
      ...deal,
      crop: listing.crop,
      unit: listing.unit,
      location: listing.location,
    }, ...previous]);
    return deal;
  }, []);

  const cancelRequest = useCallback(async (dealId) => {
    const updated = await apiRequest(`/deals/${dealId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    const existingRequest = requests.find((request) => request.id === dealId);
    setRequestData((previous) => previous.map((request) => request.id === dealId
      ? { ...request, ...fromApiDeal(updated) }
      : request));
    if (existingRequest) {
      setListingData((previous) => previous.map((listing) => listing.id === existingRequest.listingId
        ? { ...listing, quantity: Number(listing.quantity) + Number(existingRequest.quantity) }
        : listing));
    }
  }, [requests]);

  const hasRequested = useCallback((listingId) =>
    requests.some((request) => request.listingId === listingId
      && ['interested', 'confirmed', 'in_progress', 'completed'].includes(request.status)),
  [requests]);

  const stats = useMemo(() => {
    const pending = requests.filter((request) => request.status === 'interested').length;
    return {
      totalRequests: requests.length,
      pendingCount: pending,
      cancelledCount: requests.filter((request) => request.status === 'cancelled').length,
    };
  }, [requests]);

  const value = useMemo(() => ({
    profile,
    setProfile,
    saveProfile,
    requirements,
    addRequirement,
    requests,
    listings,
    expressInterest,
    cancelRequest,
    hasRequested,
    dataError,
    dataLoading,
    stats,
  }), [profile, setProfile, saveProfile, requirements, addRequirement, requests, listings, expressInterest, cancelRequest, hasRequested, dataError, dataLoading, stats]);

  return <BuyerDataContext.Provider value={value}>{children}</BuyerDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBuyerData = () => {
  const context = useContext(BuyerDataContext);
  if (!context) throw new Error('useBuyerData must be used within a BuyerDataProvider');
  return context;
};
