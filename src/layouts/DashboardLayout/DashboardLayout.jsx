import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/useAuth';
import logoMark from '../../assets/logo-mark.png';
import './DashboardLayout.css';

const DashboardLayout = ({ role, navItems, profileName, verificationStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const isKannada = language === 'kn';
  const d = t.dashboard || {};

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const roleLabel = role === 'Farmer'
    ? (isKannada ? 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Farmer Dashboard')
    : (isKannada ? 'ಖರೀದಿದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' : 'Buyer Dashboard');

  const verifLabels = {
    verified: isKannada ? 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : 'Verified',
    pending: isKannada ? 'ಪರಿಶೀಲನೆ ಬಾಕಿ ಇದೆ' : 'Pending Review',
    needs_attention: isKannada ? 'ಗಮನ ಅಗತ್ಯವಿದೆ' : 'Needs Attention',
    rejected: isKannada ? 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ' : 'Not Approved',
    not_submitted: isKannada ? 'ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ' : 'Not Verified',
  };

  const currentVerif = verifLabels[verificationStatus] || (isKannada ? 'ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ' : 'Not Verified');

  return (
    <div className="dashlayout">
      <aside className={`dashlayout__sidebar ${menuOpen ? 'dashlayout__sidebar--open' : ''}`}>
        <Link to="/" className="dashlayout__brand" onClick={() => setMenuOpen(false)}>
          <img src={logoMark} alt="RaithaMarga" width="34" height="34" />
          <span>RaithaMarga</span>
        </Link>

        <nav className="dashlayout__nav" aria-label={`${role} dashboard navigation`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `dashlayout__navlink ${isActive ? 'dashlayout__navlink--active' : ''}`}
            >
              <span className="dashlayout__navicon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="dashlayout__sidebar-footer">
          <button
            type="button"
            className="dashlayout__sidebar-btn dashlayout__sidebar-lang"
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            <span aria-hidden="true">🌐</span>
            <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
          </button>

          <Link to="/" className="dashlayout__exit" onClick={() => setMenuOpen(false)}>
            <span aria-hidden="true">←</span>
            <span>{d.backToHome || (isKannada ? 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ' : 'Back to homepage')}</span>
          </Link>

          <button
            type="button"
            className="dashlayout__sidebar-btn dashlayout__sidebar-logout"
            onClick={handleLogout}
            aria-label={isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="dashlayout__scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="dashlayout__main">
        <header className="dashlayout__topbar">
          <button
            type="button"
            className="dashlayout__menu-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <span className="dashlayout__role-tag">{roleLabel}</span>

          <div className="dashlayout__identity">
            {/* Topbar Language Switcher */}
            <button
              type="button"
              className="dashlayout__lang-btn"
              onClick={toggleLanguage}
              aria-label="Switch language"
            >
              <span aria-hidden="true">🌐</span>
              <span>{isKannada ? 'English' : 'ಕನ್ನಡ'}</span>
            </button>

            {verificationStatus ? (
              <span className={`dashlayout__verif dashlayout__verif--${verificationStatus}`}>
                {currentVerif}
              </span>
            ) : null}

            <span className="dashlayout__avatar" aria-hidden="true">
              {(profileName || (isKannada ? 'ರೈ' : 'F')).trim().charAt(0).toUpperCase()}
            </span>
            <span className="dashlayout__name">
              {profileName || (isKannada ? (role === 'Farmer' ? 'ನಿಮ್ಮ ಹೊಲ' : 'ನಿಮ್ಮ ಸಂಸ್ಥೆ') : (role === 'Farmer' ? 'Your farm' : 'Your business'))}
            </span>

            {/* Topbar Logout Button */}
            <button
              type="button"
              className="dashlayout__topbar-logout"
              onClick={handleLogout}
              title={isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout'}
              aria-label={isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{isKannada ? 'ಲಾಗ್‌ಔಟ್' : 'Logout'}</span>
            </button>
          </div>
        </header>

        <main className="dashlayout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
