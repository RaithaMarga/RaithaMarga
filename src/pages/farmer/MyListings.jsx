import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import PhotoPlaceholder from '../../components/dashboard/PhotoPlaceholder';
import ListingDetailModal from '../../components/dashboard/ListingDetailModal';
import '../../components/dashboard/dashboard-ui.css';
import { IconField } from '../../components/dashboard/icons';

const MyListings = () => {
  const { listings, listingsError, listingsLoading } = useFarmerData();
  const [detailListing, setDetailListing] = useState(null);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">My Listings</h1>
          <p className="dash-page__subtitle">Your active produce listings from the marketplace.</p>
        </div>
        <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">+ Add Produce</Link>
      </div>

      {listingsError && <div className="dash-banner dash-banner--error" role="alert">{listingsError}</div>}

      {listingsLoading ? (
        <div className="dash-panel" role="status">Loading your active listings…</div>
      ) : listings.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconField />}
            title="No listings yet"
            description="Publish your first produce listing so buyers can find it."
            action={<Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">Add Produce</Link>}
          />
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="listing-card">
              <PhotoPlaceholder />
              <div className="listing-card__top">
                <span className="listing-card__crop">{listing.crop || 'Produce'}</span>
                <StatusBadge status={listing.status} />
              </div>
              {listing.grade && <span className="listing-card__grade">{listing.grade}</span>}
              <div className="listing-card__meta">
                <span><strong>{listing.quantity || '\u2014'} {listing.unit}</strong> available</span>
                <span>Expected price: <strong>{'\u20B9'}{listing.expectedPrice || '\u2014'}</strong> / {listing.unit}</span>
                <span>{listing.location || 'Location not set'}</span>
                {listing.availabilityDate && <span>Available from {listing.availabilityDate}</span>}
              </div>
              <div className="listing-card__actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setDetailListing(listing)}>
                  View
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {detailListing && (
        <ListingDetailModal listing={detailListing} onClose={() => setDetailListing(null)} />
      )}
      <p className="dash-page__subtitle">Listing edits, deletion, and weighing-proof uploads are not available in the backend yet.</p>
    </div>
  );
};

export default MyListings;
