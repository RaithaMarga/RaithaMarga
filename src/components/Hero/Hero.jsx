import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import logoSeal from '../../assets/logo-seal.png';
import AgriBackdrop from '../AgriBackdrop/AgriBackdrop';
import './Hero.css';

const Hero = () => {
  const { t } = useLanguage();
  const h = t.hero;

  return (
    <section className="hero" id="home">
      <AgriBackdrop variant="hero" />
      <div className="hero__backdrop" aria-hidden="true">
        <span className="hero__blob hero__blob--gold" />
        <span className="hero__blob hero__blob--green" />
        <span className="hero__dotgrid" />
      </div>
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
          <div className="hero__trustline hero__reveal" style={{ animationDelay: '320ms' }}>
            <span><strong>{h.trust1Strong}</strong> {h.trust1Rest}</span>
            <span className="hero__trustline-dot" aria-hidden="true">&middot;</span>
            <span><strong>{h.trust2Strong}</strong> {h.trust2Rest}</span>
          </div>
        </div>

        <div
          className="hero__visual hero__reveal"
          style={{ animationDelay: '200ms' }}
          role="img"
          aria-label="Produce flows from farmer, through RaithaMarga, to a verified buyer"
        >
          <img
            src={logoSeal}
            alt="RaithaMarga — Official, Sell with Trust"
            className="hero__seal hero__seal--float"
            width="96"
            height="96"
            loading="eager"
          />

          <div className="hero__flow-card hero__flow-card--farmer hero__flow-card--float">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M12 2c-1.5 3-1.5 6 0 8 1.5-2 1.5-5 0-8Z" fill="var(--color-primary)"/><path d="M4 22c0-6 3.5-10 8-10s8 4 8 10" stroke="var(--color-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round"/><circle cx="12" cy="9" r="2" fill="var(--color-gold)"/></svg>
            <span className="hero__flow-label">{h.flowFarmer}</span>
          </div>

          <svg className="hero__flow-arrow hero__flow-arrow--animated" width="40" height="16" viewBox="0 0 40 16" fill="none"><path d="M0 8h34M28 2l6 6-6 6" stroke="var(--color-gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>

          <div className="hero__flow-card hero__flow-card--market hero__flow-card--float" style={{ animationDelay: '400ms' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><line x1="12" y1="3" x2="12" y2="12" stroke="var(--color-gold-dark)" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="3" r="1.6" fill="var(--color-gold-dark)"/><path d="M4 12 12 8l8 4" stroke="var(--color-gold-dark)" strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M2 12c0 3 3 4.5 4.5 1L9 8" stroke="var(--color-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M22 12c0 3-3 4.5-4.5 1L15 8" stroke="var(--color-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round"/><line x1="7" y1="20" x2="17" y2="20" stroke="var(--color-ink-soft)" strokeWidth="1.6" strokeLinecap="round"/></svg>
            <span className="hero__flow-label">{h.flowMarket}</span>
          </div>

          <svg className="hero__flow-arrow hero__flow-arrow--animated" width="40" height="16" viewBox="0 0 40 16" fill="none"><path d="M0 8h34M28 2l6 6-6 6" stroke="var(--color-gold-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>

          <div className="hero__flow-card hero__flow-card--buyer hero__flow-card--float" style={{ animationDelay: '800ms' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M4 9 5 4h14l1 5" stroke="var(--color-primary)" strokeWidth="1.6" fill="none" strokeLinejoin="round"/><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" stroke="var(--color-primary)" strokeWidth="1.6" fill="none"/><path d="M9 13a3 3 0 0 0 6 0" stroke="var(--color-gold)" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
            <span className="hero__flow-label">{h.flowBuyer}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
