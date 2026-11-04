import { useCallback, useEffect, useState } from 'react';
import BidHistory from '../../components/dashboard/BidHistory';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { apiRequest } from '../../lib/api';
import EmptyState from '../../components/dashboard/EmptyState';
import { IconScale } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [counterBidId, setCounterBidId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const tr = (en, kn) => (isKannada ? kn : en);
  const text = t.trading.buyerBids;

  const loadBids = useCallback(async () => {
    try {
      const data = await apiRequest('/bids');
      setBids(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest('/bids')
      .then((data) => {
        if (active) {
          setBids(data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleAction = async (bidId, action, extra = {}) => {
    setError('');
    setSavingId(bidId);
    try {
      await apiRequest(`/bids/${bidId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...extra }),
      });
      setCounterBidId(null);
      setCounterPrice('');
      await loadBids();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId('');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{text.title}</h1>
          <p className="dash-page__subtitle">{text.subtitle}</p>
        </div>
      </div>

      {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}

      {loading ? (
        <div className="dash-panel" role="status">{text.loading}</div>
      ) : bids.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconScale />}
            title={text.emptyTitle}
            description={text.emptyDescription}
            action={<Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">{t.trading.browseProduce}</Link>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {bids.map((bid) => {
            const status = String(bid.status || '').toLowerCase();
            const info = {
              offered: { label: tr('Waiting for farmer', 'ರೈತರ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ'), badge: 'gold' },
              countered: { label: text.counterReceived, badge: 'gold' },
              accepted: { label: text.agreed, badge: 'success' },
              rejected: { label: text.rejected, badge: 'muted' },
            }[status] || { label: bid.status, badge: 'neutral' };
            return (
              <article key={bid.id} className="dash-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{bid.crop || 'Produce'} · {bid.quantity} {bid.unit || 'kg'}</h2>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>{text.farmer}: <strong>{bid.farmerName || text.farmer}</strong></p>
                  </div>
                  <span className={`status-badge status-badge--${info.badge}`}>{info.label}</span>
                </div>

                <div className="listing-card__meta" style={{ marginTop: 'var(--space-3)' }}>
                  <span>{text.askingPrice}: <strong>₹{bid.askingPrice}</strong> / {bid.unit || 'kg'}</span>
                  <span>{text.yourOffer}: <strong>₹{bid.offerPrice}</strong> / {bid.unit || 'kg'}</span>
                  {status === 'countered' && bid.counterPrice != null && (
                    <span style={{ color: 'var(--color-gold-dark)', fontWeight: 600 }}>
                      {text.farmerCounter}: <strong>₹{bid.counterPrice}</strong> / {bid.unit || 'kg'}
                    </span>
                  )}
                  {status === 'accepted' && bid.agreedPrice != null && (
                    <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      {text.agreedPrice}: <strong>₹{bid.agreedPrice}</strong> / {bid.unit || 'kg'}
                    </span>
                  )}
                  <span>{text.totalValue}: <strong>₹{(Number(bid.quantity || 0) * Number(bid.agreedPrice || bid.offerPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  {status === 'countered' && (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={savingId === bid.id}
                        onClick={() => handleAction(bid.id, 'ACCEPT_COUNTER')}
                      >
                        {savingId === bid.id ? 'Updating…' : text.acceptCounter.replace('{price}', String(bid.counterPrice))}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        disabled={savingId === bid.id}
                        onClick={() => handleAction(bid.id, 'REJECT_COUNTER')}
                      >
                        {text.rejectCounter}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        disabled={savingId === bid.id}
                        onClick={() => {
                          setCounterBidId(counterBidId === bid.id ? null : bid.id);
                          setCounterPrice(String(bid.counterPrice ?? ''));
                        }}
                      >
                        {tr('Counter with my price', 'ನನ್ನ ಬೆಲೆಯಲ್ಲಿ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ')}
                      </button>
                    </>
                  )}
                  {status === 'offered' && (
                    <span style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>
                      {tr('Your offer is locked until the farmer accepts, rejects or counters.', 'ರೈತರು ಒಪ್ಪುವವರೆಗೆ, ತಿರಸ್ಕರಿಸುವವರೆಗೆ ಅಥವಾ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ ನೀಡುವವರೆಗೆ ನಿಮ್ಮ ಪ್ರಸ್ತಾವನೆ ಬದಲಿಸಲಾಗದು.')}
                    </span>
                  )}
                  {status === 'accepted' && bid.dealId && (
                    <Link to="/buyer/dashboard/deals" className="btn btn--outline btn--sm">{text.viewDeal}</Link>
                  )}
                </div>

                {counterBidId === bid.id && status === 'countered' && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <div className="dash-field" style={{ flex: '1 1 180px' }}>
                      <label htmlFor={`buyer-counter-${bid.id}`}>{tr(`Your new price per ${bid.unit || 'kg'} (₹)`, `ನಿಮ್ಮ ಹೊಸ ಬೆಲೆ (₹)`)}</label>
                      <input id={`buyer-counter-${bid.id}`} type="number" min="0.01" step="0.01" value={counterPrice}
                        onChange={(event) => setCounterPrice(event.target.value)} />
                    </div>
                    <button type="button" className="btn btn--primary btn--sm" disabled={savingId === bid.id}
                      onClick={() => {
                        const price = Number(counterPrice);
                        if (!price || price <= 0) { setError(tr('Enter a valid price.', 'ಸರಿಯಾದ ಬೆಲೆ ನಮೂದಿಸಿ.')); return; }
                        handleAction(bid.id, 'BUYER_COUNTER', { counterPrice: price });
                      }}>
                      {tr('Send my price', 'ನನ್ನ ಬೆಲೆ ಕಳುಹಿಸಿ')}
                    </button>
                  </div>
                )}

                <BidHistory bid={bid} youAre="BUYER" isKannada={isKannada} />

                <p style={{ color: 'var(--color-ink-faint)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-3)' }}>
                  {text.submitted} {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : '—'}
                  {bid.updatedAt && bid.updatedAt !== bid.createdAt ? ` · ${text.updated} ${new Date(bid.updatedAt).toLocaleDateString('en-IN')}` : ''}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
