import { apiRequest } from './api';

const withQuery = (path, params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value),
  ).toString();
  return query ? `${path}?${query}` : path;
};

const patch = (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) });

// Every call below is checked again on the server (role must be ADMIN).
export const adminApi = {
  overview: () => apiRequest('/admin/overview'),
  verifications: ({ role, status } = {}) => apiRequest(withQuery('/admin/verifications', { role, status })),
  updateVerification: (role, uid, { status, note }) =>
    patch(`/admin/verifications/${role}/${uid}`, { status, note: note || null }),
  users: ({ role, status } = {}) => apiRequest(withQuery('/admin/users', { role, status })),
  updateUserStatus: (uid, status) => patch(`/admin/users/${uid}/status`, { status }),
  listings: () => apiRequest('/admin/listings'),
  deals: () => apiRequest('/admin/deals'),
  auditLogs: () => apiRequest('/admin/audit-logs'),
};
