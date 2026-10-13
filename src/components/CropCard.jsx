import { Link } from 'react-router-dom';
import CropImage from './CropImage';

const CropCard = ({ crop, copy }) => {
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
        <p className="crop-card__availability">{copy.availability}</p>
        <Link className="crop-card__action" to="/login?role=buyer">
          {copy.action}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};

export default CropCard;
