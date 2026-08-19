import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import { useCountUp } from '../../hooks/useCountUp';
import './Impact.css';

const StatCard = ({ stat, index }) => {
  const [ref, visible] = useReveal();
  const animatedValue = useCountUp(stat.value, visible);

  return (
    <div
      ref={ref}
      className={`impact__card reveal ${visible ? 'reveal--visible' : ''}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span className="impact__value">{animatedValue}</span>
      <p className="impact__label">{stat.label}</p>
      <span className="impact__source">{stat.source}</span>
    </div>
  );
};

const Impact = () => {
  const { t } = useLanguage();

  return (
    <section className="impact" id="impact">
      <div className="container">
        <div className="impact__grid">
          {t.impact.stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
