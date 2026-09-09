import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const RequestsOrders = () => {
  const { requests, cancelRequest } = useBuyerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Requests / Orders</h1>
          <p className="dash-page__subtitle">Produce you've expressed interest in, and its status.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconHandshake />}
            title="No requests yet"
            description="When you express interest in a listing from Browse Produce, it will show up here."
            action={<Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">Browse Produce</Link>}
          />
        </div>
      ) : (
        <div className="dash-panel" style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {requests.map((r) => (
            <div key={r.id} className="doc-row">
              <div className="doc-row__label">
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{r.crop || 'Produce'}</span>
                <span className="doc-row__filename">
                  {r.quantity} {r.unit} {'\u2022'} {'\u20B9'}{r.expectedPrice}/{r.unit} {'\u2022'} {r.location || 'Location not set'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <StatusBadge status={r.status} />
                {r.status === 'requested' && (
                  <button type="button" className="btn--text" onClick={() => cancelRequest(r.id)}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-panel">
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-ink-faint)' }}>
          Requests are sent to the farmer once RaithaMarga's deal workflow is connected. For now, a request
          simply records your interest — you'll see it move to <strong>Deals</strong> once that's live.
        </p>
      </div>
    </div>
  );
};

export default RequestsOrders;
