import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import PhotoPlaceholder from '../../components/dashboard/PhotoPlaceholder';
import ListingDetailModal from '../../components/dashboard/ListingDetailModal';
import { findImageCrop } from '../../data/crops';
import '../../components/dashboard/dashboard-ui.css';
import { IconField } from '../../components/dashboard/icons';

const MyListings = () => {
  const { listings, listingsError, listingsLoading } = useFarmerData();
  const { language } = useLanguage();
  const isKannada = language === 'kn';
  const [detailListing, setDetailListing] = useState(null);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{isKannada ? 'ನನ್ನ ಪಟ್ಟಿಗಳು' : 'My Listings'}</h1>
          <p className="dash-page__subtitle">
            {isKannada ? 'ಮಾರುಕಟ್ಟೆಯಲ್ಲಿನ ನಿಮ್ಮ ಸಕ್ರಿಯ ಉತ್ಪನ್ನಗಳ ಪಟ್ಟಿ.' : 'Your active produce listings from the marketplace.'}
          </p>
        </div>
        <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">
          {isKannada ? '+ ಬೆಳೆ ಸೇರಿಸಿ' : '+ Add Produce'}
        </Link>
      </div>

      {listingsError && <div className="dash-banner dash-banner--error" role="alert">{listingsError}</div>}

      {listingsLoading ? (
        <div className="dash-panel" role="status">
          {isKannada ? 'ನಿಮ್ಮ ಸಕ್ರಿಯ ಪಟ್ಟಿಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ…' : 'Loading your active listings…'}
        </div>
      ) : listings.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconField />}
            title={isKannada ? 'ಇನ್ನೂ ಯಾವುದೇ ಪಟ್ಟಿಗಳಿಲ್ಲ' : 'No listings yet'}
            description={isKannada ? 'ಖರೀದಿದಾರರು ಹುಡುಕಲು ನಿಮ್ಮ ಮೊದಲ ಬೆಳೆಯನ್ನು ಪ್ರಕಟಿಸಿ.' : 'Publish your first produce listing so buyers can find it.'}
            action={<Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">{isKannada ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Add Produce'}</Link>}
          />
        </div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => {
            const cropMatch = findImageCrop(listing.crop);
            const photoUrl = listing.photos?.[0] || cropMatch?.image;

            return (
              <article key={listing.id} className="listing-card">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={listing.crop}
                    className="listing-card__photo"
                    loading="lazy"
                  />
                ) : (
                  <PhotoPlaceholder label={isKannada ? 'ಚಿತ್ರ ಲಭ್ಯವಿಲ್ಲ' : 'No photo yet'} />
                )}
                <div className="listing-card__top">
                  <span className="listing-card__crop">{listing.crop || 'Produce'}</span>
                  <StatusBadge status={listing.status} />
                </div>
                {listing.grade && <span className="listing-card__grade">{listing.grade}</span>}
                <div className="listing-card__meta">
                  <span>
                    <strong>{listing.quantity || '—'} {listing.unit === 'kg' && isKannada ? 'ಕೆ.ಜಿ' : listing.unit}</strong>{' '}
                    {isKannada ? 'ಲಭ್ಯವಿದೆ' : 'available'}
                  </span>
                  <span>
                    {isKannada ? 'ನಿರೀಕ್ಷಿತ ಬೆಲೆ: ' : 'Expected price: '}
                    <strong>₹{listing.expectedPrice || listing.price || '—'}</strong> / {listing.unit === 'kg' && isKannada ? 'ಕೆ.ಜಿ' : listing.unit}
                  </span>
                  <span>{listing.location || (isKannada ? 'ಸ್ಥಳ ನಿಗದಿಪಡಿಸಿಲ್ಲ' : 'Location not set')}</span>
                  {listing.availabilityDate && (
                    <span>{isKannada ? `${listing.availabilityDate} ರಿಂದ ಲಭ್ಯ` : `Available from ${listing.availabilityDate}`}</span>
                  )}
                </div>
                <div className="listing-card__actions">
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setDetailListing(listing)}>
                    {isKannada ? 'ವಿವರ ನೋಡಿ' : 'View'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {detailListing && (
        <ListingDetailModal listing={detailListing} onClose={() => setDetailListing(null)} />
      )}
      <p className="dash-page__subtitle">
        {isKannada
          ? 'ಪಟ್ಟಿಗಳ ತಿದ್ದುಪಡಿ ಅಥವಾ ಅಳಿಸುವಿಕೆ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ. ಯಾವುದೇ ಬದಲಾವಣೆಗೆ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ರೈತಮಾರ್ಗ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ.'
          : 'Editing and deleting listings is not available yet. Contact the RaithaMarga team on WhatsApp if something needs to change.'}
      </p>
    </div>
  );
};

export default MyListings;
