import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { ADMIN_NAV_ITEMS } from './adminUtils';

const AdminDashboardShell = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      role="Admin"
      navItems={ADMIN_NAV_ITEMS}
      profileName={user?.name || user?.email || 'Admin'}
      profileEmail={user?.email}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminDashboardShell;
