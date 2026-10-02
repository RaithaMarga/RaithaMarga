import './dashboard-ui.css';

const PhotoPlaceholder = ({ label = 'No photo yet' }) => (
  <div className="listing-card__photo-placeholder" role="img" aria-label={label}>
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 16l5-4 4 3 3-2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
    {label}
  </div>
);

export default PhotoPlaceholder;
