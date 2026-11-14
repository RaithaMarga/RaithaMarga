import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { addCartLine, buyerCartStorageKey, cartTotals, mergeGuestCart, removeCartLine, updateCartLineQuantity } from '../lib/cart';

const Context = createContext(null);
const GUEST_KEY = 'raithamarga.guestCart';
const LEGACY_GUEST_KEY = buyerCartStorageKey('guest');
const read = (key) => {
  const value = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(value)) throw new Error('Saved cart is invalid.');
  return value.map((item) => /^(public-|produce-)/.test(item.listingId) ? { ...item, pendingAvailability: true } : item);
};

const readGuest = () => mergeGuestCart(read(GUEST_KEY), read(LEGACY_GUEST_KEY));

export function CartProvider({ children }) {
  const { user, role } = useAuth();
  const owner = role === 'buyer' && user?.uid ? buyerCartStorageKey(user.uid) : GUEST_KEY;
  const [revision, setRevision] = useState(0);
  const [added, setAdded] = useState(0);
  const snapshot = useMemo(() => {
    try {
      const saved = owner === GUEST_KEY ? readGuest() : read(owner);
      const guest = owner === GUEST_KEY ? [] : readGuest();
      return { items: mergeGuestCart(saved, guest), error: '' };
    } catch (error) { return { items: [], error: error.message }; }
    // revision refreshes external storage updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, revision]);
  useEffect(() => {
    if (!snapshot.error && (owner !== GUEST_KEY || localStorage.getItem(LEGACY_GUEST_KEY))) {
      localStorage.setItem(owner, JSON.stringify(snapshot.items));
      if (owner !== GUEST_KEY) localStorage.removeItem(GUEST_KEY);
      localStorage.removeItem(LEGACY_GUEST_KEY);
    }
  }, [owner, snapshot]);
  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);
  const mutate = useCallback((transform) => {
    if (snapshot.error) throw new Error(snapshot.error);
    const items = mergeGuestCart(owner === GUEST_KEY ? readGuest() : read(owner), owner === GUEST_KEY ? [] : readGuest());
    const next = transform(items);
    localStorage.setItem(owner, JSON.stringify(next));
    if (owner !== GUEST_KEY) localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(LEGACY_GUEST_KEY);
    setRevision((value) => value + 1);
  }, [owner, snapshot.error]);
  const addToCart = useCallback((listing, quantity = 1) => {
    mutate((items) => addCartLine(items, listing, quantity));
    setAdded((value) => value + 1);
  }, [mutate]);
  const changeCartQuantity = useCallback((id, quantity) => mutate((items) => updateCartLineQuantity(items, id, quantity)), [mutate]);
  const removeFromCart = useCallback((id) => mutate((items) => removeCartLine(items, id)), [mutate]);
  const markCartDeal = useCallback((id, deal) => mutate((items) => items.map((item) => item.listingId === id ? { ...item, deal } : item)), [mutate]);
  const replaceCart = useCallback((items) => mutate(() => items), [mutate]);
  return <Context.Provider value={{ cart: snapshot.items, cartCount: snapshot.items.length, cartReady: true, cartError: snapshot.error, totals: cartTotals(snapshot.items), added, addToCart, changeCartQuantity, removeFromCart, markCartDeal, replaceCart }}>{children}</Context.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() { return useContext(Context); }
