import { BuyerDataProvider, useBuyerData } from '../../context/BuyerDataContext';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';

const NAV_ITEMS = [
  { to: '/buyer/dashboard', label: 'Overview', icon: '\u25A6', end: true },
  { to: '/buyer/dashboard/browse', label: 'Browse Produce', icon: '\u26B2' },
  { to: '/buyer/dashboard/recommended', label: 'Recommended Matches', icon: '\u21C6' },
  { to: '/buyer/dashboard/requests', label: 'Requests / Orders', icon: '\u2637' },
  { to: '/buyer/dashboard/deals', label: 'Deals', icon: '\u2696' },
  { to: '/buyer/dashboard/trust', label: 'Trust & Verification', icon: '\u2713' },
  { to: '/buyer/dashboard/profile', label: 'Profile', icon: '\u263A' },
];

const BuyerShellInner = () => {
  const { profile } = useBuyerData();
  return (
    <DashboardLayout
      role="Buyer"
      navItems={NAV_ITEMS}
      profileName={profile.contactName || profile.businessName}
    />
  );
};

const BuyerDashboardShell = () => (
  <BuyerDataProvider>
    <BuyerShellInner />
  </BuyerDataProvider>
);

export default BuyerDashboardShell;
