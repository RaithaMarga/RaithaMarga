import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../data/storageKeys';
import { useAuth } from './useAuth';
import { apiRequest } from '../lib/api';
import { fromApiDeal, fromApiListing, fromApiRequirement, getStoredMarketplaceListings, mergeListings, isLocalListing, isLocalDeal, createLocalDeal, updateLocalDealStatus } from '../lib/marketplace';
import { useStoredDeals } from '../hooks/useStoredDeals';
import {
  addCartLine as addCartLineToItems,
  clearCheckoutIdempotencyKey,
  getCheckoutIdempotencyKey,
  MAX_CHECKOUT_LINES,
  readBuyerCart,
  removeCartLine,
  updateCartLineQuantity,
  writeBuyerCart,
} from '../lib/cart';

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
  const storedDeals = useStoredDeals();
  const [storedListings, setStoredListings] = useState(getStoredMarketplaceListings);
  const [dataOwner, setDataOwner] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [cartState, setCartState] = useState({ uid: null, items: [] });
  const buyerUid = role === 'buyer' ? user?.uid : null;
  const cartSnapshot = useMemo(() => {
    if (!buyerUid) return { uid: null, items: [], error: '' };
    if (cartState.uid === buyerUid) return cartState;
    try {
      return { uid: buyerUid, items: readBuyerCart(buyerUid), error: '' };
    } catch (error) {
      return { uid: buyerUid, items: [], error: `Could not load your saved cart: ${error.message}` };
    }
  }, [buyerUid, cartState]);
  const cart = cartSnapshot.items;
  const cartOwner = cartSnapshot.uid;
  const cartReady = Boolean(buyerUid && cartOwner === buyerUid);
  const cartError = cartSnapshot.error;

  const persistBuyerCart = useCallback((items) => {
    if (!buyerUid || cartError) {
      throw new Error(cartError || 'A signed-in buyer is required to update the cart.');
    }
    writeBuyerCart(buyerUid, items);
    setCartState({ uid: buyerUid, items, error: '' });
  }, [buyerUid, cartError]);

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

  // Listings farmers published in this browser (shared local marketplace store).
  // Refresh instantly when a farmer publishes, in this tab or another one.
  useEffect(() => {
    const refresh = () => setStoredListings(getStoredMarketplaceListings());
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

  const isCurrentOwner = dataOwner === user?.uid && role === 'buyer';
  const requirements = useMemo(() => isCurrentOwner ? requirementData : [], [isCurrentOwner, requirementData]);
  const requests = useMemo(() => {
    const local = storedDeals
      .filter((deal) => deal.buyerId === user?.uid)
      .map(fromApiDeal);
    return [...local, ...(isCurrentOwner ? requestData : [])];
  }, [isCurrentOwner, requestData, storedDeals, user?.uid]);
  const listings = useMemo(
    () => (role === 'buyer' ? mergeListings(isCurrentOwner ? listingData : [], storedListings) : []),
    [role, isCurrentOwner, listingData, storedListings],
  );
  const dataError = isCurrentOwner && listings.length === 0 ? loadError : '';
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
    const targetListingId = listing.id || listing.listingId;
    const targetPrice = Number(listing.expectedPrice ?? listing.price);
    // Local-only listing: the backend doesn't know it, so open the deal locally.
    if (isLocalListing(listing)) {
      return fromApiDeal(createLocalDeal(listing, requestedQuantity, user?.uid));
    }
    const created = await apiRequest('/deals', {
      method: 'POST',
      body: JSON.stringify({
        listingId: targetListingId,
        quantity: Number(requestedQuantity),
        price: targetPrice,
      }),
    });
    const deal = fromApiDeal(created);
    setListingData((previous) => previous.map((item) => item.id === targetListingId
      ? { ...item, quantity: Math.max(0, Number(item.quantity) - Number(requestedQuantity)) }
      : item));
    setRequestData((previous) => [{
      ...deal,
      crop: listing.crop,
      unit: listing.unit,
      location: listing.location,
    }, ...previous]);
    return deal;
  }, [user?.uid]);

  const addToCart = useCallback((listing) => {
    if (!buyerUid || !cartReady || cartOwner !== buyerUid) {
      throw new Error('Your buyer cart is still loading. Please try again.');
    }
    persistBuyerCart(addCartLineToItems(readBuyerCart(buyerUid), listing));
  }, [buyerUid, cartOwner, cartReady, persistBuyerCart]);

  const changeCartQuantity = useCallback((listingId, quantity) => {
    if (!buyerUid) throw new Error('A signed-in buyer is required to update the cart.');
    persistBuyerCart(updateCartLineQuantity(readBuyerCart(buyerUid), listingId, quantity));
  }, [buyerUid, persistBuyerCart]);

  const removeFromCart = useCallback((listingId) => {
    if (!buyerUid) throw new Error('A signed-in buyer is required to update the cart.');
    persistBuyerCart(removeCartLine(readBuyerCart(buyerUid), listingId));
  }, [buyerUid, persistBuyerCart]);

  const checkoutCart = useCallback(async () => {
    if (!cartReady || cartOwner !== buyerUid || !buyerUid) {
      throw new Error('Your buyer cart is still loading. Please try again.');
    }
    if (cartError) throw new Error(cartError);
    if (cart.length === 0) throw new Error('Your cart is empty.');
    if (cart.some((item) => item.localOnly)) {
      throw new Error('Demo listings saved only in this browser cannot be purchased. Add produce published to the marketplace backend.');
    }
    if (cart.length > MAX_CHECKOUT_LINES) {
      throw new Error(`A single checkout can include up to ${MAX_CHECKOUT_LINES} distinct listings. Remove some lines and check out in separate batches.`);
    }
    const idempotencyKey = getCheckoutIdempotencyKey(buyerUid, cart);
    const createdDeals = await apiRequest('/deals/checkout', {
      method: 'POST',
      body: JSON.stringify({
        idempotencyKey,
        items: cart.map((item) => ({
          listingId: item.listingId,
          quantity: Number(item.quantity),
          expectedPrice: Number(item.expectedPrice),
        })),
      }),
    });
    persistBuyerCart([]);
    clearCheckoutIdempotencyKey(buyerUid);
    const parsedDeals = createdDeals.map((item) => ({
      ...fromApiDeal(item),
      crop: item.crop || 'Produce listing',
      unit: item.unit || '',
    }));
    setRequestData((previous) => [...parsedDeals, ...previous]);
    setListingData((previous) => previous.map((listing) => {
      const deal = parsedDeals.find((created) => created.listingId === listing.id);
      return deal ? { ...listing, quantity: Math.max(0, Number(listing.quantity) - Number(deal.quantity)) } : listing;
    }));
    return parsedDeals;
  }, [buyerUid, cart, cartOwner, cartReady, cartError, persistBuyerCart]);

  const isCartOwner = cartOwner === buyerUid && Boolean(buyerUid) && cartReady;
  const buyerCart = useMemo(() => isCartOwner ? cart : [], [cart, isCartOwner]);
  const buyerCartError = isCartOwner ? cartError : '';

  const cancelRequest = useCallback(async (dealId) => {
    if (isLocalDeal(dealId)) {
      updateLocalDealStatus(dealId, 'CANCELLED');
      return;
    }
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
    cart: buyerCart,
    cartCount: buyerCart.length,
    cartReady,
    cartError: buyerCartError,
    addToCart,
    changeCartQuantity,
    removeFromCart,
    checkoutCart,
    expressInterest,
    cancelRequest,
    hasRequested,
    dataError,
    dataLoading,
    stats,
  }), [profile, setProfile, saveProfile, requirements, addRequirement, requests, listings, buyerCart, cartReady, buyerCartError, addToCart, changeCartQuantity, removeFromCart, checkoutCart, expressInterest, cancelRequest, hasRequested, dataError, dataLoading, stats]);

  return <BuyerDataContext.Provider value={value}>{children}</BuyerDataContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useBuyerData = () => {
  const context = useContext(BuyerDataContext);
  if (!context) throw new Error('useBuyerData must be used within a BuyerDataProvider');
  return context;
};
