import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import logoMark from '../../assets/logo-mark.png';
import './DashboardLayout.css';

const DashboardLayout = ({ role, navItems, profileName, verificationStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);

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

        <Link to="/" className="dashlayout__exit">
          <span aria-hidden="true">←</span> Back to homepage
        </Link>
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

          <span className="dashlayout__role-tag">{role} Dashboard</span>

          <div className="dashlayout__identity">
            {verificationStatus ? (
              <span className={`dashlayout__verif dashlayout__verif--${verificationStatus}`}>
                {verificationStatus === 'verified' ? 'Verified' :
                  verificationStatus === 'pending' ? 'Pending Review' :
                  verificationStatus === 'needs_attention' ? 'Needs Attention' : 'Not Verified'}
              </span>
            ) : null}
            <span className="dashlayout__avatar" aria-hidden="true">
              {(profileName || 'F').trim().charAt(0).toUpperCase()}
            </span>
            <span className="dashlayout__name">{profileName || 'Your farm'}</span>
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
