import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import HomeCart from '../HomeCart';
import logoMark from '../../assets/raithamarga-new-mark.jpg';
import './Navbar.css';


const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const NAV_LINKS = [
    { href: '/#home', label: language === 'kn' ? 'ಮುಖಪುಟ' : 'Home' },
    { href: '/#crops', label: language === 'kn' ? 'ಬೆಳೆಗಳು' : 'Crops' },
    { href: '/#how-it-works', label: language === 'kn' ? 'ಕಾರ್ಯವಿಧಾನ' : 'How it Works' },
    { href: '/#trust', label: language === 'kn' ? 'ನಂಬಿಕೆ' : 'Trust' },
    { href: '/#verification', label: language === 'kn' ? 'ಪರಿಶೀಲನೆ' : 'Verification' },
    { href: '/#impact', label: language === 'kn' ? 'ಪರಿಣಾಮ' : 'Impact' },
    { href: '/#contact', label: language === 'kn' ? 'ಸಂಪರ್ಕ' : 'Contact' },
  ];

  const toggleMenu = () => setIsMenuOpen((v) => !v);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar__container container">
        <a href="/#home" className="navbar__logo">
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

        <HomeCart />
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

            <Link to="/login" className="navbar__btn navbar__btn--outline navbar__btn--full" onClick={closeMenu}>{t.nav.login}</Link>
            <Link to="/get-started" className="navbar__btn navbar__btn--primary navbar__btn--full" onClick={closeMenu}>{t.nav.getStarted}</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
