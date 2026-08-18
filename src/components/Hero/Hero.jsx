import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__container container">
        <div className="hero__content">
          <h1 className="hero__title">
            Sell Smarter. Sell Together.
            <br />
            Sell with Trust.
          </h1>
          <p className="hero__subtitle">
            RaithaMarga connects small farmers with verified buyers, combines nearby produce
            into larger lots, and gives farmers greater confidence when making a deal.
          </p>
          <div className="hero__cta">
            <a href="/register?role=farmer" className="hero__btn hero__btn--primary">
              I'm a Farmer
            </a>
            <a href="/register?role=buyer" className="hero__btn hero__btn--secondary">
              I'm a Buyer
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__visual-card hero__visual-card--farmer">
            <span className="hero__visual-icon">👨‍🌾</span>
            <span className="hero__visual-label">Farmer</span>
          </div>
          <div className="hero__visual-arrow">→</div>
          <div className="hero__visual-card hero__visual-card--market">
            <span className="hero__visual-icon">🌾</span>
            <span className="hero__visual-label">RaithaMarga</span>
          </div>
          <div className="hero__visual-arrow">→</div>
          <div className="hero__visual-card hero__visual-card--buyer">
            <span className="hero__visual-icon">🏪</span>
            <span className="hero__visual-label">Verified Buyer</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;