import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiRequest } from '../../lib/api';
import EmptyState from '../../components/dashboard/EmptyState';
import BidHistory from '../../components/dashboard/BidHistory';
import { IconScale } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

export default function IncomingBids({ admin = false }) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');
  const [counterBidId, setCounterBidId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const { t } = useLanguage();
  const text = t.trading.farmerBids;

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

  const handleAction = async (bidId, action, extraPayload = {}) => {
    setError('');
    setSavingId(bidId);
    try {
      await apiRequest(`/bids/${bidId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...extraPayload }),
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

  const submitCounter = (bidId) => {
    const price = Number(counterPrice);
    if (!price || price <= 0) {
      setError(text.enterCounter);
      return;
    }
    handleAction(bidId, 'COUNTER', { counterPrice: price });
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{admin ? 'Offers for team-added farmers' : text.title}</h1>
          <p className="dash-page__subtitle">{admin ? 'These farmers have no login. Enter their reply here after speaking with them; every action is recorded in the audit log.' : text.subtitle}</p>
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
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {bids.map((bid) => {
            const status = String(bid.status || '').toLowerCase();
            const info = {
              offered: { label: text.actionNeeded, badge: 'gold' },
              countered: { label: text.waitingForBuyer, badge: 'primary' },
              accepted: { label: text.agreed, badge: 'success' },
              rejected: { label: text.rejected, badge: 'muted' },
            }[status] || { label: bid.status, badge: 'neutral' };
            return (
              <article key={bid.id} className="dash-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)' }}>{bid.crop || 'Produce'} · {bid.quantity} {bid.unit || 'kg'}</h2>
                    <p style={{ color: 'var(--color-ink-soft)', fontSize: 'var(--font-size-sm)' }}>{text.buyer}: <strong>{bid.buyerName || text.buyer}</strong></p>
                  </div>
                  <span className={`status-badge status-badge--${info.badge}`}>{info.label}</span>
                </div>

                <div className="listing-card__meta" style={{ marginTop: 'var(--space-3)' }}>
                  <span>{text.askingPrice}: <strong>₹{bid.askingPrice}</strong> / {bid.unit || 'kg'}</span>
                  <span>{text.buyerOffer}: <strong>₹{bid.offerPrice}</strong> / {bid.unit || 'kg'}</span>
                  {status === 'countered' && bid.counterPrice != null && (
                    <span>{text.yourCounter}: <strong>₹{bid.counterPrice}</strong> / {bid.unit || 'kg'}</span>
                  )}
                  {status === 'accepted' && bid.agreedPrice != null && (
                    <span style={{ color: 'var(--color-primary-dark)', fontWeight: 600 }}>
                      {text.agreedPrice}: <strong>₹{bid.agreedPrice}</strong> / {bid.unit || 'kg'}
                    </span>
                  )}
                  <span>{text.totalValue}: <strong>₹{(Number(bid.quantity || 0) * Number(bid.agreedPrice || bid.offerPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center' }}>
                  {status === 'offered' && (
                    <>
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={savingId === bid.id}
                        onClick={() => handleAction(bid.id, 'ACCEPT')}
                      >
                        {savingId === bid.id ? 'Updating…' : text.acceptOffer}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        disabled={savingId === bid.id}
                        onClick={() => {
                          setCounterBidId(counterBidId === bid.id ? null : bid.id);
                          setCounterPrice(String(bid.askingPrice || ''));
                        }}
                      >
                        {text.counterOffer}
                      </button>
                      <button
                        type="button"
                        className="btn--text"
                        disabled={savingId === bid.id}
                        onClick={() => handleAction(bid.id, 'REJECT')}
                      >
                        {text.reject}
                      </button>
                    </>
                  )}
                  {status === 'accepted' && bid.dealId && (
                    <span style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Deal created ✓</span>
                  )}
                </div>

                {counterBidId === bid.id && status === 'offered' && (
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <div className="dash-field" style={{ flex: '1 1 180px' }}>
                      <label htmlFor={`counter-${bid.id}`}>{text.counterPrice.replace('{unit}', bid.unit || 'kg')}</label>
                      <input
                        id={`counter-${bid.id}`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={counterPrice}
                        onChange={(event) => setCounterPrice(event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={savingId === bid.id}
                      onClick={() => submitCounter(bid.id)}
                    >
                      {savingId === bid.id ? text.sendingCounter : text.sendCounter}
                    </button>
                  </div>
                )}

                <BidHistory bid={bid} />

                <p style={{ color: 'var(--color-ink-faint)', fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-3)' }}>
                  {text.received} {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString('en-IN') : '—'}
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
