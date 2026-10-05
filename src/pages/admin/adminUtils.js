export const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: '\u25A6', end: true },
  { to: '/admin/verifications', label: 'Verifications', icon: '\u2713' },
  { to: '/admin/users', label: 'Users', icon: '\u2659' },
  { to: '/admin/marketplace', label: 'Marketplace', icon: '\u25A3' },
  { to: '/admin/audit', label: 'Audit log', icon: '\u2637' },
];

export const formatAdminDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
};
