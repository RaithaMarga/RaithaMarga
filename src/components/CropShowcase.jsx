import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { IMAGE_CROPS } from '../data/crops';
import CropCard from './CropCard';
import { useMarketplaceListings } from '../hooks/useMarketplaceListings';
import './CropShowcase.css';

const HOME_CROP_LIMIT = 4;

const CropShowcase = () => {
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const copy = t.crops || {};
  const listings = useMarketplaceListings();

  const displayedCrops = IMAGE_CROPS.slice(0, HOME_CROP_LIMIT);

  return (
    <section className="crop-showcase" id="crops">
      {/* Decorative ambient background glows */}
      <div className="crop-showcase__ambient-glow-1" aria-hidden="true" />
      <div className="crop-showcase__ambient-glow-2" aria-hidden="true" />

      <div className="container crop-showcase__container">
        {/* Header with modern agri-tech styling */}
        <div className="crop-showcase__heading">
          <div className="crop-showcase__pill">
            <span className="crop-showcase__pill-dot" />
            <span className="crop-showcase__pill-text">
              {isKannada ? '🌱 ತಾಜಾ ಸುಗ್ಗಿ & ಪಾರದರ್ಶಕ ರೈತ ಬೆಲೆಗಳು' : '🌱 Fresh Harvest & Transparent Farm Rates'}
            </span>
          </div>

          <h2 className="crop-showcase__title">{copy.title || (isKannada ? 'ರೈತಮಾರ್ಗದಲ್ಲಿನ ಬೆಳೆಗಳು' : 'Crops on RaithaMarga')}</h2>
          <p className="crop-showcase__subtitle">
            {copy.subtitle || (isKannada
              ? 'ರೈತರು ಪಟ್ಟಿ ಮಾಡಿದ ಬೆಳೆಗಳನ್ನು, ಸರಾಸರಿ ದರ ಮತ್ತು ಈಗ ಲಭ್ಯವಿರುವ ನಿಖರ ಪ್ರಮಾಣವನ್ನು ವೀಕ್ಷಿಸಿ.'
              : 'Browse verified crops listed by local farmers with live average prices and available quantity.')}
          </p>

          {/* Transparent Logistics & Zero Middlemen Assurance Pill */}
          <div className="crop-showcase__delivery-banner">
            <div className="crop-showcase__delivery-item">
              <span className="crop-showcase__delivery-icon">🚚</span>
              <span className="crop-showcase__delivery-text">
                <strong>{isKannada ? 'ಕಿಲೋಮೀಟರ್ ಆಧಾರಿತ ವಿತರಣೆ:' : 'Km-Based Delivery:'}</strong>{' '}
                {isKannada
                  ? 'ರೈತರಿಂದ ಪಿಕಪ್ & ಖರೀದಿದಾರರಿಗೆ ಡೆಲಿವರಿ ಶುಲ್ಕವನ್ನು ಕಿ.ಮೀ. ಆಧಾರದಲ್ಲಿ ನ್ಯಾಯಯುತವಾಗಿ ಹಂಚಲಾಗುತ್ತದೆ.'
                  : 'Pickup & delivery charges shared fairly between farmer and buyer based on actual kms.'}
              </span>
            </div>
            <div className="crop-showcase__delivery-item">
              <span className="crop-showcase__delivery-icon">🛡️</span>
              <span className="crop-showcase__delivery-text">
                <strong>{isKannada ? 'ರೈತಮಾರ್ಗ ತಂಡದ ಸಂಪೂರ್ಣ ನಿರ್ವಹಣೆ:' : '100% Team Managed:'}</strong>{' '}
                {isKannada
                  ? 'ನೇರ ಕರೆಗಳ ಗೊಂದಲವಿಲ್ಲ, ತೂಕ ಮತ್ತು ಪಾವತಿಯನ್ನು ರೈತಮಾರ್ಗ ತಂಡವೇ ಖಾತರಿಪಡಿಸುತ್ತದೆ.'
                  : 'No direct buyer-farmer calls; weighing, quality and payouts handled directly by RaithaMarga.'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="crop-showcase__grid">
          {displayedCrops.map((crop, index) => (
            <div key={crop.id} className="crop-showcase__card-slot" style={{ animationDelay: `${index * 0.1}s` }}>
              <CropCard crop={crop} copy={copy} listings={listings} />
            </div>
          ))}
        </div>

        {/* View All Crops Button */}
        <div className="crop-showcase__footer">
          <Link to="/crops" className="crop-showcase__view-all-btn">
            <span>{copy.viewAll || (isKannada ? 'ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ' : 'View All 24 Crops')}</span>
            <span className="crop-showcase__view-all-arrow" aria-hidden="true">→</span>
          </Link>
          <p className="crop-showcase__footer-note">
            {isKannada
              ? '⚡ 1% + 1% ವೇದಿಕೆ ಶುಲ್ಕದೊಂದಿಗೆ ನೇರ ರೈತರಿಂದ ಬೃಹತ್ ಪ್ರಮಾಣದಲ್ಲಿ ಲಭ್ಯ.'
              : '⚡ Available in bulk directly from verified Karnataka farmers with 1% + 1% Platform Fee.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CropShowcase;
