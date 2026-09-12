import { useLanguage } from '../../context/LanguageContext';
import { useReveal } from '../../hooks/useReveal';
import imgWeightProof from '../../assets/features/weight-proof.jpg';
import imgSellTogether from '../../assets/features/sell-together.jpg';
import imgBuyersActive from '../../assets/features/buyers-active-today.jpg';
import imgListWithoutTyping from '../../assets/features/list-without-typing.jpg';
import imgKnowYourBuyer from '../../assets/features/know-your-buyer.jpg';
import './Features.css';

const FEATURE_IMAGES = [imgWeightProof, imgSellTogether, imgBuyersActive, imgListWithoutTyping, imgKnowYourBuyer];

const FEATURE_ALT_TEXT = [
  'Weight proof showing verified produce weighing',
  'Farmers combining produce into a bulk lot',
  'Verified buyers actively sourcing produce',
  'Farmer creating a listing using voice',
  'Verified buyer trust score',
];

const FeatureCard = ({ feature, index }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`features__card reveal ${visible ? 'reveal--visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="features__card-media">
        <img src={FEATURE_IMAGES[index]} alt={FEATURE_ALT_TEXT[index]} loading="lazy" />
      </div>
      <div className="features__card-body">
        <span className="features__card-tag">{feature.tag}</span>
        <h3 className="features__card-title">{feature.title}</h3>
        <p className="features__card-desc">{feature.description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  const { t } = useLanguage();
  const [headerRef, headerVisible] = useReveal();
  const items = t.features.items;

  return (
    <section className="features" id="features">
      <div className="container">
        <div ref={headerRef} className={`section__header reveal ${headerVisible ? 'reveal--visible' : ''}`}>
          <span className="eyebrow">{t.features.eyebrow}</span>
          <h2 className="section__title">{t.features.title}</h2>
          <p className="section__subtitle">{t.features.subtitle}</p>
        </div>

        <div className="features__grid">
          {items.slice(0, 3).map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
        <div className="features__grid features__grid--second-row">
          {items.slice(3, 5).map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
