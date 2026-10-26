import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiRequest } from '../../lib/api';
import { fromApiDeal } from '../../lib/marketplace';
import StatCard from '../../components/dashboard/StatCard';
import WhatsAppCard from '../../components/dashboard/WhatsAppCard';
import VerificationNotice from '../../components/dashboard/VerificationNotice';
import { useAuth } from '../../context/useAuth';
import { IconField, IconScale, IconHandshake, IconClock } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const Overview = () => {
  const { stats, profile, listingsError } = useFarmerData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const fo = t.dashboard?.farmerOverview || {};

  const [matchCount, setMatchCount] = useState(0);
  const [pendingDealsCount, setPendingDealsCount] = useState(0);
  const [incomingBidsCount, setIncomingBidsCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest('/matches').catch(() => []),
      apiRequest('/deals').catch(() => []),
      apiRequest('/bids').catch(() => []),
    ])
      .then(([matches, deals, bids]) => {
        if (!active) return;
        setMatchCount(matches.length);
        setPendingDealsCount(deals.map(fromApiDeal).filter((deal) =>
          !['completed', 'cancelled', 'failed'].includes(deal.status)).length);
        setIncomingBidsCount(bids.filter((bid) => String(bid.status || '').toLowerCase() === 'offered').length);
      })
      .catch((error) => console.error('Could not load farmer dashboard totals:', error));
    return () => { active = false; };
  }, []);

  const quantityEntries = Object.entries(stats.quantityByUnit);
  const quantityDisplay = quantityEntries.length
    ? quantityEntries.map(([unit, qty]) => `${qty} ${unit}`).join(' \u2022 ')
    : '0';

  const welcomeText = profile.name
    ? `${isKannada ? 'ಸ್ವಾಗತ' : 'Welcome back'}, ${profile.name.split(' ')[0]}`
    : (fo.welcomeDefault || (isKannada ? 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ' : 'Welcome to your dashboard'));

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{welcomeText}</h1>
          <p className="dash-page__subtitle">
            {fo.subtitle || (isKannada ? 'ಇಂದು ನಿಮ್ಮ ಪಟ್ಟಿಗಳ ಸ್ಥಿತಿಗತಿ ಇಲ್ಲಿದೆ.' : "Here's what's happening with your listings today.")}
          </p>
        </div>
        {listingsError && <div className="dash-banner dash-banner--error" role="alert">{listingsError}</div>}
        <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">
          {fo.addProduceBtn || (isKannada ? '+ ಬೆಳೆ ಸೇರಿಸಿ' : '+ Add Produce')}
        </Link>
      </div>

      <VerificationNotice user={user} role="farmer" />
      <WhatsAppCard />

      {incomingBidsCount > 0 && (
        <div className="dash-banner dash-banner--success" role="status" style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <strong>🏷️ {isKannada ? 'ಹೊಸ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆ ಬಂದಿದೆ!' : 'New Buyer Offers Received!'}</strong>{' '}
            <span>
              {isKannada
                ? `${incomingBidsCount} ಖರೀದಿದಾರರ ಬೆಲೆ ಪ್ರಸ್ತಾವನೆಗಳು ನಿಮ್ಮ ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿವೆ.`
                : `${incomingBidsCount} price offer(s) from buyers are waiting for your review.`}
            </span>
          </div>
          <Link to="/farmer/dashboard/bids" className="btn btn--primary btn--sm">
            {isKannada ? 'ಪ್ರಸ್ತಾವನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ →' : 'Review Offers →'}
          </Link>
        </div>
      )}

      <div className="stat-grid">
        <StatCard
          icon={<IconField />}
          label={fo.activeListings || (isKannada ? 'ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು' : 'Active Listings')}
          value={stats.activeCount}
          accent="primary"
        />
        <StatCard
          icon={<IconScale />}
          label={fo.availableQty || (isKannada ? 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ' : 'Available Quantity')}
          value={quantityDisplay}
          caption={quantityEntries.length
            ? (fo.acrossListings || (isKannada ? 'ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳಲ್ಲಿ' : 'across active listings'))
            : (fo.noActiveQty || (isKannada ? 'ಇನ್ನೂ ಪ್ರಮಾಣವಿಲ್ಲ' : 'No active quantity yet'))}
          accent="gold"
        />
        <StatCard
          icon={<IconScale />}
          label={isKannada ? 'ಬಂದಿರುವ ಪ್ರಸ್ತಾವನೆಗಳು' : 'Buyer Offers'}
          value={incomingBidsCount}
          caption={incomingBidsCount
            ? (isKannada ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ' : 'Action needed')
            : (isKannada ? 'ಇನ್ನೂ ಪ್ರಸ್ತಾವನೆಗಳಿಲ್ಲ' : 'No active offers')}
          accent="tomato"
        />
        <StatCard
          icon={<IconClock />}
          label={fo.pendingDeals || (isKannada ? 'ಬಾಕಿ ಒಪ್ಪಂದಗಳು' : 'Pending Deals')}
          value={pendingDealsCount}
          caption={pendingDealsCount
            ? `${pendingDealsCount} ${isKannada ? 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' : 'in progress'}`
            : (isKannada ? 'ಸಕ್ರಿಯ ವ್ಯವಹಾರಗಳಿಲ್ಲ' : 'No active trades')}
          accent="primary"
        />
        <StatCard
          icon={<IconHandshake />}
          label={fo.buyerMatches || (isKannada ? 'ಖರೀದಿದಾರ ಹೊಂದಾಣಿಕೆಗಳು' : 'Buyer Matches')}
          value={matchCount}
          caption={matchCount
            ? `${matchCount} ${isKannada ? 'ಖರೀದಿದಾರರು ಆಸಕ್ತಿ ಹೊಂದಿದ್ದಾರೆ' : 'buyers interested'}`
            : (isKannada ? 'ಇನ್ನೂ ಹೊಂದಾಣಿಕೆಗಳಿಲ್ಲ' : 'No matches yet')}
          accent="primary"
        />
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">
          {fo.snapshotHeading || (isKannada ? 'ಪಟ್ಟಿಗಳ ಸಂಕ್ಷಿಪ್ತ ವಿವರ' : 'Listing snapshot')}
        </h2>
        <p className="dash-panel__intro">
          {stats.totalListings} {isKannada ? 'ಒಟ್ಟು' : 'total'} {'\u2022'} {stats.draftCount} {isKannada ? 'ಕರಡು' : 'draft'} {'\u2022'}{' '}
          {stats.activeCount} {isKannada ? 'ಸಕ್ರಿಯ' : 'active'} {'\u2022'} {stats.matchedCount} {isKannada ? 'ಹೊಂದಿಸಲಾಗಿದೆ' : 'matched'} {'\u2022'}{' '}
          {stats.soldCount} {isKannada ? 'ಮಾರಾಟವಾಗಿದೆ' : 'sold'}
        </p>
        {stats.totalListings === 0 ? (
          <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
            {fo.noListings || (isKannada ? 'ನೀವು ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನವನ್ನು ಪಟ್ಟಿ ಮಾಡಿಲ್ಲ.' : "You haven't listed any produce yet.")}{' '}
            <Link to="/farmer/dashboard/add-produce" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {fo.addFirstListing || (isKannada ? 'ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆಯನ್ನು ಪಟ್ಟಿ ಮಾಡಿ' : 'Add your first listing')}
            </Link>{' '}
            {fo.startAppearing || (isKannada ? 'ಖರೀದಿದಾರರ ಹುಡುಕಾಟದಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳಲು.' : 'to start appearing in buyer searches.')}
          </p>
        ) : (
          <Link to="/farmer/dashboard/listings" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            {fo.viewAllListings || (isKannada ? 'ಎಲ್ಲಾ ಪಟ್ಟಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ →' : 'View all listings →')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Overview;
