import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import MakeOfferModal from '../../components/dashboard/MakeOfferModal';
import { cartLineTotal, cartSubtotal, MAX_CHECKOUT_LINES } from '../../lib/cart';
import '../../components/dashboard/dashboard-ui.css';
import './Cart.css';
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
  const reviewHeading = useRef(null);
  const [quantityDrafts, setQuantityDrafts] = useState({});
  const [reviewing, setReviewing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [offeredItems, setOfferedItems] = useState({});
  const [offerListing, setOfferListing] = useState(null);
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const text = t.trading;
  const copy = text.cart;

  const invalidQuantity = cart.some((item) => {
    const value = quantityDrafts[item.listingId] ?? item.quantity;
    const number = Number(value);
    return value === '' || !Number.isFinite(number) || number < 0.01 || number > Number(item.availableQuantity)
      || Math.abs(number * 100 - Math.round(number * 100)) > 0.000001;
  });
  const busy = checkingOut;
  const checkoutBlocked = busy || invalidQuantity || Boolean(cartError) || cart.some((item) => item.localOnly) || cart.length > MAX_CHECKOUT_LINES;
  const subtotal = cartSubtotal(cart).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    if (reviewing) reviewHeading.current?.focus();
  }, [reviewing]);

  const changeQuantity = (listingId, value) => {
    setCheckoutError('');
    setReviewing(false);
    try {
      changeCartQuantity(listingId, value);
    } catch (error) {
      setCheckoutError(error.message);
    }
  };

  const removeLine = (listingId) => {
    setCheckoutError('');
    setReviewing(false);
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
      setReviewing(false);
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
    <div className={`dash-page buyer-cart${cart.length ? " buyer-cart--has-items" : ""}`}>
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
          <div className="cart-layout">
          <div className="cart-lines" aria-label={copy.title}>
            <div className="cart-section-heading"><IconBasket /><h2 ref={reviewHeading} tabIndex={-1}>{reviewing ? copy.reviewTitle : copy.itemsTitle}</h2><span>{cartCount}</span></div>
            {cart.map((item) => (
              <article className="dash-panel cart-line" key={item.listingId}>
                <div className="cart-line__image"><ListingImage listing={{ ...item, id: item.listingId }} /></div>
                <div className="cart-line__details">
                  <h2>{item.crop}</h2>
                  <p>{copy.farmer}: <strong>{item.farmerName}</strong></p>
                  <p>{copy.price}: ₹{item.expectedPrice} / {item.unit}</p>
                  <p>{copy.availableWhenAdded}: {item.availableQuantity} {item.unit}</p>
                  {offeredItems[item.listingId] ? (
                    <span className="cart-line__offer-badge">
                      🏷️ {isKannada ? 'ಪ್ರಸ್ತಾವನೆ ಕಳುಹಿಸಲಾಗಿದೆ:' : 'Offer sent:'} ₹{offeredItems[item.listingId].offerPrice} / {item.unit}
                    </span>
                  ) : null}
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
                    value={quantityDrafts[item.listingId] ?? item.quantity}
                    inputMode="decimal"
                    disabled={busy || reviewing}
                    onChange={(event) => {
                      const value = event.target.value;
                      setQuantityDrafts((previous) => ({ ...previous, [item.listingId]: value }));
                      if (value && event.target.validity.valid) changeQuantity(item.listingId, value);
                      else setCheckoutError(copy.quantityError);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur();
                    }}
                    aria-describedby={`cart-total-${item.listingId}`}
                  />
                  <strong id={`cart-total-${item.listingId}`}>{copy.lineTotal}: ₹{cartLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
                <div className="cart-line__actions" hidden={reviewing}>
                  {!item.managed && !item.localOnly && (
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      disabled={busy || invalidQuantity}
                      onClick={() => setOfferListing(item)}
                    >
                      {text.makeOffer}
                    </button>
                  )}
                  <button type="button" className="btn--text" disabled={busy} aria-label={`${copy.remove} ${item.crop}`} onClick={() => removeLine(item.listingId)}>
                    {copy.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <section className="dash-panel cart-summary" aria-label={copy.summaryLabel}>
            <h2>{copy.summaryLabel}</h2>
            <p className="cart-summary__count">{cartCount} {copy.distinctListings}</p>
            <div>
              <span>{copy.subtotal}</span>
              <strong>₹{subtotal}</strong>
            </div>
            <p className="cart-summary__note">{copy.revalidation}</p>
            {reviewing && <p className="cart-summary__review" role="status">{copy.reviewDescription}</p>}
            {cart.some((item) => item.localOnly) && <p className="cart-line__notice">{copy.localOnly}</p>}
            {cart.length > MAX_CHECKOUT_LINES && <p className="cart-line__notice">{copy.checkoutLimit.replace('{count}', String(MAX_CHECKOUT_LINES))}</p>}
            <div className="cart-checkout-actions">
              <div className="cart-mobile-total"><span>{copy.subtotal}<small>{copy.noPaymentNow}</small></span><strong>₹{subtotal}</strong></div>
            <button
              type="button"
              className="btn btn--primary cart-checkout"
              disabled={checkoutBlocked}
              onClick={() => {
                if (reviewing) checkout();
                else { setReviewing(true); setCheckoutError(''); }
              }}
            >
              <IconBasket />
              <span>{checkingOut ? copy.checkingOut : reviewing ? copy.confirmCheckout : copy.proceedToCheckout}</span>
            </button>
              {checkoutBlocked && !busy && <span className="cart-checkout-hint">{copy.checkCart}</span>}
            </div>
            {reviewing && <button type="button" className="btn btn--outline cart-edit" disabled={busy} onClick={() => setReviewing(false)}>{copy.editCart}</button>}
          </section>
          </div>
        </>
      )}
      {offerListing && (
        <MakeOfferModal
          listing={offerListing}
          onClose={() => setOfferListing(null)}
          onSuccess={(result) => {
            setOfferedItems((prev) => ({ ...prev, [result.listingId]: result }));
            setSuccess(
              isKannada
                ? `₹${result.offerPrice} ಬೆಲೆ ಪ್ರಸ್ತಾವನೆಯನ್ನು ರೈತರಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ! ಇದನ್ನು 'ನನ್ನ ಪ್ರಸ್ತಾವನೆಗಳು' ಪುಟದಲ್ಲಿ ಗಮನಿಸಬಹುದು.`
                : `Offer of ₹${result.offerPrice} sent to farmer! You can track this in My Bids.`
            );
          }}
        />
      )}
    </div>
  );
}
