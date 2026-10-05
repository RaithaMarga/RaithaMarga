import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { useAuth } from '../../context/useAuth';
import './admin.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: '\u25A6', end: true },
  { to: '/admin/dashboard/verifications', label: 'Verifications', icon: '\u2713' },
  { to: '/admin/dashboard/users', label: 'Users', icon: '\u263A' },
  { to: '/admin/dashboard/marketplace', label: 'Marketplace', icon: '\u2696' },
  { to: '/admin/dashboard/audit', label: 'Audit Log', icon: '\u2637' },
];

const AdminShell = () => {
  const { user } = useAuth();
  return <DashboardLayout role="Admin" navItems={NAV_ITEMS} profileName={user?.name || user?.email || 'Admin'} />;
};

export default AdminShell;
