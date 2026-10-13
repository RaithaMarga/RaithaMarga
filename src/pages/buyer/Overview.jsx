import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import VerificationNotice from '../../components/dashboard/VerificationNotice';
import StatCard from '../../components/dashboard/StatCard';
import { IconBasket, IconHandshake, IconScale, IconShieldCheck } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const Overview = () => {
  const { profile, stats, requests, listings, dataError } = useBuyerData();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const bo = t.dashboard?.buyerOverview || {};

  const activeCount = listings.filter((l) => l.status === 'active').length;

  const activeDealsCount = requests.filter((deal) =>
    !['completed', 'cancelled', 'failed'].includes(deal.status)).length;
  const completedDealsCount = requests.filter((deal) => deal.status === 'completed').length;

  const welcomeText = profile.contactName
    ? `${isKannada ? 'ಸ್ವಾಗತ' : 'Welcome back'}, ${profile.contactName.split(' ')[0]}`
    : (bo.welcomeDefault || (isKannada ? 'ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಸ್ವಾಗತ' : 'Welcome to your dashboard'));

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{welcomeText}</h1>
          <p className="dash-page__subtitle">
            {bo.subtitle || (isKannada ? 'ಮಾರುಕಟ್ಟೆಯ ಇಂದಿನ ಮುಖ್ಯಾಂಶಗಳು ಇಲ್ಲಿವೆ.' : "Here's what's happening in the marketplace today.")}
          </p>
        </div>
        {dataError && <div className="dash-banner dash-banner--error" role="alert">{dataError}</div>}
        <Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">
          {bo.browseProduceBtn || (isKannada ? 'ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Produce')}
        </Link>
      </div>

      <VerificationNotice user={user} role="buyer" />

      <div className="stat-grid">
        <StatCard
          icon={<IconBasket />}
          label={bo.availableProduce || (isKannada ? 'ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳು' : 'Available Produce')}
          value={activeCount}
          caption={bo.activeListingsCaption || (isKannada ? 'ನೀವು ಬ್ರೌಸ್ ಮಾಡಬಹುದಾದ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು' : 'active listings you can browse')}
          accent="primary"
        />
        <StatCard
          icon={<IconHandshake />}
          label={bo.pendingRequests || (isKannada ? 'ಬಾಕಿ ವಿನಂತಿಗಳು' : 'Pending Requests')}
          value={stats.pendingCount}
          caption={bo.awaitingFarmer || (isKannada ? 'ರೈತರ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ' : 'awaiting farmer response')}
          accent="gold"
        />
        <StatCard
          icon={<IconScale />}
          label={bo.activeDeals || (isKannada ? 'ಸಕ್ರಿಯ ಒಪ್ಪಂದಗಳು' : 'Active Deals')}
          value={activeDealsCount}
          caption={activeDealsCount
            ? `${activeDealsCount} ${isKannada ? 'ಆರ್ಡರ್‌ಗಳು ಪ್ರಗತಿಯಲ್ಲಿವೆ' : 'orders in progress'}`
            : (isKannada ? 'ಸಕ್ರಿಯ ವ್ಯವಹಾರಗಳಿಲ್ಲ' : 'No active trades')}
          accent="primary"
        />
        <StatCard
          icon={<IconShieldCheck />}
          label={bo.completedPurchases || (isKannada ? 'ಪೂರ್ಣಗೊಂಡ ಖರೀದಿಗಳು' : 'Completed Purchases')}
          value={completedDealsCount}
          caption={completedDealsCount
            ? `${completedDealsCount} ${isKannada ? 'ಪೂರ್ಣಗೊಂಡ ವ್ಯವಹಾರಗಳು' : 'settled orders'}`
            : (isKannada ? 'ಯಾವುದೇ ಒಪ್ಪಂದಗಳು ಪೂರ್ಣಗೊಂಡಿಲ್ಲ' : 'No completed trades yet')}
          accent="tomato"
        />
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">
          {bo.getStarted || (isKannada ? 'ಪ್ರಾರಂಭಿಸಿ' : 'Get started')}
        </h2>
        <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
          {activeCount === 0 ? (
            bo.noProduce || (isKannada ? 'ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನ ಪಟ್ಟಿಯಾಗಿಲ್ಲ — ಶೀಘ್ರದಲ್ಲೇ ಪರಿಶೀಲಿಸಿ.' : 'No produce is listed yet — check back soon.')
          ) : (
            <>
              {isKannada ? (
                <>
                  ಪ್ರಸ್ತುತ <strong>{activeCount}</strong> ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳು ಲಭ್ಯವಿವೆ.{' '}
                  <Link to="/buyer/dashboard/browse" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    ಉತ್ಪನ್ನಗಳನ್ನು ವೀಕ್ಷಿಸಿ →
                  </Link>
                </>
              ) : (
                <>
                  There {activeCount === 1 ? 'is' : 'are'} <strong>{activeCount}</strong> active listing
                  {activeCount === 1 ? '' : 's'} available right now.{' '}
                  <Link to="/buyer/dashboard/browse" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Browse produce →
                  </Link>
                </>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Overview;
