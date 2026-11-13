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
  const isLocked = (item) => ['offered', 'countered', 'accepted'].includes(statusOf(item));

  const invalidQuantity = cart.some((item) => {
    if (isLocked(item)) return false;
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

  const subtotalAmount = cart.reduce((sum, item) => {
    const bid = bidByListing[item.listingId];
    if (bid && String(bid.status).toLowerCase() === 'accepted') {
      return sum + Number(bid.quantity || 0) * Number(bid.agreedPrice || 0);
    }
    return sum + cartLineTotal(item);
  }, 0);

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
    return <div className="dash-panel amazon-cart-panel" role="status">{copy.loading}</div>;
  }

  return (
    <div className={`dash-page amazon-cart-page${cart.length ? " amazon-cart-page--has-items" : ""}`}>
      {cartError && <div className="dash-banner dash-banner--error" role="alert">{cartError}</div>}
      {actionError && <div className="dash-banner dash-banner--error" role="alert">{actionError}</div>}
      {success && <div className="dash-banner dash-banner--success" role="status">{success} <Link to="/buyer/dashboard/bids">{tr('Open My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳು')}</Link></div>}

      {cart.length === 0 ? (
        <div className="dash-panel amazon-empty-cart">
          <EmptyState
            icon={<IconBasket />}
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            action={<Link to="/buyer/dashboard/browse" className="amazon-btn-proceed amazon-btn-proceed--center">{copy.browseProduce}</Link>}
          />
        </div>
      ) : (
        <div className="amazon-cart-layout">
          {/* Main Left: Amazon Shopping Cart Container */}
          <section className="amazon-cart-main" aria-label="Shopping Cart">
            <div className="amazon-cart-header">
              <div className="amazon-cart-header__left">
                <h1 className="amazon-cart-title">{tr('Shopping Cart', 'ಶಾಪಿಂಗ್ ಕಾರ್ಟ್')}</h1>
                <span className="amazon-cart-deselect">{tr('Deselect all items', 'ಎಲ್ಲಾ ವಸ್ತುಗಳನ್ನು ಆಯ್ಕೆ ರದ್ದುಮಾಡಿ')}</span>
              </div>
              <span className="amazon-cart-header__price-col">{tr('Price', 'ಬೆಲೆ')}</span>
            </div>

            <div className="amazon-cart-items">
              {cart.map((item) => {
                const lineStatus = badgeFor(item);
                const locked = isLocked(item);
                const deal = negotiated(item);
                const qtyVal = Number(deal ? deal.quantity : (quantityDrafts[item.listingId] ?? item.quantity));
                const linePrice = deal ? deal.total : cartLineTotal(item);

                return (
                  <article className="amazon-cart-item" key={item.listingId}>
                    {/* Checkbox */}
                    <div className="amazon-cart-item__check">
                      <input type="checkbox" defaultChecked aria-label={`Select ${item.crop}`} />
                    </div>

                    {/* Image */}
                    <div className="amazon-cart-item__image-pod">
                      <ListingImage listing={{ ...item, id: item.listingId }} />
                    </div>

                    {/* Details Column */}
                    <div className="amazon-cart-item__details">
                      <h2 className="amazon-cart-item__title">
                        {item.crop} {item.grade ? `(${item.grade} Grade)` : ''} – {tr('Fresh Farm Direct', 'ಹೊಲದಿಂದ ತಾಜಾ ನೇರ')}
                      </h2>

                      <p className="amazon-cart-item__farmer">
                        {tr('Sold by:', 'ರೈತರು:')} <strong>{item.farmerName}</strong>
                      </p>

                      <div className="amazon-cart-item__stock-status">
                        <span className="amazon-stock-green">{tr('In stock', 'ಮಾರಾಟಕ್ಕೆ ಲಭ್ಯವಿದೆ')}</span>
                      </div>

                      <div className="amazon-cart-item__delivery-line">
                        <span className="amazon-delivery-truck">🚚</span>
                        <span>
                          <strong>{tr('FREE & Km-Shared Delivery', 'ಉಚಿತ / ಕಿಮೀ ಹಂಚಿಕೆಯ ವಿತರಣೆ')}</strong> {tr('by RaithaMarga Fleet as soon as Tomorrow', 'ರೈತಮಾರ್ಗ ತಂಡದ ಮೂಲಕ ನಾಳೆಯೇ')}
                        </span>
                      </div>

                      {/* Amazon-style Fulfilled Badge */}
                      <div className="amazon-fulfilled-badge">
                        <span className="amazon-fulfilled-a">RaithaMarga</span>
                        <span className="amazon-fulfilled-check">✓ Fulfilled</span>
                      </div>

                      {lineStatus && (
                        <div className="amazon-cart-item__status-pill">
                          <span className={`status-badge status-badge--${lineStatus.badge}`}>{lineStatus.label}</span>
                        </div>
                      )}

                      {/* Amazon Yellow Stepper & Action Links */}
                      <div className="amazon-cart-item__action-row">
                        <div className="amazon-qty-pill">
                          <button
                            type="button"
                            className="amazon-qty-btn"
                            disabled={locked}
                            onClick={() => {
                              if (qtyVal <= 1) {
                                removeLine(item.listingId);
                              } else {
                                changeQuantity(item.listingId, Math.max(0.01, qtyVal - 1));
                              }
                            }}
                            aria-label={qtyVal <= 1 ? 'Delete item' : 'Decrease quantity'}
                          >
                            {qtyVal <= 1 ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            ) : '−'}
                          </button>
                          <span className="amazon-qty-display">
                            {qtyVal} <small>{item.unit}</small>
                          </span>
                          <button
                            type="button"
                            className="amazon-qty-btn"
                            disabled={locked || qtyVal >= Number(item.availableQuantity)}
                            onClick={() => changeQuantity(item.listingId, qtyVal + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className="amazon-action-sep">|</span>
                        <button
                          type="button"
                          className="amazon-text-action"
                          onClick={() => removeLine(item.listingId)}
                        >
                          {tr('Delete', 'ತೆಗೆದುಹಾಕಿ')}
                        </button>

                        {!locked && !item.localOnly && (
                          <>
                            <span className="amazon-action-sep">|</span>
                            <button
                              type="button"
                              className="amazon-text-action amazon-text-action--offer"
                              onClick={() => setOfferListing({ ...item, defaultQuantity: qtyVal })}
                            >
                              🏷️ {statusOf(item) === 'rejected' ? tr('Make New Offer', 'ಹೊಸ ಪ್ರಸ್ತಾವನೆ') : text.makeOffer}
                            </button>
                          </>
                        )}

                        {locked && (
                          <>
                            <span className="amazon-action-sep">|</span>
                            <Link className="amazon-text-action" to="/buyer/dashboard/bids">
                              {tr('Track in My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳಲ್ಲಿ ನೋಡಿ')}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="amazon-cart-item__price-box">
                      <span className="amazon-cart-item__discount">-12%</span>
                      <span className="amazon-cart-item__final-price">
                        ₹{money(linePrice)}
                      </span>
                      <span className="amazon-cart-item__mrp">
                        {tr('M.R.P.:', 'ಮಾರುಕಟ್ಟೆ:')} <del>₹{money(Number(linePrice) * 1.14)}</del>
                      </span>
                      <span className="amazon-cart-item__unit-rate">
                        ₹{item.expectedPrice} / {item.unit}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom Subtotal */}
            <div className="amazon-cart-bottom-subtotal">
              <span>
                {tr('Subtotal', 'ಒಟ್ಟು ಮೊತ್ತ')} ({cartCount} {cartCount === 1 ? tr('item', 'ವಸ್ತು') : tr('items', 'ವಸ್ತುಗಳು')}):{' '}
                <strong>₹{money(subtotalAmount)}</strong>
              </span>
            </div>
          </section>

          {/* Right Sidebar: Amazon Order Summary */}
          <aside className="amazon-cart-sidebar">
            <div className="amazon-cart-summary-box">
              <div className="amazon-sidebar-subtotal">
                <span>
                  {tr('Subtotal', 'ಉಪ ಒಟ್ಟು')} ({cartCount} {cartCount === 1 ? tr('item', 'ವಸ್ತು') : tr('items', 'ವಸ್ತುಗಳು')}):{' '}
                  <strong className="amazon-sidebar-amount">₹{money(subtotalAmount)}</strong>
                </span>
              </div>

              <label className="amazon-gift-check">
                <input type="checkbox" defaultChecked />
                <span>{tr('This order includes verified electronic weighment slips', 'ಈ ಆರ್ಡರ್ ಡಿಜಿಟಲ್ ತೂಕ ಪ್ರಮಾಣಪತ್ರವನ್ನು ಒಳಗೊಂಡಿದೆ')}</span>
              </label>

              {/* Iconic Amazon Yellow Proceed to Buy Button */}
              <Link
                to="/buyer/dashboard/bids"
                className="amazon-btn-proceed"
              >
                {tr('Proceed to Buy', 'ಖರೀದಿಸಲು ಮುಂದುವರಿಯಿರಿ')}
              </Link>

              {/* Accordion / Trust Feature Details */}
              <div className="amazon-delivery-card">
                <div className="amazon-delivery-card__title">
                  <span>🚚 {tr('Km-Based Delivery Available', 'ಕಿಮೀ ಆಧಾರಿತ ಸಾರಿಗೆ ಲಭ್ಯವಿದೆ')}</span>
                </div>
                <p className="amazon-delivery-card__text">
                  {tr(
                    'Pickup & delivery charges shared proportionally by actual road distance (kms). No excess vehicle rental.',
                    'ರೈತರಿಂದ ಪಿಕಪ್ & ನಿಮ್ಮ ಗೋದಾಮಿಗೆ ವಿತರಣೆ ಶುಲ್ಕವನ್ನು ಕಿ.ಮೀ. ಆಧಾರದಲ್ಲಿ ನ್ಯಾಯಯುತವಾಗಿ ಹಂಚಲಾಗುತ್ತದೆ.'
                  )}
                </p>
                <div className="amazon-delivery-card__badge">
                  <span>🛡️ {tr('100% Team Managed Escrow & Zero Calls', 'ರೈತಮಾರ್ಗ ತಂಡದ ಸಂಪೂರ್ಣ ನಿರ್ವಹಣೆ')}</span>
                </div>
              </div>
            </div>

            {/* Recommendations Teaser Card */}
            <div className="amazon-recom-box">
              <h3>{tr('Verified Karnataka Mandi Guarantee', 'ಕರ್ನಾಟಕ ಮಂಡಿ ಗುಣಮಟ್ಟ ಖಾತರಿ')}</h3>
              <p>{tr('Every produce batch is digitally weighed and verified before dispatch.', 'ಪ್ರತಿಯೊಂದು ಬೆಳೆಯನ್ನು ರವಾನಿಸುವ ಮುನ್ನ ಡಿಜಿಟಲ್ ತೂಕದಿಂದ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.')}</p>
              <Link to="/crops" className="amazon-link-small">{tr('Browse more crops →', 'ಇನ್ನಷ್ಟು ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ →')}</Link>
            </div>
          </aside>
        </div>
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
