import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import './TrustBar.css';

const ICONS = {
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5 19 6.5v5c0 5-3 8-7 9-4-1-7-4-7-9v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  language: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9S9.5 5.5 12 3Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  coin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v10M9.5 9.3c0-1.3 1.1-2 2.5-2s2.5.8 2.5 2c0 3-5 1.7-5 4.7 0 1.3 1.1 2 2.5 2s2.5-.7 2.5-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const BADGE_KEYS = ['camera', 'shield', 'language', 'coin'];

const TrustBar = () => {
  const { t } = useLanguage();
  const [ref, visible] = useReveal();

  return (
    <section className="trustbar" id="trust">
      <div className="container">
        <div ref={ref} className={`trustbar__panel reveal ${visible ? 'reveal--visible' : ''}`}>
          <span className="trustbar__label">{t.trustbar.label}</span>
          <ul className="trustbar__list">
            {t.trustbar.items.map((item, i) => (
              <li key={item} className="trustbar__item" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="trustbar__icon">{ICONS[BADGE_KEYS[i]]}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
