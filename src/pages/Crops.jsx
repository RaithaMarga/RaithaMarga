import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import CropCard from '../components/CropCard';
import { useLanguage } from '../context/LanguageContext';
import { IMAGE_CROPS } from '../data/crops';
import './Crops.css';

const ITEMS_PER_PAGE = 6;

const Crops = () => {
  const { t, language } = useLanguage();
  const copy = t.crops;

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter crops based on category
  const filteredCrops = useMemo(() => {
    if (activeCategory === 'VEGETABLE') {
      return IMAGE_CROPS.filter((c) => c.category === 'Vegetable');
    }
    if (activeCategory === 'FRUIT') {
      return IMAGE_CROPS.filter((c) => c.category === 'Fruit');
    }
    return IMAGE_CROPS;
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredCrops.length / ITEMS_PER_PAGE) || 1;

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // Paginated slice
  const paginatedCrops = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCrops.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCrops, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isKannada = language === 'kn';

  return (
    <>
      <Navbar />
      <main className="crops-page">
        <div className="container">
          <div className="crops-page__header">
            <Link to="/" className="crops-page__home-pill" aria-label={isKannada ? 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ' : 'Go to Home'}>
              <svg
                className="crops-page__home-icon"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{isKannada ? 'ಮುಖಪುಟ' : 'Home'}</span>
            </Link>

            <span className="eyebrow">{copy.eyebrow}</span>
            <h1 className="crops-page__title">{copy.title}</h1>
            <p className="crops-page__subtitle">{copy.subtitle}</p>

            {/* Filter Tabs */}
            <div className="crops-page__filters" role="tablist" aria-label="Crop Categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'ALL'}
                className={`crops-filter-pill ${activeCategory === 'ALL' ? 'crops-filter-pill--active' : ''}`}
                onClick={() => handleCategoryChange('ALL')}
              >
                {copy.allCrops || (isKannada ? 'ಎಲ್ಲಾ ಬೆಳೆಗಳು' : 'All Crops')} ({IMAGE_CROPS.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'VEGETABLE'}
                className={`crops-filter-pill ${activeCategory === 'VEGETABLE' ? 'crops-filter-pill--active' : ''}`}
                onClick={() => handleCategoryChange('VEGETABLE')}
              >
                {copy.vegetable} ({IMAGE_CROPS.filter((c) => c.category === 'Vegetable').length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'FRUIT'}
                className={`crops-filter-pill ${activeCategory === 'FRUIT' ? 'crops-filter-pill--active' : ''}`}
                onClick={() => handleCategoryChange('FRUIT')}
              >
                {copy.fruit} ({IMAGE_CROPS.filter((c) => c.category === 'Fruit').length})
              </button>
            </div>

            {/* Range counter */}
            <p className="crops-page__meta">
              {isKannada
                ? `${filteredCrops.length} ಬೆಳೆಗಳಲ್ಲಿ ${Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredCrops.length,
                  )}-${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredCrops.length,
                  )} ತೋರಿಸಲಾಗುತ್ತಿದೆ`
                : `Showing ${Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredCrops.length,
                  )}-${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredCrops.length,
                  )} of ${filteredCrops.length} crops`}
            </p>
          </div>

          {/* Grid */}
          <div className="crop-showcase__grid crops-page__grid">
            {paginatedCrops.map((crop) => (
              <CropCard key={crop.id} crop={crop} copy={copy} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="crops-pagination" aria-label="Crops list pagination">
              <button
                type="button"
                className="crops-pagination__btn crops-pagination__prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ← {copy.previous || (isKannada ? 'ಹಿಂದಿನ' : 'Previous')}
              </button>

              <div className="crops-pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`crops-pagination__page-number ${
                      pageNum === currentPage ? 'crops-pagination__page-number--active' : ''
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="crops-pagination__btn crops-pagination__next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                {copy.next || (isKannada ? 'ಮುಂದಿನ' : 'Next')} →
              </button>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Crops;
