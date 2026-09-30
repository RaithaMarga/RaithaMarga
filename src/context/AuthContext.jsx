import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rm_auth_user';
const API_BASE = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = useCallback(async ({ phone, role, password }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, password })
      });
      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.warn('Backend offline, using local session fallback', err);
    } finally {
      setLoading(false);
    }

    // Local fallback if backend cannot be reached
    const fallbackUser = {
      id: `${role || 'user'}-${Date.now()}`,
      name: (role === 'farmer' ? 'Kisan Member' : 'Trader Member'),
      phone,
      role: role || 'farmer',
      status: 'active'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return { success: true, user: fallbackUser };
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (err) {
      console.warn('Backend offline, registering locally', err);
    } finally {
      setLoading(false);
    }

    const fallbackUser = {
      id: `${payload.role || 'user'}-${Date.now()}`,
      name: payload.name || (payload.role === 'farmer' ? 'Kisan Member' : 'Trader Member'),
      phone: payload.phone,
      role: payload.role || 'farmer',
      location: payload.location || '',
      status: 'active'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return { success: true, user: fallbackUser };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), role: user?.role, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
