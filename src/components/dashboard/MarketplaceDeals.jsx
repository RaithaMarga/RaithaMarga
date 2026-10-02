import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';
import { fromApiDeal, fromApiListing } from '../../lib/marketplace';
import EmptyState from './EmptyState';
import { IconScale } from './icons';
import './dashboard-ui.css';

const STATUS_LABELS = {
  interested: 'Interest requested',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

const farmerActions = {
  interested: [['CONFIRMED', 'Confirm deal']],
  confirmed: [['IN_PROGRESS', 'Mark in progress']],
  in_progress: [['COMPLETED', 'Complete deal']],
};

const buyerActions = {
  interested: [['CANCELLED', 'Cancel deal']],
  confirmed: [['CANCELLED', 'Cancel deal']],
  in_progress: [['COMPLETED', 'Confirm completion'], ['CANCELLED', 'Cancel deal']],
};

export default function MarketplaceDeals({ role }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const loadDeals = useCallback(async () => {
    try {
      const [dealData, listingData] = await Promise.all([apiRequest('/deals'), apiRequest('/listings')]);
      const listingsById = new Map(listingData.map((listing) => [listing.id, fromApiListing(listing)]));
      setDeals(dealData.map((item) => ({
        ...fromApiDeal(item),
        listing: listingsById.get(item.listingId),
      })));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/deals'), apiRequest('/listings')])
      .then(([dealData, listingData]) => {
        if (!active) return;
        const listingsById = new Map(listingData.map((listing) => [listing.id, fromApiListing(listing)]));
        setDeals(dealData.map((item) => ({
          ...fromApiDeal(item),
          listing: listingsById.get(item.listingId),
        })));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateStatus = async (dealId, status) => {
    setError('');
    setSavingId(dealId);
    try {
      await apiRequest(`/deals/${dealId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadDeals();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId('');
    }
  };

  const title = role === 'farmer' ? 'My Deals' : 'Deals & Procurement Orders';
  const actionMap = role === 'farmer' ? farmerActions : buyerActions;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{title}</h1>
          <p className="dash-page__subtitle">Track and update deal status using the available backend workflow.</p>
        </div>
      </div>
      {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}
      {loading ? (
        <div className="dash-panel" role="status">Loading deals…</div>
      ) : deals.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconScale />}
            title="No deals yet"
            description="Deals opened by buyers will appear here for both parties."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {deals.map((deal) => {
            const action = actionMap[deal.status];
            return (
              <article key={deal.id} className="dash-panel">
                <p style={{ fontFamily: 'monospace', color: 'var(--color-ink-faint)' }}>Deal {deal.id}</p>
                <h2>{deal.listing?.crop || 'Produce'} · {deal.quantity} {deal.listing?.unit || ''}</h2>
                <p>Unit price: ₹{deal.price ?? deal.agreedPrice ?? '—'} · Total: ₹{deal.totalAmount.toLocaleString('en-IN')}</p>
                <p>Status: <strong>{STATUS_LABELS[deal.status] || deal.status}</strong></p>
                {!deal.listing && <p>Listing reference: {deal.listingId}</p>}
                {action?.map(([status, label]) => (
                  <button
                    key={status}
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={savingId === deal.id}
                    onClick={() => updateStatus(deal.id, status)}
                  >
                    {savingId === deal.id ? 'Updating…' : label}
                  </button>
                ))}
              </article>
            );
          })}
        </div>
      )}
      <p className="dash-page__subtitle">Proof uploads, pickup scheduling, and payment settlement are not supported by the backend yet.</p>
    </div>
  );
}
