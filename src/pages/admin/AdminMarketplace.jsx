import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
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
              <td><ListingImage listing={row} className="admin-listing-crop-image" /><strong>{row.crop}</strong>{row.grade ? <span className="admin-table__sub">Grade {row.grade}</span> : null}</td>
              <td>{row.availableQuantity ?? row.quantity} {row.unit}</td>
              <td>₹{row.price} / {row.unit}</td>
              <td>{[row.village, row.taluk, row.district].filter(Boolean).join(', ') || '—'}</td>
              <td>{row.availabilityDate || '—'}</td>
              <td>{row.farmerName || shortId(row.farmerId)}</td>
              <td><StatusBadge status={String(row.status).toLowerCase()} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const NEXT_STATUSES = {
  INTERESTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'FAILED'],
};
const LABELS = { CONFIRMED: 'Confirm', IN_PROGRESS: 'Start', COMPLETED: 'Complete', CANCELLED: 'Cancel', FAILED: 'Mark failed' };

const TONES = { PAID: 'success', CONFIRMED: 'success', SETTLED: 'success', READY: 'gold', PENDING: 'gold', NOT_DUE: 'muted' };
const PAY_LABELS = { PAID: 'Paid', PENDING: 'Pending', CONFIRMED: 'Confirmed', NOT_DUE: 'Not due', READY: 'Ready to settle', SETTLED: 'Settled' };
const PayBadge = ({ value }) => (
  <span className={`status-badge status-badge--${TONES[value] || 'muted'}`}>{PAY_LABELS[value] || value || 'Pending'}</span>
);

// Records that the team has paid the farmer. The server only allows it once payment is verified and delivery confirmed.
const SettleControl = ({ row, onDone }) => {
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await adminApi.settleDeal(row.id, { reference: reference.trim(), note: note.trim() || null });
      setOpen(false);
      onDone();
    } catch (err) {
      setError(err.message || 'Could not record the payout.');
    } finally {
      setBusy(false);
    }
  };
  if (!open) {
    return <button type="button" className="btn btn--sm btn--primary" onClick={() => setOpen(true)}>Record payout</button>;
  }
  return (
    <div style={{ display: 'grid', gap: 6, minWidth: 200 }}>
      <input aria-label="Payout reference" placeholder="Payout reference (UTR / txn id)" maxLength={120}
        value={reference} onChange={(event) => setReference(event.target.value)} />
      <input aria-label="Note" placeholder="Note (optional)" maxLength={500}
        value={note} onChange={(event) => setNote(event.target.value)} />
      {error ? <span role="alert" style={{ color: 'var(--color-danger, #b3261e)' }}>{error}</span> : null}
      <div className="admin-table__actions">
        <button type="button" className="btn btn--sm btn--primary" disabled={busy || !reference.trim()} onClick={submit}>Save</button>
        <button type="button" className="btn btn--sm btn--outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </div>
  );
};

const DealsTable = () => {
  const { data, loading, error, reload } = useAdminResource(adminApi.deals);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [needsAction, setNeedsAction] = useState(false);
  const [managedOnly, setManagedOnly] = useState(false);

  // Only works for deals whose farmer was added by the team (they have no login); the server enforces this.
  const move = async (id, status) => {
    setBusy(id);
    setActionError('');
    try {
      await adminApi.updateDealStatus(id, status);
      reload();
    } catch (err) {
      setActionError(err.message || 'Could not update the deal.');
    } finally {
      setBusy('');
    }
  };
  const rows = (data || []).filter((row) =>
    (!needsAction || ['INTERESTED', 'CONFIRMED', 'IN_PROGRESS'].includes(row.status))
      && (!managedOnly || row.managed),
  );
  if (error) return <div className="dash-banner dash-banner--error">{error}</div>;
  if (loading) return <p>Loading…</p>;
  if ((data || []).length === 0) return <EmptyState icon="⚖" title="No deals yet" description="Deals appear when buyers show interest in listings." />;
  return (
    <div className="admin-table-wrap">
      <div className="admin-toolbar" style={{ marginBottom: 'var(--space-4)' }}>
        <label><input type="checkbox" checked={needsAction} onChange={(event) => setNeedsAction(event.target.checked)} /> Needs action</label>
        <label><input type="checkbox" checked={managedOnly} onChange={(event) => setManagedOnly(event.target.checked)} /> Team-added farmers only</label>
      </div>
      {rows.length === 0 ? <EmptyState icon="⚖" title="No matching deals" description="Try changing or clearing the deal filters." /> : null}
      {actionError ? <div className="dash-banner dash-banner--error">{actionError}</div> : null}
      {rows.length > 0 ? <table className="admin-table">
        <thead><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Farmer</th><th>Farmer phone</th><th>Buyer</th><th>Buyer contact</th><th>Date</th><th>Status</th><th>Payment</th><th>Delivery</th><th>Settlement</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><strong>{row.crop || 'Produce'}</strong><span className="admin-table__sub">{shortId(row.id)}</span></td>
              <td>{row.quantity} {row.unit}</td>
              <td>₹{row.price} / {row.unit}</td>
              <td>{row.farmerName || shortId(row.farmerId)}</td>
              <td>{row.managed ? row.farmerPhone || '—' : '—'}</td>
              <td>{row.buyerName || shortId(row.buyerId)}</td>
              <td>{row.buyerContact || '—'}</td>
              <td>{formatDateTime(row.createdAt)}</td>
              <td><StatusBadge status={String(row.status).toLowerCase()} /></td>
              <td>
                <PayBadge value={row.paymentStatus} />
                <span className="admin-table__sub">₹{Number(row.totalAmount || 0).toLocaleString('en-IN')}</span>
              </td>
              <td><PayBadge value={row.deliveryStatus} /></td>
              <td>
                <PayBadge value={row.settlementStatus} />
                {row.settlementReference ? <span className="admin-table__sub">Ref {row.settlementReference}</span> : null}
              </td>
              <td>
                <div className="admin-table__actions">
                  {row.settlementStatus === 'READY' ? <SettleControl row={row} onDone={reload} /> : null}
                  {(row.managed ? NEXT_STATUSES[row.status] || [] : []).map((next) => (
                    <button key={next} type="button" className="btn btn--sm btn--outline" disabled={busy === row.id} onClick={() => move(row.id, next)}>
                      {LABELS[next]}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        : null}
    </div>
  );
};

const AdminMarketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'deals' ? 'deals' : 'listings';
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Marketplace</h1>
          <p className="dash-page__subtitle">The latest 200 listings and deals. Deal actions work for farmers added by the team.</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          <button type="button" className={`btn btn--sm ${tab === 'listings' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setSearchParams({ tab: 'listings' })}>Listings</button>
          <button type="button" className={`btn btn--sm ${tab === 'deals' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setSearchParams({ tab: 'deals' })}>Deals</button>
        </div>
      </div>
      <div className="dash-panel">{tab === 'listings' ? <ListingsTable /> : <DealsTable />}</div>
    </div>
  );
};

export default AdminMarketplace;
