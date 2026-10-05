import { useEffect, useRef } from 'react';
import StatusBadge from './StatusBadge';
import PhotoPlaceholder from './PhotoPlaceholder';
import './dashboard-ui.css';

/**
 * Shared "View Details" modal for a produce listing.
 * `actions` lets each dashboard render its own primary action
 * (e.g. buyer's "I'm Interested", farmer's "Edit").
 */
const ListingDetailModal = ({ listing, verificationStatus, onClose, actions }) => {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!listing) return null;

  const fields = [
    { label: 'Quantity', value: `${listing.quantity || '\u2014'} ${listing.unit || ''}` },
    { label: 'Expected Price', value: `\u20B9${listing.expectedPrice || '\u2014'} / ${listing.unit || 'unit'}` },
    { label: 'Quality / Grade', value: listing.grade || 'Not specified' },
    { label: 'Pickup Location', value: listing.location || 'Not specified' },
    { label: 'Available From', value: listing.availabilityDate || 'Not specified' },
    { label: 'Listing Status', value: listing.status ? listing.status.charAt(0).toUpperCase() + listing.status.slice(1) : '\u2014' },
  ];

  return (
    <div className="detail-modal__scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
        <button type="button" ref={closeButtonRef} className="detail-modal__close" onClick={onClose} aria-label="Close details">
          &times;
        </button>

        {listing.photos?.length > 0 ? (
          <div className="detail-modal__gallery">
            {listing.photos.map((src, i) => (
              <img key={i} src={src} alt={`${listing.crop} photo ${i + 1}`} />
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <PhotoPlaceholder label="No photos provided" />
          </div>
        )}

        <div className="detail-modal__title-row">
          <h2 id="detail-modal-title" className="detail-modal__title">{listing.crop || 'Untitled crop'}</h2>
          {verificationStatus ? <StatusBadge status={verificationStatus} /> : null}
        </div>

        <div className="detail-modal__grid">
          {fields.map((f) => (
            <div key={f.label} className="detail-modal__field">
              <span className="detail-modal__field-label">{f.label}</span>
              <span className="detail-modal__field-value">{f.value}</span>
            </div>
          ))}
        </div>

        {actions ? <div className="detail-modal__actions">{actions}</div> : null}
      </div>
    </div>
  );
};

export default ListingDetailModal;
