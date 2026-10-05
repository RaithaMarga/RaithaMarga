import { useState } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import { formatDateTime, shortId } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const ListingsTable = () => {
  const { data, loading, error } = useAdminResource(adminApi.listings);
  const rows = data || [];
  if (error) return <div className="dash-banner dash-banner--error">{error}</div>;
  if (loading) return <p>Loading…</p>;
  if (rows.length === 0) return <EmptyState icon="⚲" title="No listings yet" description="Farmer listings will appear here." />;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Location</th><th>Available from</th><th>Farmer</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.crop}</strong>{row.grade ? <span className="admin-table__sub">Grade {row.grade}</span> : null}</td>
              <td>{row.availableQuantity ?? row.quantity} {row.unit}</td>
              <td>₹{row.price} / {row.unit}</td>
              <td>{[row.village, row.taluk, row.district].filter(Boolean).join(', ') || '—'}</td>
              <td>{row.availabilityDate || '—'}</td>
              <td className="admin-table__mono">{shortId(row.farmerId)}</td>
              <td><StatusBadge status={String(row.status).toLowerCase()} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DealsTable = () => {
  const { data, loading, error } = useAdminResource(adminApi.deals);
  const rows = data || [];
  if (error) return <div className="dash-banner dash-banner--error">{error}</div>;
  if (loading) return <p>Loading…</p>;
  if (rows.length === 0) return <EmptyState icon="⚖" title="No deals yet" description="Deals appear when buyers show interest in listings." />;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead><tr><th>Deal</th><th>Quantity</th><th>Price</th><th>Farmer</th><th>Buyer</th><th>Created</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="admin-table__mono">{shortId(row.id)}</td>
              <td>{row.quantity}</td>
              <td>₹{row.price}</td>
              <td className="admin-table__mono">{shortId(row.farmerId)}</td>
              <td className="admin-table__mono">{shortId(row.buyerId)}</td>
              <td>{formatDateTime(row.createdAt)}</td>
              <td><StatusBadge status={String(row.status).toLowerCase()} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AdminMarketplace = () => {
  const [tab, setTab] = useState('listings');
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Marketplace</h1>
          <p className="dash-page__subtitle">Read-only view of the latest 200 listings and deals.</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          <button type="button" className={`btn btn--sm ${tab === 'listings' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setTab('listings')}>Listings</button>
          <button type="button" className={`btn btn--sm ${tab === 'deals' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setTab('deals')}>Deals</button>
        </div>
      </div>
      <div className="dash-panel">{tab === 'listings' ? <ListingsTable /> : <DealsTable />}</div>
    </div>
  );
};

export default AdminMarketplace;
