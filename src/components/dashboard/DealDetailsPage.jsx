import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { usePaymentCopy } from '../../i18n/paymentCopy';
import DealPaymentPanel from './DealPaymentPanel';
import './dashboard-ui.css';
import './payments.css';

/** One confirmed deal: who, what, final agreed numbers, and the payment / delivery / settlement state. */
export default function DealDetailsPage({ role }) {
  const { dealId } = useParams();
  const { copy } = usePaymentCopy();
  const [deal, setDeal] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const backPath = role === 'farmer' ? '/farmer/dashboard/deals' : '/buyer/dashboard/deals';

  const load = useCallback(
    () => apiRequest(`/deals/${encodeURIComponent(dealId)}`).then((data) => { setDeal(data); setError(''); }),
    [dealId],
  );

  useEffect(() => {
    let active = true;
    apiRequest(`/deals/${encodeURIComponent(dealId)}`)
      .then((data) => { if (active) setDeal(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dealId]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <p><Link className="pay-link" to={backPath}>{copy.backToDeals}</Link></p>
          <h1 className="dash-page__title">{copy.dealTitle}</h1>
        </div>
      </div>
      {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}
      {loading && <div className="dash-panel" role="status">{copy.loadingDeal}</div>}
      {!loading && !deal && !error && <div className="dash-panel">{copy.dealNotFound}</div>}
      {deal && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <section className="dash-panel">
            <h2>{deal.crop || 'Produce'}</h2>
            <dl className="pay-amounts">
              <div><dt>{copy.farmer}</dt><dd>{deal.farmerName || '—'}</dd></div>
              <div><dt>{copy.buyer}</dt><dd>{deal.buyerName || '—'}</dd></div>
              <div><dt>{copy.dealStatus}</dt><dd>{copy.dealStatuses[deal.status] || deal.status}</dd></div>
            </dl>
          </section>
          <DealPaymentPanel deal={deal} role={role} onChanged={load} />
        </div>
      )}
    </div>
  );
}
