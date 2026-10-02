import { FarmerDataProvider, useFarmerData } from '../../context/FarmerDataContext';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

const NAV_ITEMS = [
  { to: '/farmer/dashboard', label: 'Overview', icon: '\u25A6', end: true },
  { to: '/farmer/dashboard/add-produce', label: 'Add Produce', icon: '\u2795' },
  { to: '/farmer/dashboard/listings', label: 'My Listings', icon: '\u2630' },
  { to: '/farmer/dashboard/matches', label: 'Buyer Matches', icon: '\u21C6' },
  { to: '/farmer/dashboard/deals', label: 'My Deals', icon: '\u2696' },
  { to: '/farmer/dashboard/verification', label: 'Verification', icon: '\u2713' },
  { to: '/farmer/dashboard/profile', label: 'Profile', icon: '\u263A' },
];

const FarmerShellInner = () => {
  const { profile, verification } = useFarmerData();
  return (
    <DashboardLayout
      role="Farmer"
      navItems={NAV_ITEMS}
      profileName={profile.name}
      verificationStatus={verification.status}
    />
  );
};

const FarmerDashboardShell = () => (
  <FarmerDataProvider>
    <FarmerShellInner />
  </FarmerDataProvider>
);

export default FarmerDashboardShell;
