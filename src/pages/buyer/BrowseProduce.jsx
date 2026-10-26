import { useMemo, useState } from 'react';
import { useBuyerData } from '../../context/BuyerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import ListingImage from '../../components/dashboard/ListingImage';
import ListingDetailModal from '../../components/dashboard/ListingDetailModal';
import { IconBasket, IconSearch } from '../../components/dashboard/icons';
import { isLocalListing } from '../../lib/marketplace';
import { useLanguage } from '../../context/LanguageContext';
import '../../components/dashboard/dashboard-ui.css';

const BrowseProduce = () => {
  const { listings, addToCart, cart, dataError, dataLoading } = useBuyerData();
  const { t, language } = useLanguage();
  const isKannada = language === 'kn';
  const trading = t.trading;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [detailListing, setDetailListing] = useState(null);
  const [actionError, setActionError] = useState('');
  const [cartMessage, setCartMessage] = useState('');

  const inCart = (id) => cart.some((item) => item.listingId === id);

  const activeListings = useMemo(() => listings.filter((l) => l.status === 'active'), [listings]);

  const cropCategories = useMemo(() => {
    const crops = Array.from(new Set(activeListings.map((l) => l.crop).filter(Boolean)));
    return ['All', ...crops];
  }, [activeListings]);

  const grades = useMemo(
    () => [...new Set(activeListings.map((l) => l.grade).filter(Boolean))],
    [activeListings]
  );

  const filtered = useMemo(() => {
    let result = activeListings.filter((l) => {
      // 1. Text search across crop, location, and farmerName
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCrop = l.crop?.toLowerCase().includes(q);
        const matchesLocation = l.location?.toLowerCase().includes(q);
        const matchesFarmer = l.farmerName?.toLowerCase().includes(q);
        if (!matchesCrop && !matchesLocation && !matchesFarmer) return false;
      }
      // 2. Crop pill
      if (selectedCrop !== 'All' && l.crop?.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }
      // 3. Grade
      if (selectedGrade && l.grade !== selectedGrade) {
        return false;
      }
      // 4. Max price
      if (maxPrice && Number(l.expectedPrice) > Number(maxPrice)) {
        return false;
      }
      return true;
    });

    // Sort order
    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => Number(a.expectedPrice) - Number(b.expectedPrice));
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => Number(b.expectedPrice) - Number(a.expectedPrice));
    } else if (sortBy === 'qty_desc') {
      result = [...result].sort((a, b) => Number(b.quantity) - Number(a.quantity));
    }

    return result;
  }, [activeListings, searchQuery, selectedCrop, selectedGrade, maxPrice, sortBy]);

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCrop !== 'All' || selectedGrade || maxPrice || sortBy !== 'default');

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCrop('All');
    setSelectedGrade('');
    setMaxPrice('');
    setSortBy('default');
  };

  const handleAddToCart = (listing) => {
    setActionError('');
    setCartMessage('');
    try {
      addToCart(listing);
      setCartMessage(trading.addedToCart.replace('{crop}', listing.crop));
    } catch (error) {
      setActionError(error.message);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">{isKannada ? 'ಉತ್ಪನ್ನಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ' : 'Browse Produce'}</h1>
          <p className="dash-page__subtitle">{isKannada ? 'ರೈತರಿಂದ ಲಭ್ಯವಿರುವ ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ ಮತ್ತು ಖರೀದಿಸಿ.' : 'Discover fresh farm produce directly from verified farmers.'}</p>
        </div>
      </div>

      {dataError && <div className="dash-banner dash-banner--error" role="alert">{dataError}</div>}
      {actionError && <div className="dash-banner dash-banner--error" role="alert">{actionError}</div>}
      {cartMessage && <div className="dash-banner dash-banner--success" role="status">{cartMessage}</div>}

      {/* Modern Search and Browse Toolbar */}
      <section className="browse-toolbar" aria-label="Search and filter produce">
        {/* Search Bar */}
        <div className="browse-searchbar">
          <span className="browse-searchbar__icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="browse-searchbar__input"
            placeholder={isKannada ? 'ಬೆಳೆ, ರೈತ ಅಥವಾ ಸ್ಥಳದ ಮೂಲಕ ಹುಡುಕಿ (ಉದಾ: ಟೊಮೇಟೊ, ಈರುಳ್ಳಿ)...' : 'Search by crop, farmer, or location (e.g. Tomato, Onion, Kolar)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search produce"
          />
          {searchQuery && (
            <button
              type="button"
              className="browse-searchbar__clear"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Crop Category Pills */}
        {cropCategories.length > 1 && (
          <div className="browse-pills" role="tablist" aria-label="Filter by crop">
            {cropCategories.map((crop) => (
              <button
                key={crop}
                type="button"
                className={`browse-pill ${selectedCrop === crop ? 'browse-pill--active' : ''}`}
                onClick={() => setSelectedCrop(crop)}
                role="tab"
                aria-selected={selectedCrop === crop}
              >
                {crop === 'All' ? (isKannada ? 'ಎಲ್ಲಾ ಬೆಳೆಗಳು' : 'All Produce') : crop}
              </button>
            ))}
          </div>
        )}

        {/* Compact Filters & Sorting */}
        <div className="browse-filters-row">
          <div className="browse-filters-group">
            <div className="browse-filter-item">
              <label htmlFor="filter-grade">{isKannada ? 'ದರ್ಜೆ:' : 'Grade:'}</label>
              <select
                id="filter-grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">{isKannada ? 'ಎಲ್ಲಾ ದರ್ಜೆ' : 'All Grades'}</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="browse-filter-item">
              <label htmlFor="filter-maxprice">{isKannada ? 'ಗರಿಷ್ಠ ಬೆಲೆ:' : 'Max Price:'}</label>
              <input
                id="filter-maxprice"
                type="number"
                min="0"
                placeholder={isKannada ? '₹ ಬೆಲೆ' : '₹ Price'}
                style={{ width: '85px' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="browse-filter-item">
              <label htmlFor="sort-by">{isKannada ? 'ವಿಂಗಡಿಸಿ:' : 'Sort By:'}</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">{isKannada ? 'ಪೂರ್ವನಿಯೋಜಿತ' : 'Featured'}</option>
                <option value="price_asc">{isKannada ? 'ಬೆಲೆ: ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚು' : 'Price: Low to High'}</option>
                <option value="price_desc">{isKannada ? 'ಬೆಲೆ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ' : 'Price: High to Low'}</option>
                <option value="qty_desc">{isKannada ? 'ಪ್ರಮಾಣ: ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆ' : 'Quantity: High to Low'}</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn--text"
              onClick={clearAllFilters}
              style={{ fontSize: 'var(--font-size-xs)' }}
            >
              {isKannada ? 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ' : 'Clear filters'}
            </button>
          )}
        </div>
      </section>

      {dataLoading ? (
        <div className="dash-panel" role="status">Loading marketplace listings…</div>
      ) : activeListings.length === 0 ? (
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
            action={<button type="button" className="btn btn--outline btn--sm" onClick={clearAllFilters}>{isKannada ? 'ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ' : 'Clear filters'}</button>}
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
                <ListingImage listing={listing} />
                <div className="listing-card__top">
                  <span className="listing-card__crop">{listing.crop}</span>
                  <StatusBadge status={listing.status} />
                </div>
                {listing.grade ? <span className="listing-card__grade">{listing.grade}</span> : null}
                <div className="listing-card__meta">
                  {listing.farmerName ? <span>Farmer: <strong>{listing.farmerName}</strong></span> : null}
                  <span><strong>{listing.quantity} {listing.unit}</strong> available</span>
                  <span>Price: <strong>{'\u20B9'}{listing.expectedPrice}</strong> / {listing.unit}</span>
                  <span>{listing.location || 'Location not set'}</span>
                  {listing.availabilityDate ? <span>Available from {listing.availabilityDate}</span> : null}
                </div>
                <div className="listing-card__actions listing-card__actions--two-only">
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setDetailListing(listing)}>
                    {isKannada ? 'ವಿವರಗಳು' : 'View Details'}
                  </button>
                  {isLocalListing(listing) ? (
                    <span className="listing-card__local-note" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {isKannada ? 'ಶೀಘ್ರದಲ್ಲೇ ಆರ್ಡರ್‌ಗೆ ಲಭ್ಯ' : 'Not orderable yet'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`btn--amazon-cart ${inCart(listing.id) ? 'is-in-cart' : ''}`}
                      onClick={() => handleAddToCart(listing)}
                    >
                      <span aria-hidden="true">🛒</span>
                      <span>{inCart(listing.id) ? (trading.cart?.inCart || 'In Cart ✓') : trading.addToCart}</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {detailListing && (
        <ListingDetailModal
          listing={detailListing}
          onClose={() => setDetailListing(null)}
          actions={(
            <>
              {isLocalListing(detailListing) ? null : (
                <button
                  type="button"
                  className={`btn--amazon-cart ${inCart(detailListing.id) ? 'is-in-cart' : ''}`}
                  onClick={() => handleAddToCart(detailListing)}
                >
                  <span aria-hidden="true">🛒</span>
                  <span>{inCart(detailListing.id) ? (trading.cart?.inCart || 'In Cart ✓') : trading.addToCart}</span>
                </button>
              )}
            </>
          )}
        />
      )}
    </div>
  );
};

export default BrowseProduce;
