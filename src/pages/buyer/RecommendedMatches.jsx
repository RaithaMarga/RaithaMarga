import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { apiRequest } from '../../lib/api';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const RecommendedMatches = () => {
  const { requirements, listings, expressInterest, hasRequested, dataError, dataLoading } = useBuyerData();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    apiRequest('/matches')
      .then((matchData) => {
        if (!active) return;
        const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
        const requirementsById = new Map(requirements.map((requirement) => [requirement.id, requirement]));
        setMatches(matchData.map((match) => ({
          ...match,
          listing: listingsById.get(match.listingId),
          requirement: requirementsById.get(match.requirementId),
        })).filter((match) => match.listing && match.requirement));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [listings, requirements]);

  const handleExpressInterest = async (match) => {
    setActionError('');
    try {
      await expressInterest(match.listing, match.requirement.quantity);
      navigate('/buyer/dashboard/deals');
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Recommended Matches</h1>
          <p className="dash-page__subtitle">Active listings matched to your published requirements.</p>
        </div>
      </div>
      {(dataError || error || actionError) && (
        <div className="dash-banner dash-banner--error" role="alert">{actionError || error || dataError}</div>
      )}
      {loading || dataLoading ? (
        <div className="dash-panel" role="status">Loading recommended matches…</div>
      ) : matches.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconHandshake />}
            title="No recommended matches yet"
            description="A match appears when an active listing meets one of your published requirements. Buyers must be manually verified to publish requirements."
            action={<Link to="/buyer/dashboard/profile" className="btn btn--primary btn--sm">Review Requirements</Link>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {matches.map((match) => {
            const requested = hasRequested(match.listingId);
            return (
              <article key={match.id} className="dash-panel">
                <h3>{match.listing.crop} · {match.listing.availableQuantity} {match.listing.unit} available</h3>
                <p>Location: {match.listing.location} · Asking ₹{match.listing.expectedPrice} / {match.listing.unit}</p>
                <p>Your requirement: {match.requirement.quantity} {match.requirement.unit} · target ₹{match.requirement.targetPrice}</p>
                <p>Match score: {match.score}%</p>
                <ul>{(match.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}</ul>
                {requested ? (
                  <button className="btn btn--outline btn--sm" type="button" disabled>Deal already opened</button>
                ) : (
                  <button className="btn btn--primary btn--sm" type="button" onClick={() => handleExpressInterest(match)}>
                    Open Deal
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendedMatches;
