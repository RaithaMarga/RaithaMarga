import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';

const MyListings = () => {
  const { listings, setListingStatus, deleteListing, LISTING_STATUSES } = useFarmerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">My Listings</h1>
          <p className="dash-page__subtitle">Draft, active, matched, sold and expired listings, all in one place.</p>
        </div>
        <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">+ Add Produce</Link>
      </div>

      {listings.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon="\u25A6"
            title="No listings yet"
            description="Add your first produce listing so buyers can start finding it."
            action={<Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">Add Produce</Link>}
          />
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="listing-card">
              {listing.photos?.[0] ? (
                <img src={listing.photos[0]} alt={listing.crop} className="listing-card__photo" />
              ) : null}
              <div className="listing-card__top">
                <span className="listing-card__crop">{listing.crop || 'Untitled crop'}</span>
                <StatusBadge status={listing.status} />
              </div>
              <div className="listing-card__meta">
                <span><strong>{listing.quantity || '—'} {listing.unit}</strong> available</span>
                <span>Expected price: <strong>₹{listing.expectedPrice || '—'}</strong> / {listing.unit}</span>
                {listing.grade ? <span>{listing.grade}</span> : null}
                <span>{listing.location || 'Location not set'}</span>
                {listing.availabilityDate ? <span>Available from {listing.availabilityDate}</span> : null}
              </div>
              <div className="listing-card__actions">
                <select
                  aria-label={`Change status for ${listing.crop}`}
                  value={listing.status}
                  onChange={(e) => setListingStatus(listing.id, e.target.value)}
                >
                  {LISTING_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <Link to={`/farmer/dashboard/listings/${listing.id}/edit`} className="btn btn--outline btn--sm">Edit</Link>
                <button type="button" className="btn--text" onClick={() => deleteListing(listing.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
