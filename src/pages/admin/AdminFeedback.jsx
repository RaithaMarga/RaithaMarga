export const AdminErrorNotice = ({ error, onRetry, compact = false }) => {
  if (!error) return null;
  const denied = error.status === 403;
  return (
    <div className={`dash-banner dash-banner--error admin-feedback ${compact ? 'admin-feedback--compact' : ''}`} role="alert">
      <span>
        {denied ? 'Access denied (403). ' : 'Could not load admin data. '}
        {error.message}
      </span>
      {onRetry ? (
        <button type="button" className="btn btn--sm btn--outline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
};

export const AdminLoading = ({ label = 'Loading…' }) => (
  <div className="dash-panel admin-state" role="status" aria-live="polite">{label}</div>
);
