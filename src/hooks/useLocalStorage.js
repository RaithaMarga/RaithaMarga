import { useState, useEffect } from 'react';

/**
 * Persists React state to localStorage under `key`, so demo data
 * (listings, profile, verification) survives a page refresh.
 * Falls back gracefully if localStorage is unavailable (e.g. private
 * browsing with storage disabled) — state just won't persist.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently, data just won't persist.
    }
  }, [key, value]);

  // Cross-tab sync: if a farmer publishes a listing in one tab, a buyer's
  // Browse Produce open in another tab picks it up live. The 'storage'
  // event only fires in *other* tabs than the one that made the change,
  // which is exactly the behaviour we want here.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue);
      } catch {
        // Ignore malformed external writes.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
