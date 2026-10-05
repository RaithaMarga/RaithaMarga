import { Link } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { IconClock, IconField, IconHandshake, IconShieldCheck, IconSprout, IconBasket } from '../../components/dashboard/icons';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import '../../components/dashboard/dashboard-ui.css';

const AdminOverview = () => {
  const { data, loading, error, reload } = useAdminResource(adminApi.overview);
  const pending = (data?.pendingFarmers ?? 0) + (data?.pendingBuyers ?? 0);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Administration Console</h1>
          <p className="dash-page__subtitle">Live marketplace numbers and items waiting for your review.</p>
        </div>
        <button type="button" className="btn btn--sm btn--outline" onClick={reload}>Refresh</button>
      </div>

      {error ? <div className="dash-banner dash-banner--error">{error}</div> : null}
      {loading ? <p>Loading overview…</p> : null}

      {data ? (
        <>
          <div className="stat-grid">
            <StatCard icon={<IconClock />} label="Pending verifications" value={pending}
              caption={`${data.pendingFarmers} farmers · ${data.pendingBuyers} buyers`}
              accent={pending > 0 ? 'tomato' : 'primary'} />
            <StatCard icon={<IconShieldCheck />} label="Verified buyers" value={data.verifiedBuyers} accent="primary" />
            <StatCard icon={<IconSprout />} label="Farmers" value={data.totalFarmers} accent="primary" />
            <StatCard icon={<IconHandshake />} label="Buyers" value={data.totalBuyers} accent="gold" />
            <StatCard icon={<IconField />} label="Active listings" value={data.activeListings} accent="primary" />
            <StatCard icon={<IconBasket />} label="Active requirements" value={data.activeRequirements} accent="gold" />
          </div>

          {pending > 0 ? (
            <div className="dash-banner" style={{ marginTop: 'var(--space-5)' }}>
              {pending} account{pending === 1 ? '' : 's'} waiting for review.{' '}
              <Link to="/admin/dashboard/verifications">Open the verification queue →</Link>
            </div>
          ) : null}

          <div className="dash-panel" style={{ marginTop: 'var(--space-5)' }}>
            <h2 className="dash-panel__heading">Deals by status</h2>
            <ul className="admin-deals-list">
              {Object.entries(data.dealsByStatus || {}).map(([status, count]) => (
                <li key={status}>
                  <StatusBadge status={status.toLowerCase()} />
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminOverview;
