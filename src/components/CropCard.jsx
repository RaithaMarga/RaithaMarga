import { Link } from 'react-router-dom';
import CropImage from './CropImage';
import { getCropAvailability } from '../lib/marketplace';

const formatQty = (n) => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const CropCard = ({ crop, copy, listings }) => {
  const availability = getCropAvailability(crop.name, listings);

  return (
    <article className="crop-card" key={crop.id}>
      <div className="crop-card__image">
        <CropImage crop={crop} />
      </div>
      <div className="crop-card__body">
        <span className="crop-card__category">
          {crop.category === 'Vegetable' ? copy.vegetable : copy.fruit}
        </span>
        <h3>{copy.names?.[crop.id] ?? crop.name}</h3>
        <p className="crop-card__availability">
          {availability ? (
            <>
              <strong className="crop-card__qty">
                {availability.totals.map((t) => `${formatQty(t.quantity)} ${t.unit}`).join(' + ')}
              </strong>{' '}
              {copy.availableNow}
              {availability.minPrice
                ? ` · ${copy.fromPrice.replace('{price}', availability.minPrice).replace('{unit}', availability.unit)}`
                : ''}
            </>
          ) : (
            copy.noListings
          )}
        </p>
        <Link className="crop-card__action" to="/login?role=buyer">
          {copy.action}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};

export default CropCard;
