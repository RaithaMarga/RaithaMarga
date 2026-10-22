import { BuyerDataProvider, useBuyerData } from '../../context/BuyerDataContext';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { verificationKey } from '../../lib/verification';

const BuyerShellInner = () => {
  const { profile, cartCount } = useBuyerData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const nav = t.dashboard?.nav || {};

  const navItems = [
    { to: '/buyer/dashboard', label: nav.overview || (isKannada ? 'ಅವಲೋಕನ' : 'Overview'), icon: '\u25A6', end: true },
    { to: '/buyer/dashboard/browse', label: nav.browseProduce || (isKannada ? 'ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Produce'), icon: '\u26B2' },
    { to: '/buyer/dashboard/cart', label: isKannada ? 'ಕಾರ್ಟ್' : 'Cart', icon: '🛒' },
    { to: '/buyer/dashboard/bids', label: isKannada ? 'ನನ್ನ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆಗಳು' : 'My Bids', icon: '\u2696' },
    { to: '/buyer/dashboard/recommended', label: nav.recommended || (isKannada ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಹೊಂದಾಣಿಕೆಗಳು' : 'Recommended Matches'), icon: '\u21C6' },
    { to: '/buyer/dashboard/requests', label: nav.requestsOrders || (isKannada ? 'ವಿನಂತಿಗಳು / ಆರ್ಡರ್‌ಗಳು' : 'Requests / Orders'), icon: '\u2637' },
    { to: '/buyer/dashboard/deals', label: nav.deals || (isKannada ? 'ಒಪ್ಪಂದಗಳು' : 'Deals'), icon: '\u2696' },
    { to: '/buyer/dashboard/profile', label: nav.profile || (isKannada ? 'ಪ್ರೊಫೈಲ್' : 'Profile'), icon: '\u263A' },
  ];

  return (
    <DashboardLayout
      role="Buyer"
      navItems={navItems}
      profileName={profile.contactName || profile.businessName || user?.name}
      verificationStatus={verificationKey(user)}
      cartCount={cartCount}
    />
  );
};

const BuyerDashboardShell = () => (
  <BuyerDataProvider>
    <BuyerShellInner />
  </BuyerDataProvider>
);

export default BuyerDashboardShell;
