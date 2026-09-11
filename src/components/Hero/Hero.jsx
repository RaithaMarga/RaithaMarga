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
            <Link to="/farmer/dashboard" className="btn btn--primary btn--animated">
              <span className="btn__shine" aria-hidden="true" />
              {h.ctaFarmer}
            </Link>
            <Link to="/buyer/dashboard" className="btn btn--outline btn--animated">{h.ctaBuyer}</Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
