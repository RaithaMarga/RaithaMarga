import { useMemo, useState } from 'react';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useFarmerListings, useFarmerVerification } from '../../hooks/useSharedFarmerData';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import PhotoPlaceholder from '../../components/dashboard/PhotoPlaceholder';
import ListingDetailModal from '../../components/dashboard/ListingDetailModal';
import { IconBasket, IconSearch } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const emptyFilters = {
  crop: '',
  minQuantity: '',
  location: '',
  quality: '',
  maxPrice: '',
  availableFrom: '',
};

const BrowseProduce = () => {
  const listings = useFarmerListings();
  const farmerVerification = useFarmerVerification();
  const { expressInterest, hasRequested } = useBuyerData();
  const [filters, setFilters] = useState(emptyFilters);
  const [confirmedId, setConfirmedId] = useState(null);
  const [detailListing, setDetailListing] = useState(null);

  const activeListings = useMemo(() => listings.filter((l) => l.status === 'active'), [listings]);

  const grades = useMemo(
    () => [...new Set(activeListings.map((l) => l.grade).filter(Boolean))],
    [activeListings]
  );

  const filtered = useMemo(() => {
    return activeListings.filter((l) => {
      if (filters.crop && !l.crop?.toLowerCase().includes(filters.crop.toLowerCase())) return false;
      if (filters.minQuantity && Number(l.quantity) < Number(filters.minQuantity)) return false;
      if (filters.location && !l.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.quality && l.grade !== filters.quality) return false;
      if (filters.maxPrice && Number(l.expectedPrice) > Number(filters.maxPrice)) return false;
      if (filters.availableFrom && l.availabilityDate && l.availabilityDate < filters.availableFrom) return false;
      return true;
    });
  }, [activeListings, filters]);

  const filtersActive = Object.values(filters).some(Boolean);

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleInterest = (listing) => {
    expressInterest(listing);
    setConfirmedId(listing.id);
    setTimeout(() => setConfirmedId(null), 2500);
  };

  const renderInterestAction = (listing, size = 'sm') => {
    const requested = hasRequested(listing.id);
    if (confirmedId === listing.id) {
      return (
        <span style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
          Interest sent {'\u2713'}
        </span>
      );
    }
    if (requested) {
      return (
        <button type="button" className={`btn btn--outline btn--${size}`} disabled>
          Interest Requested
        </button>
      );
    }
    return (
      <button type="button" className={`btn btn--primary btn--${size}`} onClick={() => handleInterest(listing)}>
        I'm Interested
      </button>
    );
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Browse Produce</h1>
          <p className="dash-page__subtitle">Search and filter active listings from farmers.</p>
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">Filters</h2>
        <p className="dash-panel__intro">Narrow down listings by what matters most to you.</p>
        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="f-crop">Crop</label>
            <input id="f-crop" type="text" placeholder="e.g. Tomato" value={filters.crop} onChange={handleFilterChange('crop')} />
          </div>
          <div className="dash-field">
            <label htmlFor="f-qty">Min Quantity</label>
            <input id="f-qty" type="number" min="0" placeholder="e.g. 100" value={filters.minQuantity} onChange={handleFilterChange('minQuantity')} />
          </div>
          <div className="dash-field">
            <label htmlFor="f-location">Location</label>
            <input id="f-location" type="text" placeholder="Village / district" value={filters.location} onChange={handleFilterChange('location')} />
          </div>
        </div>
        <div className="dash-form__row" style={{ marginTop: 'var(--space-4)' }}>
          <div className="dash-field">
            <label htmlFor="f-quality">Quality / Grade</label>
            <select id="f-quality" value={filters.quality} onChange={handleFilterChange('quality')}>
              <option value="">Any grade</option>
              {grades.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="dash-field">
            <label htmlFor="f-price">Max Price ({'\u20B9'} per unit)</label>
            <input id="f-price" type="number" min="0" placeholder="e.g. 25" value={filters.maxPrice} onChange={handleFilterChange('maxPrice')} />
          </div>
          <div className="dash-field">
            <label htmlFor="f-date">Available From</label>
            <input id="f-date" type="date" value={filters.availableFrom} onChange={handleFilterChange('availableFrom')} />
          </div>
        </div>
        {filtersActive && (
          <button type="button" className="btn--text" onClick={() => setFilters(emptyFilters)} style={{ marginTop: 'var(--space-3)' }}>
            Clear filters
          </button>
        )}
      </div>

      {activeListings.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconBasket />}
            title="No produce listed yet"
            description="Once farmers publish active listings, they'll appear here for you to browse and filter."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconSearch />}
            title="No listings match your filters"
            description="Try widening your search — clear a filter or two and see what's available."
            action={<button type="button" className="btn btn--outline btn--sm" onClick={() => setFilters(emptyFilters)}>Clear filters</button>}
          />
        </div>
      ) : (
        <>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-ink-faint)' }}>
            {filtered.length} listing{filtered.length === 1 ? '' : 's'} found
          </p>
          <div className="listing-grid">
            {filtered.map((listing) => (
              <article key={listing.id} className="listing-card">
                {listing.photos?.[0] ? (
                  <img src={listing.photos[0]} alt={listing.crop} className="listing-card__photo" />
                ) : (
                  <PhotoPlaceholder />
                )}
                <div className="listing-card__top">
                  <span className="listing-card__crop">{listing.crop}</span>
                  <StatusBadge status={farmerVerification.status} />
                </div>
                {listing.grade ? <span className="listing-card__grade">{listing.grade}</span> : null}
                <div className="listing-card__meta">
                  <span><strong>{listing.quantity} {listing.unit}</strong> available</span>
                  <span>Price: <strong>{'\u20B9'}{listing.expectedPrice}</strong> / {listing.unit}</span>
                  <span>{listing.location || 'Location not set'}</span>
                  {listing.availabilityDate ? <span>Available from {listing.availabilityDate}</span> : null}
                </div>
                <div className="listing-card__actions">
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setDetailListing(listing)}>
                    View Details
                  </button>
                  {renderInterestAction(listing)}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {detailListing && (
        <ListingDetailModal
          listing={detailListing}
          verificationStatus={farmerVerification.status}
          onClose={() => setDetailListing(null)}
          actions={renderInterestAction(detailListing, 'sm')}
        />
      )}
    </div>
  );
};

export default BrowseProduce;
