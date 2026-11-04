import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import { apiRequest } from '../../lib/api';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import MakeOfferModal from '../../components/dashboard/MakeOfferModal';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';
import { isLocalListing } from '../../lib/marketplace';
import { useLanguage } from '../../context/LanguageContext';

const RecommendedMatches = () => {
  const { requirements, listings, addToCart, dataError, dataLoading } = useBuyerData();
  const { t } = useLanguage();
  const trading = t.trading;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [offerListing, setOfferListing] = useState(null);

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

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Recommended Matches</h1>
          <p className="dash-page__subtitle">Active listings matched to your published requirements.</p>
        </div>
      </div>
      {(dataError || error) && (
        <div className="dash-banner dash-banner--error" role="alert">{error || dataError}</div>
      )}
      {cartMessage && <div className="dash-banner dash-banner--success" role="status">{cartMessage}</div>}
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
            return (
              <article key={match.id} className="dash-panel">
                <ListingImage listing={match.listing} />
                <h3>{match.listing.crop} · {match.listing.availableQuantity} {match.listing.unit} available</h3>
                {match.listing.farmerName ? <p>Farmer: <strong>{match.listing.farmerName}</strong></p> : null}
                <p>Location: {match.listing.location} · Asking ₹{match.listing.expectedPrice} / {match.listing.unit}</p>
                <p>Your requirement: {match.requirement.quantity} {match.requirement.unit} · target ₹{match.requirement.targetPrice}</p>
                <p>Match score: {match.score}%</p>
                <ul>{(match.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}</ul>
                {!isLocalListing(match.listing) && (
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => {
                    try {
                      addToCart(match.listing);
                      setCartMessage(trading.addedToCart.replace('{crop}', match.listing.crop));
                    } catch (requestError) {
                      setCartMessage(requestError.message);
                    }
                  }}>{trading.addToCart}</button>
                )}
                {!isLocalListing(match.listing) && (
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => setOfferListing(match.listing)}>
                    {trading.makeOffer}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
      {offerListing && <MakeOfferModal listing={offerListing} onClose={() => setOfferListing(null)} />}
    </div>
  );
};

export default RecommendedMatches;
