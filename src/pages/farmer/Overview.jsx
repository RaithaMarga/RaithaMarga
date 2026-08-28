import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatCard from '../../components/dashboard/StatCard';
import '../../components/dashboard/dashboard-ui.css';

const Overview = () => {
  const { stats, profile } = useFarmerData();

  const quantityEntries = Object.entries(stats.quantityByUnit);
  const quantityDisplay = quantityEntries.length
    ? quantityEntries.map(([unit, qty]) => `${qty} ${unit}`).join(' \u2022 ')
    : '0';

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">
            {profile.name ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Welcome to your dashboard'}
          </h1>
          <p className="dash-page__subtitle">Here's what's happening with your listings today.</p>
        </div>
        <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">
          + Add Produce
        </Link>
      </div>

      <div className="stat-grid">
        <StatCard icon="\u25A6" label="Active Listings" value={stats.activeCount} accent="primary" />
        <StatCard
          icon="\u2696"
          label="Available Quantity"
          value={quantityDisplay}
          caption={quantityEntries.length ? 'across active listings' : 'No active quantity yet'}
          accent="gold"
        />
        <StatCard icon="\u21C6" label="Buyer Matches" value={0} caption="Matching launches soon" accent="primary" />
        <StatCard icon="\u23F3" label="Pending Deals" value={0} caption="No deals in progress yet" accent="tomato" />
      </div>

      <div className="dash-panel">
        <h2 className="dash-page__title" style={{ fontSize: 'var(--font-size-xl)' }}>Listing snapshot</h2>
        <p className="dash-page__subtitle" style={{ marginBottom: 'var(--space-4)' }}>
          {stats.totalListings} total \u2022 {stats.draftCount} draft \u2022 {stats.activeCount} active \u2022{' '}
          {stats.matchedCount} matched \u2022 {stats.soldCount} sold
        </p>
        {stats.totalListings === 0 ? (
          <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
            You haven't listed any produce yet.{' '}
            <Link to="/farmer/dashboard/add-produce" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Add your first listing
            </Link>{' '}
            to start appearing in buyer searches.
          </p>
        ) : (
          <Link to="/farmer/dashboard/listings" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
            View all listings →
          </Link>
        )}
      </div>
    </div>
  );
};

export default Overview;
