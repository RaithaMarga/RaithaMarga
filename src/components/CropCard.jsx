import { Link } from 'react-router-dom';
import CropImage from './CropImage';
import { getCropAvailability } from '../lib/marketplace';

const formatQty = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const CropCard = ({ crop, copy, listings }) => {
  const availability = getCropAvailability(crop.name, listings);
  const isVegetable = crop.category === 'Vegetable';
  const cropTitle = copy.names?.[crop.id] ?? crop.name;

  return (
    <article className="crop-card" key={crop.id}>
      <div className="crop-card__image-wrap">
        <div className="crop-card__image">
          <CropImage crop={crop} />
        </div>

        {/* Floating Category Pill */}
        <span className="crop-card__category-badge">
          {isVegetable ? '🥕' : '🍎'} {isVegetable ? copy.vegetable : copy.fruit}
        </span>

        {/* Floating Availability Tag */}
        <span className={`crop-card__status-tag ${availability ? 'crop-card__status-tag--active' : 'crop-card__status-tag--open'}`}>
          {availability ? `🟢 ${copy.availableNow || 'Available'}` : `🌱 ${copy.openToList || 'Open to List'}`}
        </span>
      </div>

      <div className="crop-card__body">
        <h3 className="crop-card__title">
          {cropTitle}
        </h3>

        <div className="crop-card__info-box">
          {availability ? (
            <div className="crop-card__stock-info">
              <span className="crop-card__qty">
                📦 {availability.totals.map((t) => `${formatQty(t.quantity)} ${t.unit}`).join(' + ')}
              </span>
              {availability.minPrice && (
                <span className="crop-card__price">
                  ₹{availability.minPrice}/{availability.unit || 'kg'}
                </span>
              )}
            </div>
          ) : (
            <div className="crop-card__empty-info">
              <span className="crop-card__empty-text">
                {copy.noListings || 'Direct from Karnataka farms'}
              </span>
              <span className="crop-card__pilot-tag">0% Commission</span>
            </div>
          )}
        </div>

        <div className="crop-card__actions">
          <Link
            className="crop-card__btn crop-card__btn--buy"
            to="/login?role=buyer"
            title={`Buy ${cropTitle}`}
          >
            <span>{copy.action || 'View Availability'}</span>
            <span className="crop-card__btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CropCard;
