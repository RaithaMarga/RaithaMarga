import { FarmerDataProvider, useFarmerData } from '../../context/FarmerDataContext';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { verificationKey } from '../../lib/verification';

const NAV_ITEMS = [
  { to: '/farmer/dashboard', label: 'Overview', icon: '\u25A6', end: true },
  { to: '/farmer/dashboard/add-produce', label: 'Add Produce', icon: '\u2795' },
  { to: '/farmer/dashboard/listings', label: 'My Listings', icon: '\u2630' },
  { to: '/farmer/dashboard/matches', label: 'Buyer Matches', icon: '\u21C6' },
  { to: '/farmer/dashboard/deals', label: 'My Deals', icon: '\u2696' },
  { to: '/farmer/dashboard/account', label: 'Account Details', icon: '\u2713' },
  { to: '/farmer/dashboard/profile', label: 'Edit Profile', icon: '\u263A' },
];

const FarmerShellInner = () => {
  const { profile } = useFarmerData();
  const { user } = useAuth();
  return (
    <DashboardLayout
      role="Farmer"
      navItems={NAV_ITEMS}
      profileName={profile.name || user?.name}
      verificationStatus={verificationKey(user)}
    />
  );
};

const FarmerDashboardShell = () => (
  <FarmerDataProvider>
    <FarmerShellInner />
  </FarmerDataProvider>
);

export default FarmerDashboardShell;
