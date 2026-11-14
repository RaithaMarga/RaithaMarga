import { useState } from 'react';
import { Link } from 'react-router-dom';
import CropImage from './CropImage';
import { getCropAvailability } from '../lib/marketplace';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import QuantityInput from './QuantityInput';

const formatQty = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 });

const CropCard = ({ crop, copy, listings }) => {
  const { language } = useLanguage();
  const isKannada = language === 'kn';
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const availability = getCropAvailability(crop.name, listings);
  const isVegetable = crop.category === 'Vegetable';
  const cropTitle = copy?.names?.[crop.id] ?? crop.name;

  const hasStock = availability && availability.totalQuantity > 0;
  const isSoldOut = availability && availability.isSoldOut;

  // Final price: either computed average across all farmers, or single farmer price, or benchmark
  const displayPrice = availability?.averagePrice ?? availability?.minPrice;
  const unit = availability?.unit || 'kg';

  const candidates = (listings || []).filter((listing) => {
    const available = getCropAvailability(crop.name, [listing]);
    return available?.totalQuantity > 0 && (!listing.status || listing.status === 'active') && Number(listing.quantity) >= 1;
  }).sort((a, b) => Number(a.expectedPrice) - Number(b.expectedPrice));
  const listing = candidates[0];

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
          <span className="crop-card__fee-badge">
            {isKannada ? '1% + 1% ವೇದಿಕೆ ಶುಲ್ಕ' : '1% + 1% Platform Fee'}
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
                    <span>✨ {isKannada ? 'ನೇರ ರೈತ ಬೆಲೆ · 1% + 1% ವೇದಿಕೆ ಶುಲ್ಕ' : 'Direct farmer price · No middleman'}</span>
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
            <div className="crop-card__cart-bar crop-card__cart-bar--typed">
              {listing ? <>
                <p className="crop-card__stock-note">₹{listing.expectedPrice}/{listing.unit || 'kg'} · {listing.quantity} {listing.unit || 'kg'} {isKannada ? 'ಲಭ್ಯ' : 'available'}</p>
                <QuantityInput value={Math.min(quantity, Number(listing.quantity))} max={listing.quantity} unit={listing.unit || 'kg'} label={`${cropTitle} quantity`} onChange={setQuantity} />
                <button type="button" className="crop-card__add-btn" onClick={() => {
                  try { addToCart(listing, Math.min(quantity, Number(listing.quantity))); setMessage('ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ / Added to Cart ✓'); }
                  catch (error) { setMessage(error.message); }
                }}>+ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ / Add to Cart</button>
                {message && <small role="status">{message}</small>}
                <Link className="crop-card__details-link" to="/cart">{isKannada ? 'ಕಾರ್ಟ್ ನೋಡಿ →' : 'View Cart →'}</Link>
              </> : <p>{isKannada ? 'ಪ್ರಸ್ತುತ ಲಭ್ಯತೆ ಪರಿಶೀಲಿಸಿ' : 'Check current availability'}</p>}
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
