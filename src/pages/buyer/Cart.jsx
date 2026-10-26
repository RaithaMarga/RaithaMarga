import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import MakeOfferModal from '../../components/dashboard/MakeOfferModal';
import { cartLineTotal, cartSubtotal, MAX_CHECKOUT_LINES } from '../../lib/cart';
import '../../components/dashboard/dashboard-ui.css';
import { IconBasket } from '../../components/dashboard/icons';

export default function BuyerCart() {
  const {
    cart,
    cartCount,
    cartReady,
    cartError,
    changeCartQuantity,
    removeFromCart,
    checkoutCart,
  } = useBuyerData();
  const [checkoutError, setCheckoutError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [offerListing, setOfferListing] = useState(null);
  const { t } = useLanguage();
  const text = t.trading;
  const copy = text.cart;

  const changeQuantity = (listingId, value) => {
    setCheckoutError('');
    try {
      changeCartQuantity(listingId, value);
    } catch (error) {
      setCheckoutError(error.message);
    }
  };

  const removeLine = (listingId) => {
    setCheckoutError('');
    try {
      removeFromCart(listingId);
    } catch (error) {
      setCheckoutError(error.message);
    }
  };

  const checkout = async () => {
    setCheckingOut(true);
    setCheckoutError('');
    setSuccess('');
    try {
      const deals = await checkoutCart();
      setSuccess(copy.checkoutSuccess.replace('{count}', String(deals.length)));
    } catch (error) {
      setCheckoutError(error.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (!cartReady && !cartError) {
    return <div className="dash-panel" role="status">{copy.loading}</div>;
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{copy.title}</h1>
          <p className="dash-page__subtitle">{cartCount} {copy.distinctListings} · {copy.cartItemsDoNotReserve}</p>
        </div>
        <Link className="btn btn--outline btn--sm" to="/buyer/dashboard/browse">{copy.continueBrowsing}</Link>
      </div>

      {cartError && <div className="dash-banner dash-banner--error" role="alert">{cartError}</div>}
      {checkoutError && <div className="dash-banner dash-banner--error" role="alert">{checkoutError}</div>}
      {success && <div className="dash-banner dash-banner--success" role="status">{success} <Link to="/buyer/dashboard/deals">{copy.viewDeals}</Link></div>}

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
          <div className="dash-panel cart-lines">
            {cart.map((item) => (
              <article className="cart-line" key={item.listingId}>
                <ListingImage listing={{ ...item, id: item.listingId }} />
                <div className="cart-line__details">
                  <h2>{item.crop}</h2>
                  <p>{copy.farmer}: <strong>{item.farmerName}</strong></p>
                  <p>{copy.price}: ₹{item.expectedPrice} / {item.unit}</p>
                  <p>{copy.availableWhenAdded}: {item.availableQuantity} {item.unit}</p>
                  {item.localOnly && <p className="cart-line__notice">{copy.localOnly}</p>}
                </div>
                <div className="cart-line__quantity">
                  <label htmlFor={`cart-quantity-${item.listingId}`}>{copy.quantity} ({item.unit})</label>
                  <input
                    id={`cart-quantity-${item.listingId}`}
                    type="number"
                    min="0.01"
                    max={item.availableQuantity}
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) => changeQuantity(item.listingId, event.target.value)}
                    aria-describedby={`cart-total-${item.listingId}`}
                  />
                  <strong id={`cart-total-${item.listingId}`}>{copy.lineTotal}: ₹{cartLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div className="cart-line__actions">
                  {!item.managed && !item.localOnly && (
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setOfferListing(item)}>
                      {text.makeOffer}
                    </button>
                  )}
                  <button type="button" className="btn--text" onClick={() => removeLine(item.listingId)}>
                    {copy.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <section className="dash-panel cart-summary" aria-label={copy.summaryLabel}>
            <div>
              <span>{copy.subtotal}</span>
              <strong>₹{cartSubtotal(cart).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <p>{copy.revalidation}</p>
            {cart.length > MAX_CHECKOUT_LINES && <p className="cart-line__notice">{copy.checkoutLimit.replace('{count}', String(MAX_CHECKOUT_LINES))}</p>}
            <button
              type="button"
              className="btn btn--primary"
              disabled={checkingOut || cartError || cart.some((item) => item.localOnly) || cart.length > MAX_CHECKOUT_LINES}
              onClick={checkout}
            >
              {checkingOut ? copy.checkingOut : copy.checkout}
            </button>
          </section>
        </>
      )}
      {offerListing && <MakeOfferModal listing={offerListing} onClose={() => setOfferListing(null)} />}
    </div>
  );
}
