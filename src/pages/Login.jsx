import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import logoSeal from '../assets/logo-seal.png';
import fieldBg from '../assets/login-bg-field.jpg';
import './Login.css';

const Login = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login, resetPassword } = useAuth();
  const l = t?.login || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Role: 'farmer' | 'buyer'
  const initialRole = searchParams.get('role');
  const [role, setRole] = useState(initialRole === 'buyer' ? 'buyer' : 'farmer');

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'farmer' || r === 'buyer') {
      setRole(r);
    }
  }, [searchParams]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Submission & errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Optional admin modal/view toggle for district administrators
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const clearError = (field) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = l.errorEmail || 'Enter a valid email address.';
    }
    if (!password || password.length < 6) {
      nextErrors.password = l.errorPassword || 'Password must be at least 6 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const signedInUser = await login({ email, role, password, rememberMe });
      navigate(signedInUser.role === 'buyer' ? '/buyer/dashboard' : '/farmer/dashboard');
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email address first.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setErrors((prev) => ({ ...prev, form: 'Password reset email sent. Check your inbox.' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!adminEmail.trim()) nextErrors.adminEmail = l.errorAdminEmail;
    if (!adminPassword || adminPassword.length < 4) nextErrors.adminPassword = l.errorAdminPassword;
    if (!adminPin) nextErrors.adminPin = l.errorAdminPin;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors((prev) => ({
      ...prev,
      form: 'Administrator authentication is not configured yet. Contact the platform administrator.',
    }));
  };

  return (
    <div className="login-page">
      {/* ================= LEFT: HERO BRAND PANEL ================= */}
      <div className="login-panel" aria-hidden="true">
        {/* Top-left decorative leaves watermark */}
        <div className="login-panel__leaf-watermark">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 10C35 25 50 60 45 95C30 90 15 75 10 50Z"
              fill="rgba(255, 255, 255, 0.08)"
            />
            <path
              d="M35 15C60 20 85 45 90 80C70 82 50 70 40 50Z"
              fill="rgba(255, 255, 255, 0.06)"
            />
            <path
              d="M5 45C25 50 40 70 38 95C22 93 12 80 5 65Z"
              fill="rgba(255, 255, 255, 0.05)"
            />
          </svg>
        </div>

        {/* Lower background landscape field photo */}
        <div
          className="login-panel__bg-field"
          style={{ backgroundImage: `url(${fieldBg})` }}
        />

        {/* Gradient overlay to smoothly blend dark green into the field */}
        <div className="login-panel__gradient-overlay" />

        {/* Panel Content */}
        <div className="login-panel__content">
          <Link to="/" className="login-panel__logo" aria-label="RaithaMarga Home">
            <img src={logoSeal} alt="RaithaMarga" width="76" height="76" />
          </Link>

          <h1 className="login-panel__title">
            {l.panelTitle || 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ಒಂದು ವೇದಿಕೆ'}
          </h1>

          <p className="login-panel__subtitle">
            {l.panelSubtitle || 'ನೇರ ಸಂಪರ್ಕ, ನ್ಯಾಯಯುತ ಬೆಲೆಗಳು ಮತ್ತು ಡಿಜಿಟಲ್ ತೂಕದೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ವ್ಯವಹಾರ.'}
          </p>

          <ul className="login-panel__points">
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{l.feature1 || 'ನ್ಯಾಯಸಮ್ಮತ ಬೆಲೆಗಳು'}</span>
            </li>
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{l.feature2 || 'ಪಾರದರ್ಶಕ ವ್ಯವಹಾರಗಳು'}</span>
            </li>
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>{l.feature3 || 'ರೈತರಿಗೆ ಸಬಲೀಕರಣ'}</span>
            </li>
          </ul>

          {/* Slanted cursive script text at bottom left */}
          <div className="login-panel__script">
            <span>{l.scriptText1 || "Farmer's Path"}</span>
            <span>{l.scriptText2 || 'to a Better Tomorrow'}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: FORM SIDE ================= */}
      <div className="login-form-side">
        {/* Top bar with home button and language switcher */}
        <header className="login-topbar">
          <Link to="/" className="login-home-btn" aria-label="Go to Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{language === 'kn' ? 'ಮುಖಪುಟ' : 'Home'}</span>
          </Link>

          <div className="login-lang-switch">
            <button
              type="button"
              className={`login-lang-pill ${language === 'kn' ? 'login-lang-pill--active' : ''}`}
              onClick={() => setLanguage('kn')}
              aria-label="Switch to Kannada"
            >
              <svg
                className="login-lang-globe"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>ಕನ್ನಡ</span>
              <svg
                className="login-lang-chevron"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              type="button"
              className={`login-lang-link ${language === 'en' ? 'login-lang-link--active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
          </div>
        </header>

        {/* Form Center Wrapper */}
        <div className="login-form-wrap">
          <div className="login-card-container">
            {/* Standard User Login Form */}
            {!showAdminLogin ? (
              <>
                {/* Role Selector Pill Bar */}
                <div className="login-role-bar">
                  <div className="login-role-bar__label">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                    <span>{l.selectRole || 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ'}</span>
                  </div>

                  <div className="login-role-bar__pills" role="radiogroup" aria-label={l.selectRole || 'Select Role'}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={role === 'farmer'}
                      className={`login-role-pill ${role === 'farmer' ? 'login-role-pill--active' : ''}`}
                      onClick={() => setRole('farmer')}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{l.roleFarmer || 'ರೈತ'}</span>
                    </button>

                    <button
                      type="button"
                      role="radio"
                      aria-checked={role === 'buyer'}
                      className={`login-role-pill ${role === 'buyer' ? 'login-role-pill--active' : ''}`}
                      onClick={() => setRole('buyer')}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{l.roleBuyer || 'ಖರೀದಿದಾರ'}</span>
                    </button>
                  </div>
                </div>

                {/* Form Heading */}
                <div className="login-heading">
                  <h2 className="login-title">
                    {role === 'farmer'
                      ? (l.farmerTitle || 'ರೈತ ಸೈನ್ ಇನ್')
                      : (l.buyerTitle || 'ಖರೀದಿದಾರ ಸೈನ್ ಇನ್')}
                  </h2>
                  <p className="login-subtitle">
                    {role === 'farmer'
                      ? (l.farmerSubtitle || 'ನಿಮ್ಮ ರೈತ ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ.')
                      : (l.buyerSubtitle || 'ನಿಮ್ಮ ಖರೀದಿದಾರ ಖಾತೆಗೆ ಪ್ರವೇಶಿಸಿ.')}
                  </p>
                </div>

                {/* Card Container */}
                <div className="login-card">
                  <form onSubmit={handleSubmit} noValidate>
                    {errors.form && <p className="login-error-msg" role="alert">{errors.form}</p>}

                    {/* Firebase account email */}
                    <div className={`login-input-row ${errors.email ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg
                          className="login-input-icon"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder={l.emailPlaceholder || 'Email address'}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('email');
                          clearError('form');
                        }}
                      />
                    </div>
                    {errors.email && <span className="login-error-msg">{errors.email}</span>}

                    {/* Password Input Box */}
                    <div className={`login-input-row ${errors.password ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg
                          className="login-input-icon"
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder={l.passwordPlaceholder || 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearError('password');
                          clearError('form');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && <span className="login-error-msg">{errors.password}</span>}

                    {/* Options: Remember me & Forgot password */}
                    <div className="login-options">
                      <label className="login-remember-wrap">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="login-checkbox-box">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="login-remember-text">{l.rememberMe || 'ನನ್ನನ್ನು ನೆನಪಿಡಿ'}</span>
                      </label>

                      <button type="button" className="login-forgot-link" onClick={handlePasswordReset}>
                        {l.forgotPassword || 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರೆ?'}
                      </button>
                    </div>

                    {/* Primary Sign In Button */}
                    <button
                      type="submit"
                      className={`login-submit-btn ${isSubmitting ? 'login-submit-btn--loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      <svg
                        className="login-btn-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>{isSubmitting ? (l.signingIn || 'Signing in...') : (l.signIn || 'ಸೈನ್ ಇನ್')}</span>
                    </button>

                  </form>
                </div>

                {/* Footer Register Link */}
                <div className="login-footer">
                  <span className="login-footer-text">{l.noAccount || 'ಖಾತೆ ಇಲ್ಲವೇ?'}</span>{' '}
                  <Link to="/register" className="login-footer-link">
                    {l.registerHere || 'ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ →'}
                  </Link>
                </div>

                {/* Subtle District Admin Access Link */}
                <div className="login-admin-subtle">
                  <button
                    type="button"
                    className="login-admin-toggle-btn"
                    onClick={() => setShowAdminLogin(true)}
                  >
                    🛡️ {l.adminTitle || 'ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್'}
                  </button>
                </div>
              </>
            ) : (
              /* District Admin Login Modal / View */
              <div className="login-admin-container">
                <div className="login-admin-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>{l.adminBadge || 'ಅಧಿಕೃತ ಅಧಿಕಾರಿಗಳಿಗೆ ಮಾತ್ರ'}</span>
                </div>

                <div className="login-heading">
                  <h2 className="login-title">{l.adminTitle || 'ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್'}</h2>
                  <p className="login-subtitle">{l.adminSubtitle || 'ಜಿಲ್ಲಾ ಆಡಳಿತ ಮತ್ತು ಪರಿಶೀಲನಾ ಪ್ರಾಧಿಕಾರದ ಸೈನ್ ಇನ್.'}</p>
                </div>

                <div className="login-card">
                  <form onSubmit={handleAdminSubmit} noValidate>
                    {errors.form && <p className="login-error-msg" role="alert">{errors.form}</p>}
                    <div className={`login-input-row ${errors.adminEmail ? 'login-input-row--error' : ''}`}>
                      <input
                        type="text"
                        placeholder={l.adminEmailPlaceholder || 'admin@raithamarga.in'}
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          clearError('adminEmail');
                        }}
                      />
                    </div>
                    {errors.adminEmail && <span className="login-error-msg">{errors.adminEmail}</span>}

                    <div className={`login-input-row ${errors.adminPassword ? 'login-input-row--error' : ''}`}>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder={l.adminPasswordLabel || 'ಅಡ್ಮಿನ್ ಪಾಸ್‌ವರ್ಡ್'}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          clearError('adminPassword');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowAdminPassword((p) => !p)}
                      >
                        {showAdminPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.adminPassword && <span className="login-error-msg">{errors.adminPassword}</span>}

                    <div className={`login-input-row ${errors.adminPin ? 'login-input-row--error' : ''}`}>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder={l.adminPinPlaceholder || '4-ಅಂಕಿಯ ಪಿನ್ (ಉದಾ: 9999)'}
                        value={adminPin}
                        onChange={(e) => {
                          setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                          clearError('adminPin');
                        }}
                      />
                    </div>
                    {errors.adminPin && <span className="login-error-msg">{errors.adminPin}</span>}

                    <button
                      type="submit"
                      className="login-submit-btn"
                      disabled={isSubmitting}
                      style={{ marginTop: '14px' }}
                    >
                      {isSubmitting ? (l.signingIn || 'Signing in...') : (l.adminSubmit || 'ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್ ಪ್ರವೇಶಿಸಿ')}
                    </button>

                    <button
                      type="button"
                      className="login-demo-btn"
                      style={{ marginTop: '10px' }}
                      onClick={() => {
                        setAdminEmail('admin@raithamarga.in');
                        setAdminPassword('admin123');
                        setAdminPin('9999');
                      }}
                    >
                      ⚡ Quick Fill Demo Admin
                    </button>

                    <button
                      type="button"
                      className="login-admin-back-btn"
                      onClick={() => setShowAdminLogin(false)}
                    >
                      ← Back to User Login
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;