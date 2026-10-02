import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import iconList from '../../assets/how-it-works/01_list_in_seconds.png';
import iconCombined from '../../assets/how-it-works/02_combined_matched.png';
import iconVerified from '../../assets/how-it-works/03_verified_buyer.png';
import iconDelivery from '../../assets/how-it-works/04_weigh_deliver_get_paid.png';
import './HowItWorks.css';

const STEP_ICONS = [iconList, iconCombined, iconVerified, iconDelivery];

const StepCard = ({ step, index, isLast }) => {
  const [ref, visible] = useReveal();
  return (
    <div className="how__step-wrap">
      <div
        ref={ref}
        className={`how__step reveal ${visible ? 'reveal--visible' : ''}`}
        style={{ transitionDelay: `${index * 90}ms` }}
      >
        <img
          className="how__step-icon"
          src={STEP_ICONS[index]}
          alt=""
          width="140"
          height="140"
          loading="lazy"
        />
        <h3 className="how__step-title">{step.title}</h3>
        <p className="how__step-desc">{step.description}</p>
      </div>
      {!isLast && (
        <svg className="how__step-arrow" width="28" height="14" viewBox="0 0 28 14" fill="none" aria-hidden="true">
          <path d="M0 7h22M17 2l6 5-6 5" stroke="var(--color-gold-dark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};

const HowItWorks = () => {
  const { t } = useLanguage();
  const [headerRef, headerVisible] = useReveal();

  return (
    <section className="how" id="how-it-works">
      <div className="container">
        <div ref={headerRef} className={`section__header reveal ${headerVisible ? 'reveal--visible' : ''}`}>
          <span className="eyebrow">{t.how.eyebrow}</span>
          <h2 className="section__title">{t.how.title}</h2>
          <p className="section__subtitle">{t.how.subtitle}</p>
        </div>

        <div className="how__row">
          {t.how.steps.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} isLast={i === t.how.steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
