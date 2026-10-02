import { useCallback, useEffect, useState } from 'react';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { getAdminDeals, getAdminListings } from '../../lib/adminApi';
import { AdminErrorNotice, AdminLoading } from './AdminFeedback';
import { formatAdminDate } from './adminUtils';
import './admin-dashboard.css';

const AdminMarketplace = () => {
  const [listings, setListings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextListings, nextDeals] = await Promise.all([getAdminListings(), getAdminDeals()]);
      setListings(nextListings);
      setDeals(nextDeals);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => refresh());
  }, [refresh]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <span className="eyebrow admin-eyebrow">Read-only monitoring</span>
          <h1 className="dash-page__title">Marketplace</h1>
          <p className="dash-page__subtitle">Latest listings and deal activity, up to 200 records per table.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={refresh}>Refresh marketplace</button>
      </div>
      {error ? <AdminErrorNotice error={error} onRetry={refresh} /> : null}
      {loading ? <AdminLoading label="Loading listings and deals…" /> : null}

      {!loading ? (
        <>
          <section className="dash-panel">
            <h2 className="dash-panel__heading">Listings ({listings.length})</h2>
            {!listings.length ? <p className="admin-muted">No listings found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Produce</th><th>Farmer</th><th>Quantity</th><th>Location</th><th>Status</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing.id}>
                        <td><strong>{listing.crop || '—'}</strong><small>{listing.grade || ''}</small></td>
                        <td>{listing.farmerId || '—'}</td>
                        <td>{listing.quantity ?? '—'} {listing.unit || ''}</td>
                        <td>{[listing.village, listing.taluk, listing.district].filter(Boolean).join(', ') || '—'}</td>
                        <td><StatusBadge status={listing.status || 'UNKNOWN'} /></td>
                        <td>{formatAdminDate(listing.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="dash-panel">
            <h2 className="dash-panel__heading">Deals ({deals.length})</h2>
            {!deals.length ? <p className="admin-muted">No deals found.</p> : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Deal</th><th>Listing</th><th>Farmer</th><th>Buyer</th><th>Quantity</th><th>Price</th><th>Status</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {deals.map((deal) => (
                      <tr key={deal.id}>
                        <td>{deal.id}</td>
                        <td>{deal.listingId || '—'}</td>
                        <td>{deal.farmerId || '—'}</td>
                        <td>{deal.buyerId || '—'}</td>
                        <td>{deal.quantity ?? '—'}</td>
                        <td>{deal.price ?? '—'}</td>
                        <td><StatusBadge status={deal.status || 'UNKNOWN'} /></td>
                        <td>{formatAdminDate(deal.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default AdminMarketplace;
