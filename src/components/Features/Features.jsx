import './Features.css';

const features = [
  {
    icon: '📸',
    title: 'Weight Proof',
    description: 'Photo-based proof of produce weight at pickup and delivery helps reduce disputes.',
  },
  {
    icon: '📦',
    title: 'Sell Together',
    description: 'Small quantities from nearby farmers can be combined into one larger bulk lot.',
  },
  {
    icon: '🔥',
    title: 'Buyers Active Today',
    description: 'See which buyers are currently looking for produce in your area.',
  },
  {
    icon: '📞',
    title: 'List Without Typing',
    description: 'Farmers can eventually create listings through a missed call or voice interaction.',
  },
  {
    icon: '⭐',
    title: 'Know Your Buyer',
    description: 'See a buyer-facing trust score before accepting an offer.',
  },
];

const Features = () => {
  return (
    <section className="features">
      <div className="container">
        <div className="features__header">
          <h2 className="features__title">More Than a Marketplace</h2>
          <p className="features__subtitle">
            Built around the challenges small farmers actually face.
          </p>
        </div>

        <div className="features__grid">
          {features.map((feature, index) => (
            <div className="features__card" key={index}>
              <span className="features__card-icon">{feature.icon}</span>
              <h3 className="features__card-title">{feature.title}</h3>
              <p className="features__card-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;