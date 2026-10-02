import { apiRequest } from './api';

function queryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const getAdminOverview = () => apiRequest('/admin/overview');

export const getAdminVerifications = (filters) =>
  apiRequest(`/admin/verifications${queryString(filters)}`);

export const updateAdminVerification = (role, uid, status, note) =>
  apiRequest(`/admin/verifications/${encodeURIComponent(role)}/${encodeURIComponent(uid)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });

export const getAdminUsers = (filters) =>
  apiRequest(`/admin/users${queryString(filters)}`);

export const updateAdminUserStatus = (uid, status) =>
  apiRequest(`/admin/users/${encodeURIComponent(uid)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const getAdminListings = () => apiRequest('/admin/listings');
export const getAdminDeals = () => apiRequest('/admin/deals');
export const getAdminAuditLogs = () => apiRequest('/admin/audit-logs');
