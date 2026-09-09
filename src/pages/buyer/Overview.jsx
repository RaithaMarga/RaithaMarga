import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useFarmerListings } from '../../hooks/useSharedFarmerData';
import StatCard from '../../components/dashboard/StatCard';
import { IconBasket, IconHandshake, IconScale, IconShieldCheck } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const Overview = () => {
  const { profile, stats } = useBuyerData();
  const listings = useFarmerListings();
  const activeCount = listings.filter((l) => l.status === 'active').length;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">
            {profile.contactName ? `Welcome back, ${profile.contactName.split(' ')[0]}` : 'Welcome to your dashboard'}
          </h1>
          <p className="dash-page__subtitle">Here's what's happening in the marketplace today.</p>
        </div>
        <Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">Browse Produce</Link>
      </div>

      <div className="stat-grid">
        <StatCard
          icon={<IconBasket />}
          label="Available Produce"
          value={activeCount}
          caption="active listings you can browse"
          accent="primary"
        />
        <StatCard
          icon={<IconHandshake />}
          label="Pending Requests"
          value={stats.pendingCount}
          caption="awaiting farmer response"
          accent="gold"
        />
        <StatCard icon={<IconScale />} label="Active Deals" value={0} caption="Deal lifecycle coming soon" accent="primary" />
        <StatCard icon={<IconShieldCheck />} label="Completed Purchases" value={0} caption="Deal lifecycle coming soon" accent="tomato" />
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">Get started</h2>
        <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
          {activeCount === 0 ? (
            'No produce is listed yet — check back soon, or ask a farmer in your network to join RaithaMarga.'
          ) : (
            <>
              There {activeCount === 1 ? 'is' : 'are'} <strong>{activeCount}</strong> active listing
              {activeCount === 1 ? '' : 's'} available right now.{' '}
              <Link to="/buyer/dashboard/browse" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Browse produce →
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Overview;
