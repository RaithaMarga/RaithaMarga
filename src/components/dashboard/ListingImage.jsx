import { useState } from 'react';
import { getListingImage } from '../../lib/marketplace';
import PhotoPlaceholder from './PhotoPlaceholder';

/**
 * Crop picture for a listing. Resolved on the frontend from the crop name
 * (src/assets/images/...), so nothing image-related is stored in the backend.
 */
const ListingImage = ({ listing, className = 'listing-card__photo', label }) => {
  const src = getListingImage(listing);
  const [failed, setFailed] = useState('');
  if (!src || failed === src) return <PhotoPlaceholder label={label} />;
  return (
    <img
      src={src}
      alt={listing?.crop || 'Produce'}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(src)}
    />
  );
};

export default ListingImage;
