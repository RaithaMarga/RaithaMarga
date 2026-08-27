import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import './HowItWorks.css';

const StepRow = ({ step, index, isLast }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`how__step reveal ${visible ? 'reveal--visible' : ''}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="how__step-marker">
        <span className="how__step-number">{String(index + 1).padStart(2, '0')}</span>
        {!isLast && <span className="how__step-line" aria-hidden="true" />}
      </div>
      <div className="how__step-body">
        <h3 className="how__step-title">{step.title}</h3>
        <p className="how__step-desc">{step.description}</p>
      </div>
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

        <div className="how__steps">
          {t.how.steps.map((step, i) => (
            <StepRow key={step.title} step={step} index={i} isLast={i === t.how.steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
