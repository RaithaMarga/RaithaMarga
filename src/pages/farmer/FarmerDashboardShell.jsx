import { FarmerDataProvider, useFarmerData } from '../../context/FarmerDataContext';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { verificationKey } from '../../lib/verification';

const FarmerShellInner = () => {
  const { profile } = useFarmerData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const nav = t.dashboard?.nav || {};

  const navItems = [
    { to: '/farmer/dashboard', label: nav.overview || (isKannada ? 'ಅವಲೋಕನ' : 'Overview'), icon: '📊', end: true },
    { to: '/farmer/dashboard/add-produce', label: nav.addProduce || (isKannada ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Add Produce'), icon: '➕' },
    { to: '/farmer/dashboard/listings', label: nav.myListings || (isKannada ? 'ನನ್ನ ಪಟ್ಟಿಗಳು' : 'My Listings'), icon: '📋' },
    { to: '/farmer/dashboard/matches', label: nav.buyerMatches || (isKannada ? 'ಖರೀದಿದಾರ ಹೊಂದಾಣಿಕೆಗಳು' : 'Buyer Matches'), icon: '🤝' },
    { to: '/farmer/dashboard/bids', label: isKannada ? 'ಬಂದಿರುವ ಪ್ರಸ್ತಾವನೆಗಳು' : 'Incoming Bids', icon: '🏷️' },
    { to: '/farmer/dashboard/deals', label: nav.myDeals || (isKannada ? 'ನನ್ನ ಒಪ್ಪಂದಗಳು' : 'My Deals'), icon: '⚖️' },
    { to: '/farmer/dashboard/account', label: nav.account || (isKannada ? 'ಖಾತೆ ವಿವರಗಳು' : 'Account Details'), icon: '💳' },
    { to: '/farmer/dashboard/profile', label: nav.editProfile || (isKannada ? 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ' : 'Edit Profile'), icon: '👤' },
  ];

  return (
    <DashboardLayout
      role="Farmer"
      navItems={navItems}
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
