import { auth } from './firebase';

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL || 'https://raithamarga-backend.onrender.com').replace(/\/+$/, '');

export async function apiRequest(path, options = {}) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Please sign in to continue.');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(`The backend returned an invalid response (${response.status}).`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status}).`);
  }

  return data;
}
