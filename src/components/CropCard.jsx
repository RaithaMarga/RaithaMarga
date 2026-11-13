import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CropImage from './CropImage';
import { getCropAvailability } from '../lib/marketplace';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import { readBuyerCart, writeBuyerCart, addCartLine, updateCartLineQuantity, removeCartLine } from '../lib/cart';

const formatQty = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 });

const CropCard = ({ crop, copy, listings }) => {
  const { language } = useLanguage();
  const isKannada = language === 'kn';
  const { user } = useAuth();
  const availability = getCropAvailability(crop.name, listings);
  const isVegetable = crop.category === 'Vegetable';
  const cropTitle = copy?.names?.[crop.id] ?? crop.name;

  const hasStock = availability && availability.totalQuantity > 0;
  const isSoldOut = availability && availability.isSoldOut;

  // Final price: either computed average across all farmers, or single farmer price, or benchmark
  const displayPrice = availability?.averagePrice ?? availability?.minPrice;
  const unit = availability?.unit || 'kg';

  // Live cart quantity for this crop
  const [cartQty, setCartQty] = useState(0);

  useEffect(() => {
    const syncQty = () => {
      try {
        const uid = user?.uid || 'guest';
        const items = readBuyerCart(uid);
        const cleanCropName = String(crop.name).toLowerCase().replace(/[\s_]+/g, ' ');
        const match = items.find((item) => {
          const itemCrop = String(item.crop || '').toLowerCase().replace(/[\s_]+/g, ' ');
          return itemCrop === cleanCropName || itemCrop.includes(cleanCropName) || item.listingId === `produce-${crop.id}`;
        });
        setCartQty(match ? Number(match.quantity) : 0);
      } catch {
        setCartQty(0);
      }
    };

    syncQty();
    window.addEventListener('storage', syncQty);
    window.addEventListener('raithamarga-cart-changed', syncQty);
    return () => {
      window.removeEventListener('storage', syncQty);
      window.removeEventListener('raithamarga-cart-changed', syncQty);
    };
  }, [user?.uid, crop.name, crop.id]);

  const handleAddToCart = () => {
    try {
      const uid = user?.uid || 'guest';
      const cleanTarget = String(crop.name).toLowerCase().replace(/[\s_]+/g, ' ');
      const matchingListing = listings?.find((l) => {
        if (l.status && l.status !== 'active') return false;
        const lCrop = String(l.crop || '').toLowerCase().replace(/[\s_]+/g, ' ');
        return lCrop === cleanTarget || lCrop.replace(/-/g, ' ') === cleanTarget.replace(/-/g, ' ');
      });

      const listingToAdd = matchingListing || {
        id: `produce-${crop.id}`,
        crop: crop.name,
        farmerName: availability?.farmerCount ? `${availability.farmerCount} Farmers` : 'Karnataka Farmers',
        unit,
        quantity: Math.min(1, availability?.totalQuantity || 100),
        availableQuantity: availability?.totalQuantity || 100,
        expectedPrice: Number(displayPrice || availability?.benchmarkPrice || 25),
        managed: true,
        localOnly: false,
      };

      const currentItems = readBuyerCart(uid);
      const updatedItems = addCartLine(currentItems, listingToAdd);
      writeBuyerCart(uid, updatedItems);
      setCartQty(1);
      window.dispatchEvent(new Event('raithamarga-cart-changed'));
    } catch (err) {
      console.warn('Could not add to cart:', err);
    }
  };

  const handleIncrement = () => {
    try {
      const uid = user?.uid || 'guest';
      const currentItems = readBuyerCart(uid);
      const cleanCropName = String(crop.name).toLowerCase().replace(/[\s_]+/g, ' ');
      const match = currentItems.find((item) => {
        const itemCrop = String(item.crop || '').toLowerCase().replace(/[\s_]+/g, ' ');
        return itemCrop === cleanCropName || item.listingId === `produce-${crop.id}`;
      });
      if (match) {
        const nextQty = Number(match.quantity) + 1;
        const updated = updateCartLineQuantity(currentItems, match.listingId, nextQty);
        writeBuyerCart(uid, updated);
        setCartQty(nextQty);
        window.dispatchEvent(new Event('raithamarga-cart-changed'));
      }
    } catch (err) {
      console.warn('Could not increment:', err);
    }
  };

  const handleDecrement = () => {
    try {
      const uid = user?.uid || 'guest';
      const currentItems = readBuyerCart(uid);
      const cleanCropName = String(crop.name).toLowerCase().replace(/[\s_]+/g, ' ');
      const match = currentItems.find((item) => {
        const itemCrop = String(item.crop || '').toLowerCase().replace(/[\s_]+/g, ' ');
        return itemCrop === cleanCropName || item.listingId === `produce-${crop.id}`;
      });
      if (match) {
        if (Number(match.quantity) <= 1) {
          const updated = removeCartLine(currentItems, match.listingId);
          writeBuyerCart(uid, updated);
          setCartQty(0);
        } else {
          const nextQty = Number(match.quantity) - 1;
          const updated = updateCartLineQuantity(currentItems, match.listingId, nextQty);
          writeBuyerCart(uid, updated);
          setCartQty(nextQty);
        }
        window.dispatchEvent(new Event('raithamarga-cart-changed'));
      }
    } catch (err) {
      console.warn('Could not decrement:', err);
    }
  };

  return (
    <article className={`crop-card ${isSoldOut ? 'crop-card--soldout' : ''}`} key={crop.id}>
      <div className="crop-card__image-wrap">
        <div className="crop-card__image">
          <CropImage crop={crop} />
        </div>

        {/* Floating Category Pill */}
        <span className="crop-card__category-badge">
          {isVegetable ? '🥕' : '🍎'} {isVegetable ? (copy?.vegetable || 'ತರಕಾರಿ') : (copy?.fruit || 'ಹಣ್ಣು')}
        </span>

        {/* Floating Availability Tag with Live Pulse */}
        {hasStock ? (
          <span className="crop-card__status-tag crop-card__status-tag--active">
            <span className="crop-card__pulse-dot" aria-hidden="true" />
            <span>{isKannada ? 'ಲಭ್ಯವಿದೆ' : 'In Stock'}</span>
          </span>
        ) : isSoldOut ? (
          <span className="crop-card__status-tag crop-card__status-tag--soldout">
            <span className="crop-card__soldout-dot" aria-hidden="true" />
            <span>{isKannada ? 'ಮಾರಾಟವಾಗಿದೆ' : 'Sold Out'}</span>
          </span>
        ) : (
          <span className="crop-card__status-tag crop-card__status-tag--open">
            <span>🌱 {isKannada ? 'ಮುಕ್ತ ಪಟ್ಟಿ' : 'Open to List'}</span>
          </span>
        )}

        {/* Quality and Weight Seal */}
        <div className="crop-card__seal-tag">
          <span>{isKannada ? '🛡️ 100% ತೂಕ ಖಾತರಿ' : '🛡️ Verified Weight'}</span>
        </div>
      </div>

      <div className="crop-card__body">
        <div className="crop-card__header-row">
          <h3 className="crop-card__title">{cropTitle}</h3>
          <span className="crop-card__commission-badge">
            {isKannada ? '0% ಕಮಿಷನ್' : '0% Commission'}
          </span>
        </div>

        {/* Info & Price Pod */}
        <div className="crop-card__info-pod">
          {hasStock ? (
            <>
              <div className="crop-card__stock-row">
                <span className="crop-card__stock-tag">
                  📦 <strong>{formatQty(availability.totalQuantity)}</strong> {unit} {isKannada ? 'ಲಭ್ಯ' : 'available'}
                </span>
                <span className="crop-card__price-display">
                  <span className="crop-card__price-symbol">₹</span>
                  <span className="crop-card__price-value">{displayPrice}</span>
                  <span className="crop-card__price-unit">/{unit}</span>
                </span>
              </div>

              {/* Average Price Explanation */}
              <div className="crop-card__price-breakdown">
                {availability.hasPriceRange ? (
                  <span className="crop-card__avg-note" title={isKannada ? 'ವಿವಿಧ ರೈತರ ಬೆಲೆಗಳ ಸರಾಸರಿ' : 'Average of different farmer prices'}>
                    <span className="crop-card__avg-icon">📊</span>
                    <span>
                      {isKannada
                        ? `ಸರಾಸರಿ ಬೆಲೆ (${availability.farmerCount} ರೈತರಿಂದ: ₹${availability.minPrice} - ₹${availability.maxPrice})`
                        : `Avg Price (${availability.farmerCount} farmers: ₹${availability.minPrice} - ₹${availability.maxPrice})`}
                    </span>
                  </span>
                ) : (
                  <span className="crop-card__avg-note crop-card__avg-note--direct">
                    <span>✨ {isKannada ? 'ನೇರ ರೈತ ಬೆಲೆ · ಕಮಿಷನ್ ರಹಿತ' : 'Direct farmer price · No middleman'}</span>
                  </span>
                )}
              </div>
            </>
          ) : isSoldOut ? (
            <div className="crop-card__soldout-view">
              <div className="crop-card__soldout-headline">
                <span className="crop-card__soldout-alert">🔴 {isKannada ? 'ಈಗ ಲಭ್ಯವಿಲ್ಲ' : 'Currently Out of Stock'}</span>
                {displayPrice && (
                  <span className="crop-card__prev-price">
                    {isKannada ? 'ಹಿಂದಿನ ಸರಾಸರಿ:' : 'Last avg:'} ₹{displayPrice}/{unit}
                  </span>
                )}
              </div>
              <p className="crop-card__soldout-desc">
                {isKannada
                  ? 'ಎಲ್ಲಾ ದಾಸ್ತಾನು ಮಾರಾಟವಾಗಿದೆ. ಮುಂದಿನ ಸುಗ್ಗಿ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ.'
                  : 'All stock has been sold. Next fresh harvest arriving soon.'}
              </p>
            </div>
          ) : (
            <div className="crop-card__benchmark-view">
              <div className="crop-card__benchmark-row">
                <span className="crop-card__benchmark-rate">
                  <span className="crop-card__benchmark-label">{isKannada ? 'ಮಂಡಿ ಅಂದಾಜು ದರ:' : 'Est. Mandi Rate:'}</span>
                  <strong>₹{availability?.benchmarkPrice || 25}/{unit}</strong>
                </span>
              </div>
              <p className="crop-card__benchmark-desc">
                {isKannada
                  ? 'ಕರ್ನಾಟಕದ ರೈತರಿಂದ ಹೊಸ ಸುಗ್ಗಿ ಪಟ್ಟಿಗೆ ಸಿದ್ಧವಾಗಿದೆ.'
                  : 'Fresh Karnataka harvest ready for farmers to list.'}
              </p>
            </div>
          )}
        </div>

        {/* Amazon-Style Add to Cart Stepper & Action Buttons */}
        <div className="crop-card__actions">
          {hasStock ? (
            <div className="crop-card__cart-bar">
              {cartQty > 0 ? (
                <div className="crop-card__stepper">
                  <button
                    type="button"
                    className="crop-card__stepper-btn"
                    onClick={handleDecrement}
                    title={cartQty <= 1 ? (isKannada ? 'ಕಾರ್ಟ್‌ನಿಂದ ತೆಗೆಯಿರಿ' : 'Remove from cart') : (isKannada ? 'ಕಡಿಮೆ ಮಾಡಿ' : 'Decrease')}
                  >
                    {cartQty <= 1 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    ) : '−'}
                  </button>
                  <span className="crop-card__stepper-qty">
                    {cartQty} <small>{unit}</small>
                  </span>
                  <button
                    type="button"
                    className="crop-card__stepper-btn"
                    onClick={handleIncrement}
                    title={isKannada ? 'ಹೆಚ್ಚಿಸಿ' : 'Increase quantity'}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="crop-card__add-btn"
                  onClick={handleAddToCart}
                >
                  <span className="crop-card__add-plus">+</span>
                  <span>{isKannada ? 'ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' : 'Add to Cart'}</span>
                </button>
              )}

              <Link
                className="crop-card__details-link"
                to="/buyer/dashboard/cart"
                title={isKannada ? 'ಕಾರ್ಟ್ ವೀಕ್ಷಿಸಿ' : 'View Cart'}
              >
                <span>{isKannada ? 'ವೀಕ್ಷಿಸಿ →' : 'View →'}</span>
              </Link>
            </div>
          ) : isSoldOut ? (
            <Link
              className="crop-card__cta-btn crop-card__cta-btn--soldout"
              to="/crops"
            >
              <span>{isKannada ? 'ಮುಂದಿನ ಕಟಾವು ಮಾಹಿತಿ' : 'Notify Next Harvest'}</span>
              <span className="crop-card__cta-icon">→</span>
            </Link>
          ) : (
            <Link
              className="crop-card__cta-btn crop-card__cta-btn--list"
              to="/login?role=farmer"
            >
              <span>{isKannada ? 'ರೈತರ ಪಟ್ಟಿ ಸೇರಿಸಿ' : 'List as Farmer'}</span>
              <span className="crop-card__cta-icon">→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default CropCard;
