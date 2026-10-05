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
      // Not JSON: usually a proxy/CORS/platform page. Show what it said so the cause is visible.
      const snippet = responseText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
      throw new Error(
        response.ok
          ? `The backend returned an invalid response (${response.status}).`
          : `Request failed (${response.status})${snippet ? `: ${snippet}` : '.'}`,
      );
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status}).`);
  }

  return data;
}
