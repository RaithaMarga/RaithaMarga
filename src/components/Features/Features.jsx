import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import './Features.css';

const ICON_KEYS = ['scale', 'crates', 'flame', 'phone', 'star'];

const ICONS = {
  scale: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="3" x2="12" y2="18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="3" r="1.5" fill="currentColor" />
      <path d="M4 8h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M2 8c0 3 2.5 4.5 4 1L8 8" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M16 8c0 3 2.5 4.5 4 1L22 8" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <line x1="7" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  crates: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08" />
    </svg>
  ),
  flame: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c1 3-2 4-2 7a4 4 0 1 0 8 0c0-2-1-3-1-3s-1 2-2 1c1-3-1-3-3-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  phone: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h4l1.5 4L9 8.5a11 11 0 0 0 6.5 6.5L17 13l4 1.5v4c0 1-1 2-2 2C11.5 20.5 3.5 12.5 4 5c0-1 1-2 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  star: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5 14.6 9l6 .8-4.3 4.2 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.8l6-.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

const FeatureCard = ({ feature, iconKey, index }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`features__card reveal ${visible ? 'reveal--visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className="features__card-icon">{ICONS[iconKey]}</span>
      <span className="features__card-tag">{feature.tag}</span>
      <h3 className="features__card-title">{feature.title}</h3>
      <p className="features__card-desc">{feature.description}</p>
    </div>
  );
};

const Features = () => {
  const { t } = useLanguage();
  const [headerRef, headerVisible] = useReveal();

  return (
    <section className="features" id="features">
      <div className="container">
        <div ref={headerRef} className={`section__header reveal ${headerVisible ? 'reveal--visible' : ''}`}>
          <span className="eyebrow">{t.features.eyebrow}</span>
          <h2 className="section__title">{t.features.title}</h2>
          <p className="section__subtitle">{t.features.subtitle}</p>
        </div>

        <div className="features__grid">
          {t.features.items.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} iconKey={ICON_KEYS[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
