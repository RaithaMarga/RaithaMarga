import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { IMAGE_CROPS } from '../data/crops';
import CropImage from './CropImage';
import './CropShowcase.css';

const CropShowcase = () => {
  const { t } = useLanguage();
  const copy = t.crops;

  return (
    <section className="crop-showcase" id="crops">
      <div className="container">
        <div className="crop-showcase__heading">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="crop-showcase__grid">
          {IMAGE_CROPS.map((crop) => (
            <article className="crop-card" key={crop.id}>
              <div className="crop-card__image">
                <CropImage crop={crop} />
              </div>
              <div className="crop-card__body">
                <span className="crop-card__category">
                  {crop.category === 'Vegetable' ? copy.vegetable : copy.fruit}
                </span>
                <h3>{copy.names[crop.id] ?? crop.name}</h3>
                <p className="crop-card__availability">{copy.availability}</p>
                <Link className="crop-card__action" to="/login?role=buyer">
                  {copy.action}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CropShowcase;
