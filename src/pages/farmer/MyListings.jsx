import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import PhotoPlaceholder from '../../components/dashboard/PhotoPlaceholder';
import ListingDetailModal from '../../components/dashboard/ListingDetailModal';
import LiveCameraCapture from '../../components/camera/LiveCameraCapture';
import '../../components/dashboard/dashboard-ui.css';
import { IconField } from '../../components/dashboard/icons';

const MyListings = () => {
  const { listings, setListingStatus, deleteListing, addWeighingProof, LISTING_STATUSES } = useFarmerData();
  const [detailListing, setDetailListing] = useState(null);
  const [proofListing, setProofListing] = useState(null);
  const [confirmedProofId, setConfirmedProofId] = useState(null);

  const handleDelete = (listing) => {
    if (window.confirm(`Delete "${listing.crop || 'this listing'}"? This can't be undone.`)) {
      deleteListing(listing.id);
    }
  };

  const handleCapture = (proof) => {
    addWeighingProof(proofListing.id, proof);
    setProofListing(null);
    setConfirmedProofId(proof.id);
    setTimeout(() => setConfirmedProofId(null), 3000);
  };

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
            icon={<IconField />}
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
              ) : (
                <PhotoPlaceholder />
              )}
              <div className="listing-card__top">
                <span className="listing-card__crop">{listing.crop || 'Untitled crop'}</span>
                <StatusBadge status={listing.status} />
              </div>
              {listing.grade ? <span className="listing-card__grade">{listing.grade}</span> : null}
              <div className="listing-card__meta">
                <span><strong>{listing.quantity || '\u2014'} {listing.unit}</strong> available</span>
                <span>Expected price: <strong>{'\u20B9'}{listing.expectedPrice || '\u2014'}</strong> / {listing.unit}</span>
                <span>{listing.location || 'Location not set'}</span>
                {listing.availabilityDate ? <span>Available from {listing.availabilityDate}</span> : null}
                {listing.weighingProofs?.length > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {listing.weighingProofs.length} weighing photo{listing.weighingProofs.length === 1 ? '' : 's'}
                    <StatusBadge status="Pending_Verification" />
                  </span>
                )}
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
                <button type="button" className="btn btn--outline btn--sm" onClick={() => setDetailListing(listing)}>
                  View
                </button>
                <Link to={`/farmer/dashboard/listings/${listing.id}/edit`} className="btn btn--outline btn--sm">Edit</Link>
                <button type="button" className="btn--text" onClick={() => handleDelete(listing)}>Delete</button>
              </div>
              {confirmedProofId && listing.weighingProofs?.[0]?.id === confirmedProofId && (
                <div className="dash-banner dash-banner--success" role="status">
                  <span className="dash-banner__icon" aria-hidden="true">{'\u2713'}</span>
                  Weighing photo captured.
                </div>
              )}
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setProofListing(listing)}
                style={{ marginTop: 'var(--space-1)' }}
              >
                {'\uD83D\uDCF7'} Add Weighing Proof
              </button>
            </article>
          ))}
        </div>
      )}

      {detailListing && (
        <ListingDetailModal
          listing={detailListing}
          onClose={() => setDetailListing(null)}
          actions={
            <Link to={`/farmer/dashboard/listings/${detailListing.id}/edit`} className="btn btn--primary btn--sm">
              Edit Listing
            </Link>
          }
        />
      )}

      {proofListing && (
        <div className="detail-modal__scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) setProofListing(null); }}>
          <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
            <button type="button" className="detail-modal__close" onClick={() => setProofListing(null)} aria-label="Close camera">
              &times;
            </button>
            <h2 id="camera-modal-title" className="detail-modal__title" style={{ marginBottom: 'var(--space-4)' }}>
              Weighing Proof — {proofListing.crop || 'Listing'}
            </h2>
            <LiveCameraCapture
              lotId={proofListing.id}
              onCapture={handleCapture}
              onCancel={() => setProofListing(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;
