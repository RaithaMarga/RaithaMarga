import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import MakeOfferModal from '../../components/dashboard/MakeOfferModal';
import { apiRequest } from '../../lib/api';
import { cartLineTotal } from '../../lib/cart';
import '../../components/dashboard/dashboard-ui.css';
import './Cart.css';
import { IconBasket } from '../../components/dashboard/icons';

const money = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BuyerCart() {
  const {
    cart,
    cartCount,
    cartReady,
    cartError,
    changeCartQuantity,
    removeFromCart,
  } = useBuyerData();
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [bids, setBids] = useState([]);
  const [offerListing, setOfferListing] = useState(null);
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const text = t.trading;
  const copy = text.cart;
  const tr = (en, kn) => (isKannada ? kn : en);

  // The buyer's negotiations decide what each cart line can do. One negotiation per listing.
  const loadBids = useCallback(() => apiRequest('/bids').then(setBids).catch(() => {}), []);
  useEffect(() => {
    let active = true;
    apiRequest('/bids').then((data) => { if (active) setBids(data); }).catch(() => {});
    return () => { active = false; };
  }, []);
  // Several old bids can exist for one listing; only the most recent one decides what the cart shows.
  const bidByListing = {};
  [...bids]
    .sort((a, b) => String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')))
    .forEach((bid) => { bidByListing[bid.listingId] = bid; });
  const statusOf = (item) => String(bidByListing[item.listingId]?.status || '').toLowerCase();
  // A rejected negotiation is closed: the buyer can edit the quantity and make a fresh offer.
  const isLocked = (item) => ['offered', 'countered', 'accepted'].includes(statusOf(item));

  const invalidQuantity = cart.some((item) => {
    if (isLocked(item)) return false; // quantity is locked while an offer is open or agreed
    const value = quantityDrafts[item.listingId] ?? item.quantity;
    const number = Number(value);
    return value === '' || !Number.isFinite(number) || number < 0.01 || number > Number(item.availableQuantity)
      || Math.abs(number * 100 - Math.round(number * 100)) > 0.000001;
  });

  const counts = cart.reduce((sum, item) => {
    const status = statusOf(item) || 'none';
    sum[status] = (sum[status] || 0) + 1;
    return sum;
  }, {});
  const agreedValue = cart.reduce((sum, item) => {
    const bid = bidByListing[item.listingId];
    return bid && String(bid.status).toLowerCase() === 'accepted'
      ? sum + Number(bid.quantity || 0) * Number(bid.agreedPrice || 0) : sum;
  }, 0);

  // While an offer is open or agreed, the line shows the negotiated quantity and price, not the cart's draft.
  const negotiated = (item) => {
    const bid = bidByListing[item.listingId];
    if (!bid || !isLocked(item)) return null;
    const status = statusOf(item);
    const price = status === 'accepted' ? bid.agreedPrice : status === 'countered' ? bid.counterPrice : bid.offerPrice;
    const label = status === 'accepted' ? tr('Final deal value', 'ಅಂತಿಮ ಒಪ್ಪಂದ ಮೌಲ್ಯ')
      : status === 'countered' ? tr("Value at farmer's counter", 'ರೈತರ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ ಮೌಲ್ಯ')
      : tr('Value at your offer', 'ನಿಮ್ಮ ಪ್ರಸ್ತಾವನೆ ಮೌಲ್ಯ');
    return { quantity: bid.quantity, total: Number(bid.quantity || 0) * Number(price || 0), label };
  };

  const changeQuantity = (listingId, value) => {
    setActionError('');
    try {
      changeCartQuantity(listingId, value);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const removeLine = (listingId) => {
    setActionError('');
    try {
      removeFromCart(listingId);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const badgeFor = (item) => {
    const bid = bidByListing[item.listingId];
    const status = statusOf(item);
    if (!bid) return null;
    if (status === 'offered') return { badge: 'gold', label: tr(`Offer sent: ₹${bid.offerPrice} / ${item.unit} · waiting for farmer`, `ಪ್ರಸ್ತಾವನೆ ಕಳುಹಿಸಲಾಗಿದೆ: ₹${bid.offerPrice} / ${item.unit} · ರೈತರ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ`) };
    if (status === 'countered') return { badge: 'primary', label: tr(`Farmer countered ₹${bid.counterPrice} / ${item.unit} · your reply needed`, `ರೈತರ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ ₹${bid.counterPrice} / ${item.unit} · ನಿಮ್ಮ ಉತ್ತರ ಬೇಕು`) };
    if (status === 'accepted') return { badge: 'success', label: tr(`Agreed at ₹${bid.agreedPrice} / ${item.unit} · deal created`, `₹${bid.agreedPrice} / ${item.unit} ಗೆ ಒಪ್ಪಂದ · ಒಪ್ಪಂದ ರಚಿಸಲಾಗಿದೆ`) };
    if (status === 'rejected') return { badge: 'muted', label: tr('Offer rejected · you can send a new offer', 'ಪ್ರಸ್ತಾವನೆ ತಿರಸ್ಕೃತ · ಹೊಸ ಪ್ರಸ್ತಾವನೆ ನೀಡಬಹುದು') };
    return null;
  };

  if (!cartReady && !cartError) {
    return <div className="dash-panel" role="status">{copy.loading}</div>;
  }

  return (
    <div className={`dash-page buyer-cart${cart.length ? " buyer-cart--has-items" : ""}`}>
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{copy.title}</h1>
          <p className="dash-page__subtitle">{cartCount} {copy.distinctListings} · {copy.cartItemsDoNotReserve}</p>
        </div>
        <Link className="cart-link-btn" to="/buyer/dashboard/browse">{copy.continueBrowsing}</Link>
      </div>

      {cartError && <div className="dash-banner dash-banner--error" role="alert">{cartError}</div>}
      {actionError && <div className="dash-banner dash-banner--error" role="alert">{actionError}</div>}
      {success && <div className="dash-banner dash-banner--success" role="status">{success} <Link to="/buyer/dashboard/bids">{tr('Open My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳು')}</Link></div>}

      {cart.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconBasket />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={<Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">{copy.browseProduce}</Link>}
          />
        </div>
      ) : (
        <>
          <div className="cart-layout">
          <div className="cart-lines" aria-label={copy.title}>
            <div className="cart-section-heading"><IconBasket /><h2>{copy.itemsTitle}</h2><span>{cartCount}</span></div>
            {cart.map((item) => {
              const lineStatus = badgeFor(item);
              const locked = isLocked(item);
              const deal = negotiated(item);
              return (
              <article className="dash-panel cart-line" key={item.listingId}>
                <div className="cart-line__image"><ListingImage listing={{ ...item, id: item.listingId }} /></div>
                <div className="cart-line__details">
                  <h2>{item.crop}</h2>
                  <p>{copy.farmer}: <strong>{item.farmerName}</strong></p>
                  <p>{copy.price}: ₹{item.expectedPrice} / {item.unit}</p>
                  <p>{copy.availableWhenAdded}: {item.availableQuantity} {item.unit}</p>
                  {lineStatus ? <span className={`status-badge status-badge--${lineStatus.badge}`}>{lineStatus.label}</span> : null}
                  {item.localOnly && <p className="cart-line__notice">{copy.localOnly}</p>}
                </div>
                <div className="cart-line__quantity">
                  <label htmlFor={`cart-quantity-${item.listingId}`}>{statusOf(item) === 'accepted' ? tr('Final quantity', 'ಅಂತಿಮ ಪ್ರಮಾಣ') : copy.quantity} ({item.unit})</label>
                  <input
                    id={`cart-quantity-${item.listingId}`}
                    type="number"
                    min="0.01"
                    max={item.availableQuantity}
                    step="0.01"
                    value={deal ? deal.quantity : (quantityDrafts[item.listingId] ?? item.quantity)}
                    inputMode="decimal"
                    disabled={locked}
                    onChange={(event) => {
                      const value = event.target.value;
                      setQuantityDrafts((previous) => ({ ...previous, [item.listingId]: value }));
                      if (value && event.target.validity.valid) changeQuantity(item.listingId, value);
                      else setActionError(copy.quantityError);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur();
                    }}
                    aria-describedby={`cart-total-${item.listingId}`}
                  />
                  <strong id={`cart-total-${item.listingId}`}>{deal ? deal.label : copy.lineTotal}: ₹{money(deal ? deal.total : cartLineTotal(item))}</strong>
                </div>
                <div className="cart-line__actions">
                  {!locked && !item.localOnly && (
                    <button
                      type="button"
                      className="cart-offer-btn"
                      disabled={invalidQuantity}
                      onClick={() => setOfferListing({ ...item, defaultQuantity: quantityDrafts[item.listingId] ?? item.quantity })}
                    >
                      <span aria-hidden="true">🏷️</span> {statusOf(item) === 'rejected' ? tr('Make a New Offer', 'ಹೊಸ ಪ್ರಸ್ತಾವನೆ ನೀಡಿ') : text.makeOffer}
                    </button>
                  )}
                  {locked && statusOf(item) !== 'accepted' && (
                    <Link className="cart-link-btn" to="/buyer/dashboard/bids">
                      {statusOf(item) === 'countered' ? tr('Reply in My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳಲ್ಲಿ ಉತ್ತರಿಸಿ') : tr('Track in My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳಲ್ಲಿ ನೋಡಿ')}
                    </Link>
                  )}
                  {statusOf(item) === 'accepted' && (
                    <Link className="cart-link-btn" to="/buyer/dashboard/deals">{copy.viewDeals}</Link>
                  )}
                  <button type="button" className="btn--text" aria-label={`${copy.remove} ${item.crop}`} onClick={() => removeLine(item.listingId)}>
                    {copy.remove}
                  </button>
                </div>
              </article>
              );
            })}
          </div>
          <section className="dash-panel cart-summary" aria-label={copy.summaryLabel}>
            <h2>{tr('Offer status', 'ಪ್ರಸ್ತಾವನೆ ಸ್ಥಿತಿ')}</h2>
            <p className="cart-summary__count">{cartCount} {copy.distinctListings}</p>
            <ul className="cart-summary__list">
              <li><span>{tr('Not offered yet', 'ಇನ್ನೂ ಪ್ರಸ್ತಾವನೆ ನೀಡಿಲ್ಲ')}</span><strong>{counts.none || 0}</strong></li>
              {counts.rejected > 0 && <li><span>{tr('Rejected (offer again)', 'ತಿರಸ್ಕೃತ (ಮತ್ತೆ ನೀಡಿ)')}</span><strong>{counts.rejected}</strong></li>}
              <li><span>{tr('Waiting for farmer', 'ರೈತರ ಉತ್ತರ ಬಾಕಿ')}</span><strong>{counts.offered || 0}</strong></li>
              <li><span>{tr('Needs your reply', 'ನಿಮ್ಮ ಉತ್ತರ ಬೇಕು')}</span><strong>{counts.countered || 0}</strong></li>
              <li><span>{tr('Agreed (deal created)', 'ಒಪ್ಪಂದವಾಗಿದೆ')}</span><strong>{counts.accepted || 0}</strong></li>
            </ul>
            {agreedValue > 0 && (
              <div>
                <span>{tr('Agreed value', 'ಒಪ್ಪಿದ ಮೌಲ್ಯ')}</span>
                <strong>₹{money(agreedValue)}</strong>
              </div>
            )}
            <p className="cart-summary__note">
              {tr('Nothing is bought from the cart. A deal is created automatically only when you and the farmer agree on the same price. Payment is not taken here.',
                'ಕಾರ್ಟ್‌ನಿಂದ ಏನೂ ಖರೀದಿಯಾಗುವುದಿಲ್ಲ. ನೀವು ಮತ್ತು ರೈತರು ಒಂದೇ ಬೆಲೆಗೆ ಒಪ್ಪಿದಾಗ ಮಾತ್ರ ಒಪ್ಪಂದ ತಾನಾಗಿ ರಚನೆಯಾಗುತ್ತದೆ. ಇಲ್ಲಿ ಪಾವತಿ ಇಲ್ಲ.')}
            </p>
            {cart.some((item) => item.localOnly) && <p className="cart-line__notice">{copy.localOnly}</p>}
            <div className="cart-checkout-actions">
              <Link className="btn btn--primary cart-checkout" to="/buyer/dashboard/bids">
                <IconBasket />
                <span>
                  {counts.countered
                    ? tr(`Reply to ${counts.countered} counter-offer(s)`, `${counts.countered} ಪ್ರತಿಪ್ರಸ್ತಾವನೆಗೆ ಉತ್ತರಿಸಿ`)
                    : tr('Go to My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳಿಗೆ ಹೋಗಿ')}
                </span>
              </Link>
            </div>
          </section>
          </div>
        </>
      )}
      {offerListing && (
        <MakeOfferModal
          listing={offerListing}
          onClose={() => { setOfferListing(null); loadBids(); }}
          onSuccess={(result) => {
            loadBids();
            setSuccess(tr(`Offer of ₹${result.offerPrice} sent. You can't change it now; wait for the farmer to accept or counter.`,
              `₹${result.offerPrice} ಪ್ರಸ್ತಾವನೆ ಕಳುಹಿಸಲಾಗಿದೆ. ಈಗ ಬದಲಿಸಲಾಗದು; ರೈತರ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಿರಿ.`));
          }}
        />
      )}
    </div>
  );
}
