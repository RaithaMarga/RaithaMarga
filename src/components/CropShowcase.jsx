import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { IMAGE_CROPS } from '../data/crops';
import CropCard from './CropCard';
import './CropShowcase.css';

const HOME_CROP_LIMIT = 4;

const CropShowcase = () => {
  const { t } = useLanguage();
  const copy = t.crops;

  const displayedCrops = IMAGE_CROPS.slice(0, HOME_CROP_LIMIT);

  return (
    <section className="crop-showcase" id="crops">
      <div className="container">
        <div className="crop-showcase__heading">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.subtitle}</p>
        </div>

        <div className="crop-showcase__grid">
          {displayedCrops.map((crop) => (
            <CropCard key={crop.id} crop={crop} copy={copy} />
          ))}
        </div>

        {/* Meesho-styled VIEW ALL button navigating directly to /crops */}
        <div className="crop-showcase__footer">
          <Link to="/crops" className="meesho-view-all-btn">
            <span>{copy.viewAll || 'VIEW ALL'}</span>
            <span className="meesho-view-all-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CropShowcase;
