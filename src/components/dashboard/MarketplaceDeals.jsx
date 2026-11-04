import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useStoredDeals } from '../../hooks/useStoredDeals';
import { useMarketplaceListings } from '../../hooks/useMarketplaceListings';
import { apiRequest } from '../../lib/api';
import { fromApiDeal, fromApiListing, isLocalDeal, updateLocalDealStatus } from '../../lib/marketplace';
import EmptyState from './EmptyState';
import DealCard from './DealCard';
import { IconScale } from './icons';
import './dashboard-ui.css';
import './payments.css';

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
  const { user } = useAuth();
  const storedDeals = useStoredDeals();
  const allListings = useMarketplaceListings();

  // Deals on local-only listings (created in this browser) belong to this buyer / this farmer.
  const localDeals = useMemo(() => {
    const byId = new Map(allListings.map((l) => [l.id, l]));
    return storedDeals
      .filter((d) => (role === 'farmer'
        ? d.farmerId === user?.uid || d.farmerId === 'farmer-local'
        : d.buyerId === user?.uid))
      .map((d) => ({ ...fromApiDeal(d), listing: byId.get(d.listingId) || { crop: d.crop, unit: d.unit } }));
  }, [storedDeals, allListings, role, user?.uid]);
  const visibleDeals = useMemo(() => [...localDeals, ...deals], [localDeals, deals]);

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
      if (isLocalDeal(dealId)) {
        updateLocalDealStatus(dealId, status);
        return;
      }
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
      ) : visibleDeals.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconScale />}
            title="No deals yet"
            description="Deals opened by buyers will appear here for both parties."
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {visibleDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              role={role}
              actions={actionMap[deal.status] || []}
              busy={savingId === deal.id}
              canView={!isLocalDeal(deal.id)}
              onAction={updateStatus}
            />
          ))}
        </div>
      )}
      <p className="dash-page__subtitle">Proof uploads and pickup scheduling are not supported yet.</p>
    </div>
  );
}
