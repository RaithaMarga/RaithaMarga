import './dashboard-ui.css';

/**
 * A single overview metric card.
 * `caption` is optional small text under the value (e.g. a unit breakdown).
 */
const StatCard = ({ icon, label, value, caption, accent = 'primary' }) => {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-card__icon" aria-hidden="true">{icon}</span>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {caption ? <span className="stat-card__caption">{caption}</span> : null}
      </div>
    </div>
  );
};

export default StatCard;
