import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const NAV_LINKS = [
    { href: '#home', label: t.nav.home },
    { href: '#how-it-works', label: t.nav.how },
    { href: '#features', label: t.nav.features },
    { href: '#impact', label: t.nav.impact },
  ];

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container container">
        <a href="#home" className="navbar__logo">
          <span className="navbar__logo-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <circle cx="16" cy="16" r="15" fill="var(--color-primary)" />
              <path d="M16 24c0-6 3-11 7-13-2 5-2 10 0 13" fill="none" stroke="var(--color-gold-light)" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M16 24c0-6-3-11-7-13-2 5-2 10 0 13" fill="none" stroke="var(--color-gold-light)" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="16" y1="24" x2="16" y2="9" stroke="var(--color-gold-light)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
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
          <button
            className="navbar__lang-toggle"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            <span key={language} className="navbar__lang-toggle-text">{t.nav.langToggle}</span>
          </button>
          <a href="#login" className="navbar__btn navbar__btn--outline">{t.nav.login}</a>
          <a href="#get-started" className="navbar__btn navbar__btn--primary">
            <span className="navbar__btn-shine" aria-hidden="true" />
            {t.nav.getStarted}
          </a>
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
            <button className="navbar__lang-toggle navbar__lang-toggle--mobile" onClick={toggleLanguage}>
              {t.nav.langToggle}
            </button>
            <a href="#login" className="navbar__btn navbar__btn--outline navbar__btn--full" onClick={closeMenu}>{t.nav.login}</a>
            <a href="#get-started" className="navbar__btn navbar__btn--primary navbar__btn--full" onClick={closeMenu}>{t.nav.getStarted}</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
