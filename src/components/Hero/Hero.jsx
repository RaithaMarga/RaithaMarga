import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import './Hero.css';

const Hero = () => {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section className="hero" id="home">
      <div className="hero__container container">
        <div className="hero__content">
          <span className="eyebrow hero__reveal" style={{ animationDelay: '0ms' }}>{h.eyebrow}</span>
          <h1 className="hero__title hero__reveal" style={{ animationDelay: '80ms' }}>
            {h.titleLine1}
            <br />
            {h.titleLine2}
            <br />
            <span className="hero__title-accent">{h.titleLine3}</span>
          </h1>
          <p className="hero__subtitle hero__reveal" style={{ animationDelay: '160ms' }}>
            {h.subtitle}
          </p>
          <div className="hero__cta hero__reveal" style={{ animationDelay: '240ms' }}>
            <Link to="/farmer/dashboard" className="btn btn--primary btn--animated hero__cta-btn">
              <span className="btn__shine" aria-hidden="true" />
              <span className="hero__cta-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 20c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span className="hero__cta-text">
                <span className="hero__cta-title">{h.ctaFarmer}</span>
                <span className="hero__cta-sub">{h.ctaFarmerSub} &rarr;</span>
              </span>
            </Link>
            <Link to="/buyer/dashboard" className="btn btn--outline btn--animated hero__cta-btn">
              <span className="hero__cta-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 9 5 4h14l1 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                  <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.6" fill="none" />
                  <path d="M9 13a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              <span className="hero__cta-text">
                <span className="hero__cta-title">{h.ctaBuyer}</span>
                <span className="hero__cta-sub">{h.ctaBuyerSub} &rarr;</span>
              </span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
