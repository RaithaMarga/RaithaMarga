import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useLanguage } from '../../context/LanguageContext';
import './dashboard-ui.css';

export default function MakeOfferModal({ listing, onClose, onSuccess }) {
  const available = Number(listing.availableQuantity ?? listing.quantity);
  const askingPrice = Number(listing.expectedPrice ?? listing.price);
  const [quantity, setQuantity] = useState(String(Math.min(1, available)));
  const [offerPrice, setOfferPrice] = useState(String(askingPrice));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();
  const text = t.trading.offer;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const targetListingId = listing.id || listing.listingId;
    try {
      await apiRequest('/bids', {
        method: 'POST',
        body: JSON.stringify({
          listingId: targetListingId,
          quantity: Number(quantity),
          offerPrice: Number(offerPrice),
        }),
      });
      setSuccess(true);
      if (onSuccess) {
        onSuccess({ listingId: targetListingId, offerPrice: Number(offerPrice), quantity: Number(quantity) });
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="dash-panel offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-modal-title">
        <div className="dash-page__header">
          <div>
            <h2 id="offer-modal-title" className="dash-panel__heading">{text.title}</h2>
            <p className="dash-page__subtitle">{listing.crop} · {text.askingPrice} ₹{askingPrice} / {listing.unit}</p>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose} aria-label={text.close}>{text.close}</button>
        </div>
        {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}
        {success ? (
          <div className="dash-banner dash-banner--success" role="status">{text.sent}</div>
        ) : (
          <form onSubmit={submit} className="dash-form">
            <div className="dash-field">
              <label htmlFor="offer-quantity">{text.requestedQuantity} ({listing.unit})</label>
              <input id="offer-quantity" type="number" min="0.01" max={available} step="0.01" required
                value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              <small>{text.currentlyAvailable.replace('{quantity}', String(available)).replace('{unit}', listing.unit)}</small>
            </div>
            <div className="dash-field">
              <label htmlFor="offer-price">{text.yourOffer.replace('{unit}', listing.unit)}</label>
              <input id="offer-price" type="number" min="0.01" step="0.01" required
                value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} />
            </div>
            <p>{text.askingPrice}: ₹{askingPrice} / {listing.unit} · {text.offerPrice}: ₹{Number(offerPrice || 0)} / {listing.unit}</p>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? text.sending : text.submit}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
