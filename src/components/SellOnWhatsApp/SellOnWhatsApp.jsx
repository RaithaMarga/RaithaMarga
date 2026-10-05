import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import { WHATSAPP_DISPLAY, buildWhatsAppLink } from '../../config/whatsapp';
import WhatsAppIcon from '../dashboard/WhatsAppIcon';
import './SellOnWhatsApp.css';

const SellOnWhatsApp = () => {
  const { t, language } = useLanguage();
  const s = t.sell;
  const [ref, visible] = useReveal();

  return (
    <section className="sellwa" id="sell-on-whatsapp">
      <div className="container">
        <div ref={ref} className={`section__header reveal ${visible ? 'reveal--visible' : ''}`}>
          <span className="eyebrow">{s.eyebrow}</span>
          <h2 className="section__title">{s.title}</h2>
          <p className="section__subtitle">{s.subtitle}</p>
        </div>

        <div className="sellwa__grid">
          <ol className="sellwa__steps">
            {s.steps.map((step, index) => (
              <li key={step.title} className="sellwa__step">
                <span className="sellwa__step-num" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="sellwa__step-title">{step.title}</h3>
                  <p className="sellwa__step-desc">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="sellwa__card">
            <h3 className="sellwa__card-title">{s.detailsTitle}</h3>
            <ul className="sellwa__details">
              {s.details.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <a
              className="sellwa__button"
              href={buildWhatsAppLink(language)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              {s.button}
            </a>
            <p className="sellwa__number">
              {s.numberLabel}: <strong>{WHATSAPP_DISPLAY}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellOnWhatsApp;
