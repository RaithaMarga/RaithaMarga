import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import { apiRequest } from '../../lib/api';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const BuyerMatches = () => {
  const { listings } = useFarmerData();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest('/matches'), apiRequest('/requirements')])
      .then(([matchData, requirementData]) => {
        if (!active) return;
        const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
        const requirementsById = new Map(requirementData.map((requirement) => [requirement.id, requirement]));
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
  }, [listings]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Buyer Matches</h1>
          <p className="dash-page__subtitle">Matches are calculated from active listings and verified buyer requirements.</p>
        </div>
      </div>
      {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}
      {loading ? (
        <div className="dash-panel" role="status">Loading matches…</div>
      ) : matches.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconHandshake />}
            title="No buyer matches yet"
            description="A match appears when your active listing meets a verified buyer's crop, unit, quantity, district, quality, and price requirements."
            action={<Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">Add Produce Listing</Link>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {matches.map((match) => (
            <article key={match.id} className="dash-panel">
              <h3>{match.listing.crop} · {match.requirement.quantity} {match.requirement.unit}</h3>
              <p>Listing: {match.listing.quantity} {match.listing.unit} at ₹{match.listing.expectedPrice} / {match.listing.unit}</p>
              <p>Buyer requirement: {match.requirement.location}, up to ₹{match.requirement.targetPrice} / {match.requirement.unit}</p>
              <p>Match score: {match.score}%</p>
              <ul>{(match.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}</ul>
              <p>Buyers create deals from their accounts. You can review and confirm incoming deals under My Deals.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerMatches;
