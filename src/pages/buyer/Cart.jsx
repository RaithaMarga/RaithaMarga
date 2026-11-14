import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import MakeOfferModal from '../../components/dashboard/MakeOfferModal';
import { apiRequest } from '../../lib/api';
import QuantityInput from '../../components/QuantityInput';
import CartSummary from '../../components/CartSummary';
import { cartLineTotal } from '../../lib/cart';
import '../../components/dashboard/dashboard-ui.css';
import './Cart.css';
import { IconBasket } from '../../components/dashboard/icons';

const money = (value) => Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BuyerCart() {
  const {
    cart,
    requests,
    dataLoading,
    acceptCartPrice,
    resolveCartListings,
    cartCount,
    cartReady,
    cartError,
    changeCartQuantity,
    removeFromCart,
  } = useBuyerData();
  const [creatingDeal, setCreatingDeal] = useState(null);
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
  useEffect(() => {
    if (!dataLoading && cart.some((item) => item.pendingAvailability)) {
      try { resolveCartListings(); } catch { /* Keep the saved selection visible on storage failure. */ }
    }
  }, [cart, dataLoading, resolveCartListings]);
  // Several old bids can exist for one listing; only the most recent one decides what the cart shows.
  const bidByListing = {};
  [...bids]
    .sort((a, b) => String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || '')))
    .forEach((bid) => { bidByListing[bid.listingId] = bid; });
  const statusOf = (item) => String(bidByListing[item.listingId]?.status || '').toLowerCase();
  // A rejected negotiation is closed: the buyer can edit the quantity and make a fresh offer.
  const existingDeal = (item) => {
    if (!item.deal?.id) return null;
    const deal = requests.find((entry) => entry.id === item.deal.id) || item.deal;
    return ['cancelled', 'rejected', 'failed'].includes(deal.status) ? null : deal;
  };
  const isLocked = (item) => Boolean(existingDeal(item)) || ['offered', 'countered', 'accepted'].includes(statusOf(item));

  const invalidQuantity = cart.some((item) => Number(item.quantity) < 1 || Number(item.quantity) > Number(item.availableQuantity));

  // While an offer is open or agreed, the line shows the negotiated quantity and price, not the cart's draft.
  const negotiated = (item) => {
    const bid = bidByListing[item.listingId];
    const created = existingDeal(item);
    if (created) return { quantity: created.quantity, total: Number(created.quantity) * Number(created.agreedPrice), label: tr('Final deal value', 'ಅಂತಿಮ ಒಪ್ಪಂದ ಮೌಲ್ಯ') };
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
    if (existingDeal(item)) return { badge: 'success', label: tr(`Agreed at ₹${existingDeal(item).agreedPrice} / ${item.unit} · deal created`, `₹${existingDeal(item).agreedPrice} / ${item.unit} ಗೆ ಒಪ್ಪಂದ · ಒಪ್ಪಂದ ರಚಿಸಲಾಗಿದೆ`) };
    if (!bid) return null;
    if (status === 'offered') return { badge: 'gold', label: tr(`Offer sent: ₹${bid.offerPrice} / ${item.unit} · waiting for farmer`, `ಪ್ರಸ್ತಾವನೆ ಕಳುಹಿಸಲಾಗಿದೆ: ₹${bid.offerPrice} / ${item.unit} · ರೈತರ ಉತ್ತರಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ`) };
    if (status === 'countered') return { badge: 'primary', label: tr(`Farmer countered ₹${bid.counterPrice} / ${item.unit} · your reply needed`, `ರೈತರ ಪ್ರತಿಪ್ರಸ್ತಾವನೆ ₹${bid.counterPrice} / ${item.unit} · ನಿಮ್ಮ ಉತ್ತರ ಬೇಕು`) };
    if (status === 'accepted') return { badge: 'success', label: tr(`Agreed at ₹${bid.agreedPrice} / ${item.unit} · deal created`, `₹${bid.agreedPrice} / ${item.unit} ಗೆ ಒಪ್ಪಂದ · ಒಪ್ಪಂದ ರಚಿಸಲಾಗಿದೆ`) };
    if (status === 'rejected') return { badge: 'muted', label: tr('Offer rejected · you can send a new offer', 'ಪ್ರಸ್ತಾವನೆ ತಿರಸ್ಕೃತ · ಹೊಸ ಪ್ರಸ್ತಾವನೆ ನೀಡಬಹುದು') };
    return null;
  };

  const summaryItems = cart.map((item) => {
    const deal = existingDeal(item);
    const bid = bidByListing[item.listingId];
    return deal ? { ...item, quantity: deal.quantity, expectedPrice: deal.agreedPrice }
      : statusOf(item) === 'accepted' ? { ...item, quantity: bid.quantity, expectedPrice: bid.agreedPrice } : item;
  });
  const subtotalAmount = summaryItems.reduce((total, item) => total + cartLineTotal(item), 0);

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
<span>{cartCount} {copy.distinctListings} · {copy.cartItemsDoNotReserve}</span>
              </div>
              <span className="amazon-cart-header__price-col">{tr('Price', 'ಬೆಲೆ')}</span>
            </div>

            <div className="amazon-cart-items">
              {cart.map((item) => {
                const lineStatus = badgeFor(item);
                const locked = isLocked(item);
                const deal = negotiated(item);
                const qtyVal = Number(deal ? deal.quantity : (item.quantity));
                const linePrice = deal ? deal.total : cartLineTotal(item);

                return (
                  <article className="amazon-cart-item" key={item.listingId}>
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

                      {lineStatus && (
                        <div className="amazon-cart-item__status-pill">
                          <span className={`status-badge status-badge--${lineStatus.badge}`}>{lineStatus.label}</span>
                        </div>
                      )}

                      {/* Amazon Yellow Stepper & Action Links */}
                      <div className="amazon-cart-item__action-row">
                        <QuantityInput value={qtyVal} max={item.availableQuantity} unit={item.unit} label={`${item.crop} quantity`} disabled={locked || creatingDeal === item.listingId} onChange={(value) => changeQuantity(item.listingId, value)} />

                        <span className="amazon-action-sep">|</span>
                        <button
                          type="button"
                          className="amazon-text-action"
                          onClick={() => removeLine(item.listingId)}
                        >
                          {tr('Delete', 'ತೆಗೆದುಹಾಕಿ')}
                        </button>

                        {!locked && !item.localOnly && !item.pendingAvailability && (
                          <button type="button" className="shopping-primary cart-accept-price" disabled={invalidQuantity || creatingDeal !== null} onClick={async () => {
                            setCreatingDeal(item.listingId); setActionError('');
                            try { await acceptCartPrice(item); setSuccess(tr('Price accepted · deal created. View Deals or Track in My Bids.', 'ಬೆಲೆ ಸ್ವೀಕರಿಸಲಾಗಿದೆ · ಒಪ್ಪಂದ ರಚಿಸಲಾಗಿದೆ.')); loadBids(); }
                            catch (error) { setActionError(error.message); }
                            finally { setCreatingDeal(null); }
                          }}>{creatingDeal === item.listingId ? tr('Creating deal…', 'ಒಪ್ಪಂದ ರಚಿಸಲಾಗುತ್ತಿದೆ…') : '✅ ' + tr('Accept Price & Create Deal', 'ಬೆಲೆ ಸ್ವೀಕರಿಸಿ ಮತ್ತು ಒಪ್ಪಂದ ರಚಿಸಿ')}</button>
                        )}
                        {item.pendingAvailability && <p role="status">{tr('Your selection is saved. Matching stock at this price is not currently available. Browse current farmer listings before creating a deal.', 'ನಿಮ್ಮ ಆಯ್ಕೆ ಉಳಿಸಲಾಗಿದೆ. ಈ ಬೆಲೆಯಲ್ಲಿ ಪ್ರಸ್ತುತ ಲಭ್ಯತೆ ಪರಿಶೀಲಿಸಿ.')} <Link to="/buyer/dashboard/browse">{tr('Browse Produce', 'ಬೆಳೆಗಳನ್ನು ನೋಡಿ')}</Link></p>}
                        {!locked && !item.localOnly && !item.pendingAvailability && (
                          <>
                            <span className="amazon-action-sep">|</span>
                            <button
                              type="button"
                              className="amazon-text-action amazon-text-action--offer"
                              onClick={() => setOfferListing({ ...item, defaultQuantity: qtyVal })}
                            >
                              💬 {statusOf(item) === 'rejected' ? tr('Make New Offer', 'ಹೊಸ ಪ್ರಸ್ತಾವನೆ') : text.makeOffer}
                            </button>
                          </>
                        )}

                        {(statusOf(item) === 'accepted' || existingDeal(item)) && <Link className="amazon-text-action" to="/buyer/dashboard/deals">{copy.viewDeals}</Link>}
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
                      <span className="amazon-cart-item__final-price">
                        ₹{money(linePrice)}
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
              <h2>{tr('Cart Summary', 'ಕಾರ್ಟ್ ಸಾರಾಂಶ')}</h2>
              <CartSummary items={summaryItems} />
              {/* Iconic Amazon Yellow Proceed to Buy Button */}
              <Link
                to="/buyer/dashboard/bids"
                className="amazon-btn-proceed"
              >
                {tr('Track in My Bids', 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳಲ್ಲಿ ನೋಡಿ')}
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
