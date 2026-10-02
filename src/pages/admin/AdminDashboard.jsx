import { useAdminData } from '../../context/AdminDataContext';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { IconClock, IconField, IconHandshake, IconShieldCheck } from '../../components/dashboard/icons';
import { AdminErrorNotice, AdminLoading } from './AdminFeedback';
import './admin-dashboard.css';

const AdminDashboard = () => {
  const { overview, loading, error, refresh } = useAdminData();

  if (loading && !overview) return <AdminLoading label="Loading marketplace overview…" />;
  if (!overview) return <AdminErrorNotice error={error} onRetry={() => refresh().catch(() => {})} />;

  const pendingCount = (overview.pendingFarmers || 0) + (overview.pendingBuyers || 0);
  const dealStatuses = Object.entries(overview.dealsByStatus || {});

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <span className="eyebrow admin-eyebrow">Marketplace administration</span>
          <h1 className="dash-page__title">Admin overview</h1>
          <p className="dash-page__subtitle">Live account verification and marketplace activity.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={() => refresh().catch(() => {})}>
          Refresh data
        </button>
      </div>

      {error ? <AdminErrorNotice error={error} compact /> : null}

      <div className="stat-grid">
        <StatCard icon={<IconClock />} label="Pending verifications" value={pendingCount}
          caption={`${overview.pendingFarmers || 0} farmers · ${overview.pendingBuyers || 0} buyers`}
          accent={pendingCount ? 'gold' : 'primary'} />
        <StatCard icon={<IconShieldCheck />} label="Verified buyers" value={overview.verifiedBuyers || 0}
          caption={`${overview.totalBuyers || 0} buyer accounts`} accent="primary" />
        <StatCard icon={<IconField />} label="Active listings" value={overview.activeListings || 0}
          caption={`${overview.totalFarmers || 0} farmer accounts`} accent="gold" />
        <StatCard icon={<IconHandshake />} label="Active requirements" value={overview.activeRequirements || 0}
          caption="Buyer demand published" accent="primary" />
      </div>

      <section className="dash-panel">
        <div className="admin-section-heading">
          <div>
            <h2 className="dash-panel__heading">Deals by status</h2>
            <p className="dash-panel__intro">Current marketplace deal lifecycle counts.</p>
          </div>
          <StatusBadge status={`${dealStatuses.reduce((sum, [, count]) => sum + count, 0)} deals`} />
        </div>
        {dealStatuses.length
          ? <div className="admin-deal-stats">
            {dealStatuses.map(([status, count]) => (
              <div className="admin-deal-stat" key={status}>
                <span>{status.replaceAll('_', ' ')}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          : <p className="admin-muted">No deals have been recorded.</p>}
      </section>
    </div>
  );
};

export default AdminDashboard;
