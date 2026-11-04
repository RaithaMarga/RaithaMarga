import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { useAuth } from '../../context/useAuth';
import './admin.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/dashboard/verifications', label: 'Verifications', icon: '🛡️' },
  { to: '/admin/dashboard/users', label: 'Users', icon: '👥' },
  { to: '/admin/dashboard/farmers', label: 'Add Farmer', icon: '🌾' },
  { to: '/admin/dashboard/marketplace', label: 'Marketplace', icon: '🏪' },
  { to: '/admin/dashboard/bids', label: 'Farmer Offers', icon: '🏷️' },
  { to: '/admin/dashboard/audit', label: 'Audit Log', icon: '📜' },
];

const AdminShell = () => {
  const { user } = useAuth();
  return <DashboardLayout role="Admin" navItems={NAV_ITEMS} profileName={user?.name || user?.email || 'Admin'} />;
};

export default AdminShell;
