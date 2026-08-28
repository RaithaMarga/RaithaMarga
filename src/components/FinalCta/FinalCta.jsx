import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import './FinalCta.css';

const FinalCta = () => {
  const { t } = useLanguage();
  const c = t.finalCta;
  const [ref, visible] = useReveal();

  return (
    <section className="final-cta">
      <div className="final-cta__backdrop" aria-hidden="true">
        <span className="final-cta__leaf final-cta__leaf--one" />
        <span className="final-cta__leaf final-cta__leaf--two" />
      </div>
      <div className="container">
        <div ref={ref} className={`final-cta__panel reveal ${visible ? 'reveal--visible' : ''}`}>
          <span className="eyebrow final-cta__eyebrow">{c.eyebrow}</span>
          <h2 className="final-cta__title">{c.title}</h2>
          <p className="final-cta__subtitle">{c.subtitle}</p>
          <div className="final-cta__actions">
            <Link to="/farmer/dashboard" className="btn btn--gold btn--animated">
              <span className="btn__shine" aria-hidden="true" />
              {c.ctaPrimary}
            </Link>
            <a href="#login" className="btn btn--outline-light btn--animated">{c.ctaSecondary}</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
