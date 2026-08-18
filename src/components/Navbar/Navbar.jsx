import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'kn' : 'en');

  return (
    <header className="navbar">
      <div className="navbar__container container">
        {/* Logo */}
        <a href="/" className="navbar__logo">
          <span className="navbar__logo-icon">🌾</span>
          <span className="navbar__logo-text">RaithaMarga</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="navbar__nav" role="navigation">
          <ul className="navbar__links">
            <li><a href="/" className="navbar__link">Home</a></li>
            <li><a href="/how-it-works" className="navbar__link">How It Works</a></li>
            <li><a href="/farmers" className="navbar__link">For Farmers</a></li>
            <li><a href="/buyers" className="navbar__link">For Buyers</a></li>
            <li><a href="/trust" className="navbar__link">Trust</a></li>
            <li><a href="/about" className="navbar__link">About</a></li>
          </ul>
        </nav>

        {/* Right side actions */}
        <div className="navbar__actions">
          <button
            className="navbar__lang-toggle"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
          </button>
          <a href="/login" className="navbar__btn navbar__btn--outline">Login</a>
          <a href="/register" className="navbar__btn navbar__btn--primary">Get Started</a>
        </div>

        {/* Mobile menu button */}
        <button
          className="navbar__hamburger"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`}></span>
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`}></span>
          <span className={`navbar__hamburger-line ${isMenuOpen ? 'navbar__hamburger-line--open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${isMenuOpen ? 'navbar__mobile--open' : ''}`}>
        <nav className="navbar__mobile-nav">
          <ul className="navbar__mobile-links">
            <li><a href="/" className="navbar__mobile-link" onClick={toggleMenu}>Home</a></li>
            <li><a href="/how-it-works" className="navbar__mobile-link" onClick={toggleMenu}>How It Works</a></li>
            <li><a href="/farmers" className="navbar__mobile-link" onClick={toggleMenu}>For Farmers</a></li>
            <li><a href="/buyers" className="navbar__mobile-link" onClick={toggleMenu}>For Buyers</a></li>
            <li><a href="/trust" className="navbar__mobile-link" onClick={toggleMenu}>Trust</a></li>
            <li><a href="/about" className="navbar__mobile-link" onClick={toggleMenu}>About</a></li>
          </ul>
          <div className="navbar__mobile-actions">
            <a href="/login" className="navbar__btn navbar__btn--outline navbar__btn--full">Login</a>
            <a href="/register" className="navbar__btn navbar__btn--primary navbar__btn--full">Get Started</a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;