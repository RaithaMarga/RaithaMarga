export const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/verifications', label: 'Verifications', icon: '🛡️' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/marketplace', label: 'Marketplace', icon: '🏪' },
  { to: '/admin/audit', label: 'Audit log', icon: '📜' },
];

export const formatAdminDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
