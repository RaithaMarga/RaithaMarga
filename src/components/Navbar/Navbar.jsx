import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/useAuth';
import { readBuyerCart } from '../../lib/cart';
import logoMark from '../../assets/raithamarga-new-mark.jpg';
import './Navbar.css';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync cart count
  useEffect(() => {
    const updateCount = () => {
      if (!user?.uid) {
        setCartCount(0);
        return;
      }
      try {
        const items = readBuyerCart(user.uid);
        setCartCount(items.length);
      } catch {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('raithamarga-cart-changed', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('raithamarga-cart-changed', updateCount);
    };
  }, [user?.uid]);

  const NAV_LINKS = [
    { href: '#home', label: t.nav.home },
    { href: '#crops', label: language === 'kn' ? 'ಬೆಳೆಗಳು' : 'Crops' },
    { href: '#how-it-works', label: t.nav.how },
    { href: '#features', label: t.nav.features },
    { href: '#trust', label: t.nav.trust },
    { href: '#impact', label: t.nav.impact },
    { href: '#contact', label: t.nav.contact },
  ];

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container container">
        <a href="#home" className="navbar__logo">
          <span className="navbar__logo-mark">
            <img src={logoMark} alt="RaithaMarga" width="40" height="40" />
          </span>
          <span className="navbar__logo-text">RaithaMarga</span>
        </a>

        <nav className="navbar__nav" role="navigation" aria-label="Primary">
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="navbar__link">{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__actions">
          {/* Exact Amazon Header Cart Button */}
          <Link
            to="/buyer/dashboard/cart"
            className="amazon-header-cart"
            aria-label={language === 'kn' ? `ಕಾರ್ಟ್ (${cartCount})` : `Cart (${cartCount})`}
            title={language === 'kn' ? 'ಕಾರ್ಟ್ ವೀಕ್ಷಿಸಿ' : 'View Cart'}
          >
            <div className="amazon-header-cart__icon-wrap">
              <span className="amazon-header-cart__count">{cartCount}</span>
              <svg
                className="amazon-header-cart__svg"
                viewBox="0 0 38 35"
                width="38"
                height="35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M1 2.5h5.5l3.8 20.2h20.4l4.3-14.2H8"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="13.5" cy="28.5" r="3" fill="currentColor" />
                <circle cx="27.5" cy="28.5" r="3" fill="currentColor" />
              </svg>
            </div>
            <span className="amazon-header-cart__title">{language === 'kn' ? 'ಕಾರ್ಟ್' : 'Cart'}</span>
          </Link>

          <button
            className="navbar__lang-toggle"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            <span key={language} className="navbar__lang-toggle-text">{t.nav.langToggle}</span>
          </button>

          <Link to="/login" className="navbar__btn navbar__btn--outline">{t.nav.login}</Link>
          <Link to="/get-started" className="navbar__btn navbar__btn--primary">
            <span className="navbar__btn-shine" aria-hidden="true" />
            {t.nav.getStarted}
          </Link>
        </div>

        <button
          className="navbar__hamburger"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`} />
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`} />
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`} />
        </button>
      </div>

      <div className={`navbar__mobile ${isMenuOpen ? 'navbar__mobile--open' : ''}`}>
        <nav className="navbar__mobile-nav">
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="navbar__mobile-link" onClick={closeMenu}>{link.label}</a>
              </li>
            ))}
          </ul>
          <div className="navbar__mobile-actions">
            <Link
              to="/buyer/dashboard/cart"
              className="amazon-header-cart amazon-header-cart--mobile"
              onClick={closeMenu}
            >
              <div className="amazon-header-cart__icon-wrap">
                <span className="amazon-header-cart__count">{cartCount}</span>
                <svg
                  className="amazon-header-cart__svg"
                  viewBox="0 0 38 35"
                  width="36"
                  height="33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M1 2.5h5.5l3.8 20.2h20.4l4.3-14.2H8"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="13.5" cy="28.5" r="3" fill="currentColor" />
                  <circle cx="27.5" cy="28.5" r="3" fill="currentColor" />
                </svg>
              </div>
              <span className="amazon-header-cart__title">{language === 'kn' ? 'ಕಾರ್ಟ್' : 'Cart'}</span>
            </Link>

            <button className="navbar__lang-toggle navbar__lang-toggle--mobile" onClick={toggleLanguage}>
              {t.nav.langToggle}
            </button>

            <Link to="/login" className="navbar__btn navbar__btn--outline navbar__btn--full" onClick={closeMenu}>{t.nav.login}</Link>
            <Link to="/get-started" className="navbar__btn navbar__btn--primary navbar__btn--full" onClick={closeMenu}>{t.nav.getStarted}</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
