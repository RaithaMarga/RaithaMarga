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

  return [value, setValue];
}
