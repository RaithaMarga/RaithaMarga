import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import { STORAGE_KEYS } from '../data/storageKeys';
import logoSeal from '../assets/logo-seal.png';
import fieldBg from '../assets/login-bg-field.jpg';
import './Login.css';
import './Register.css';

const Register = () => {
  const { t, language, setLanguage } = useLanguage();
  const r = t?.register || {};
  const navigate = useNavigate();
  const { register } = useAuth();

  // Role: 'farmer' | 'buyer'
  const [role, setRole] = useState('farmer');

  // Simple registration state: Email, Password, Confirm Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(true);

  // Optional Name
  const [fullName, setFullName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
  };

  const fillDemoFarmer = () => {
    setRole('farmer');
    setEmail('farmer.demo@raithamarga.in');
    setFullName('ರೈತ ಬಸವರಾಜ್');
    setPassword('Farmer@123');
    setConfirmPassword('Farmer@123');
    setErrors({});
  };

  const fillDemoBuyer = () => {
    setRole('buyer');
    setEmail('buyer.demo@raithamarga.in');
    setFullName('Kolar Agro Trader');
    setPassword('Buyer@123');
    setConfirmPassword('Buyer@123');
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = r.errorEmail || (language === 'kn' ? 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ.' : 'Enter a valid email address.');
    }
    if (!password || password.length < 6) {
      nextErrors.password = r.errorPassword || (language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು.' : 'Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = r.errorPasswordMatch || (language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.' : 'Passwords do not match.');
    }
    if (!terms) {
      nextErrors.terms = r.errorTerms || (language === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಿ.' : 'Please accept terms & conditions.');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const derivedDisplayName = fullName.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    try {
      if (role === 'farmer') {
        const profile = {
          fullName: derivedDisplayName,
          phone: '',
          village: 'Kolar',
          taluk: 'Kolar',
          district: 'Kolar',
          state: 'Karnataka',
          landAcres: 2,
        };

        await register({
          email: email.trim(),
          password,
          role,
          displayName: derivedDisplayName,
          profile,
        });

        localStorage.setItem(STORAGE_KEYS.FARMER_PROFILE, JSON.stringify({
          name: profile.fullName,
          phone: '',
          village: profile.village,
          taluk: profile.taluk,
          district: profile.district,
          state: profile.state,
          landSizeAcres: '2',
          preferredCrops: 'Tomato',
        }));

        navigate('/farmer/dashboard');
      } else {
        const profile = {
          fullName: derivedDisplayName,
          businessName: `${derivedDisplayName} Trading Co.`,
          district: 'Kolar',
        };

        await register({
          email: email.trim(),
          password,
          role,
          displayName: derivedDisplayName,
          profile,
        });

        localStorage.setItem(STORAGE_KEYS.BUYER_PROFILE, JSON.stringify({
          businessName: profile.businessName,
          contactName: profile.fullName,
          phone: '',
          location: profile.district,
          businessType: 'trader',
        }));

        navigate('/buyer/dashboard');
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page register-page">
      {/* ================= LEFT: HERO BRAND PANEL ================= */}
      <div className="login-panel" aria-hidden="true">
        <div className="login-panel__leaf-watermark">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10C35 25 50 60 45 95C30 90 15 75 10 50Z" fill="rgba(255, 255, 255, 0.08)" />
            <path d="M35 15C60 20 85 45 90 80C70 82 50 70 40 50Z" fill="rgba(255, 255, 255, 0.06)" />
            <path d="M5 45C25 50 40 70 38 95C22 93 12 80 5 65Z" fill="rgba(255, 255, 255, 0.05)" />
          </svg>
        </div>

        <div
          className="login-panel__bg-field"
          style={{ backgroundImage: `url(${fieldBg})` }}
        />

        <div className="login-panel__gradient-overlay" />

        <div className="login-panel__content">
          <Link to="/" className="login-panel__logo" aria-label="RaithaMarga Home">
            <img src={logoSeal} alt="RaithaMarga" width="76" height="76" />
          </Link>

          <h1 className="login-panel__title">
            {r.panelTitle || (language === 'kn' ? 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ಒಂದು ವೇದಿಕೆ' : 'Direct Farm-to-Buyer Marketplace')}
          </h1>

          <p className="login-panel__subtitle">
            {r.panelSubtitle || (language === 'kn' ? 'ನೇರ ಸಂಪರ್ಕ, ನ್ಯಾಯಯುತ ಬೆಲೆಗಳು ಮತ್ತು ಡಿಜಿಟಲ್ ತೂಕದೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ವ್ಯವಹಾರ.' : 'Direct trade, verified digital weights, and transparent market rates without middlemen.')}
          </p>

          <ul className="login-panel__points">
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{r.feature1 || (language === 'kn' ? 'ನ್ಯಾಯಸಮ್ಮತ ಬೆಲೆಗಳು' : 'Fair Mandi Prices')}</span>
            </li>
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{r.feature2 || (language === 'kn' ? 'ಪಾರದರ್ಶಕ ವ್ಯವಹಾರಗಳು' : '100% Transparent Deals')}</span>
            </li>
            <li>
              <span className="login-panel__check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>{r.feature3 || (language === 'kn' ? 'ರೈತರಿಗೆ ಸಬಲೀಕರಣ' : 'Empowering Karnataka Farmers')}</span>
            </li>
          </ul>

          <div className="login-panel__script">
            <span>{r.scriptText1 || "Farmer's Path"}</span>
            <span>{r.scriptText2 || 'to a Better Tomorrow'}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: REGISTRATION FORM SIDE ================= */}
      <div className="login-form-side">
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
              <svg className="login-lang-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>ಕನ್ನಡ</span>
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

        <div className="login-form-wrap">
          <div className="login-card-container register-card-container">
            {/* Role Selector Pill Bar */}
            <div className="login-role-bar">
              <div className="login-role-bar__label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <span>{r.selectRole || (language === 'kn' ? 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ' : 'I am registering as:')}</span>
              </div>

              <div className="login-role-bar__pills" role="radiogroup" aria-label="Select Role">
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'farmer'}
                  className={`login-role-pill ${role === 'farmer' ? 'login-role-pill--active' : ''}`}
                  onClick={() => switchRole('farmer')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>🌾 {r.roleFarmer || (language === 'kn' ? 'ರೈತ' : 'Farmer')}</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'buyer'}
                  className={`login-role-pill ${role === 'buyer' ? 'login-role-pill--active' : ''}`}
                  onClick={() => switchRole('buyer')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>🏢 {r.roleBuyer || (language === 'kn' ? 'ಖರೀದಿದಾರ' : 'Buyer')}</span>
                </button>
              </div>
            </div>

            {/* Heading */}
            <div className="login-heading">
              <h2 className="login-title">
                {role === 'farmer'
                  ? (language === 'kn' ? '🌾 ರೈತ ನೋಂದಣಿ' : '🌾 Farmer Registration')
                  : (language === 'kn' ? '🏢 ಖರೀದಿದಾರ ನೋಂದಣಿ' : '🏢 Buyer Registration')}
              </h2>
              <p className="login-subtitle">
                {language === 'kn'
                  ? 'ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ ಸರಳವಾಗಿ ನೋಂದಾಯಿಸಿ.'
                  : 'Quick register with just your Email and Password.'}
              </p>
            </div>

            {/* Quick Demo Pre-fill Bar */}
            <div className="register-demo-bar">
              <span className="register-demo-label">{r.demoQuickFill || (language === 'kn' ? 'ತ್ವರಿತ ಡೆಮೊ ಭರ್ತಿ:' : 'Quick Demo Fill:')}</span>
              <button
                type="button"
                className="register-demo-btn"
                onClick={role === 'farmer' ? fillDemoFarmer : fillDemoBuyer}
              >
                {role === 'farmer' ? '🌾 Demo Farmer' : '🏢 Demo Buyer'}
              </button>
            </div>

            {/* Registration Card Form */}
            <div className="login-card register-card">
              <form onSubmit={handleSubmit} noValidate>
                {errors.form && <p className="login-error-msg" role="alert">{errors.form}</p>}

                {/* Optional Full / Business Name */}
                <div className="login-input-row">
                  <div className="login-lock-prefix">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="login-input-sep" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={
                      role === 'farmer'
                        ? (language === 'kn' ? 'ಹೆಸರು (ಐಚ್ಛಿಕ - ಉದಾ: ಬಸವರಾಜ್)' : 'Your Name (Optional)')
                        : (language === 'kn' ? 'ಸಂಸ್ಥೆ / ಹೆಸರು (ಐಚ್ಛಿಕ)' : 'Business / Contact Name (Optional)')
                    }
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                {/* Email Address */}
                <div className={`login-input-row ${errors.email ? 'login-input-row--error' : ''}`}>
                  <div className="login-lock-prefix">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </div>
                  <span className="login-input-sep" />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder={r.emailPlaceholder || (language === 'kn' ? 'ಇಮೇಲ್ ವಿಳಾಸ (Email ID)' : 'Email ID (e.g. name@gmail.com)')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError('email');
                      clearError('form');
                    }}
                    required
                  />
                </div>
                {errors.email && <span className="login-error-msg">{errors.email}</span>}

                {/* Password */}
                <div className={`login-input-row ${errors.password ? 'login-input-row--error' : ''}`}>
                  <div className="login-lock-prefix">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span className="login-input-sep" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು)' : 'Password (min. 6 characters)'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError('password');
                      clearError('form');
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <span className="login-error-msg">{errors.password}</span>}

                {/* Confirm Password */}
                <div className={`login-input-row ${errors.confirmPassword ? 'login-input-row--error' : ''}`}>
                  <div className="login-lock-prefix">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span className="login-input-sep" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder={language === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ (Confirm Password)' : 'Confirm Password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError('confirmPassword');
                      clearError('form');
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="login-error-msg">{errors.confirmPassword}</span>}

                {/* Terms Checkbox */}
                <div className="register-terms-row">
                  <label className="login-remember-wrap">
                    <input
                      type="checkbox"
                      checked={terms}
                      onChange={(e) => {
                        setTerms(e.target.checked);
                        clearError('terms');
                      }}
                    />
                    <span className="login-checkbox-box">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className="register-terms-text">
                      {language === 'kn'
                        ? 'ನಾನು ರಾಯತಮಾರ್ಗದ ಪಾರದರ್ಶಕ ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳನ್ನು ಒಪ್ಪುತ್ತೇನೆ.'
                        : 'I agree to RaithaMarga transparent platform terms & conditions.'}
                    </span>
                  </label>
                  {errors.terms && <span className="login-error-msg">{errors.terms}</span>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`login-submit-btn ${isSubmitting ? 'login-submit-btn--loading' : ''}`}
                  disabled={isSubmitting}
                  style={{ marginTop: '16px' }}
                >
                  <svg className="login-btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>
                    {isSubmitting
                      ? (language === 'kn' ? 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...' : 'Creating Account...')
                      : role === 'farmer'
                        ? (language === 'kn' ? 'ರೈತ ಖಾತೆ ರಚಿಸಿ (Register as Farmer)' : 'Register as Farmer')
                        : (language === 'kn' ? 'ಖರೀದಿದಾರ ಖಾತೆ ರಚಿಸಿ (Register as Buyer)' : 'Register as Buyer')}
                  </span>
                </button>

                {/* Notice Banner */}
                <div className="login-notice" style={{ marginTop: '18px' }}>
                  <svg className="login-notice-leaf" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                  <p className="login-notice-text">
                    {language === 'kn'
                      ? 'ನೋಂದಣಿಯ ನಂತರ ಇದೇ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಬಳಸಿ ಸೈನ್ ಇನ್ ಮಾಡಬಹುದು.'
                      : 'You can log in anytime using this exact same email and password.'}
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Link */}
            <div className="login-footer">
              <span className="login-footer-text">
                {r.alreadyAccount || (language === 'kn' ? 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?' : 'Already have an account?')}
              </span>{' '}
              <Link to="/login" className="login-footer-link">
                {r.signIn || (language === 'kn' ? 'ಇಲ್ಲಿ ಸೈನ್ ಇನ್ ಮಾಡಿ →' : 'Sign In here →')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
