import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import logoMark from '../assets/logo-mark.png';
import logoSeal from '../assets/logo-seal.png';
import './Login.css';

const PHONE_REGEX = /^[6-9]\d{9}$/;

// Defensive fallbacks in case translations are ever missing
const DEFAULT_L = {
  panelTitle: 'One Platform for Farmers & Buyers',
  panelSubtitle: 'Direct connections, fair prices, and transparent trades backed by digital weighing proof.',
  eyebrow: 'Welcome back',
  title: 'Sign In',
  subtitle: 'Access your account or administrative portal.',
  portalUser: 'User Login',
  portalAdmin: 'Admin Login',
  roleLabel: 'Account type',
  roleFarmer: 'Farmer',
  roleBuyer: 'Buyer',
  phoneLabel: 'Mobile Number',
  phonePlaceholder: '10-digit mobile number',
  modeLabel: 'Sign in method',
  passwordTab: 'Password',
  otpTab: 'Get OTP',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  hidePassword: 'Hide password',
  showPassword: 'Show password',
  remember: 'Remember me',
  forgot: 'Forgot password?',
  otpLabel: 'Verification Code',
  otpPlaceholder: '6-digit OTP',
  sendOtp: 'Send OTP',
  resendOtp: 'Resend OTP',
  otpSentHint: 'OTP sent! For testing, use 123456',
  submit: 'Sign In',
  submitting: 'Signing in...',
  noAccount: "Don't have an account?",
  getStarted: 'Get Started',
  errorPhone: 'Please enter a valid 10-digit mobile number',
  errorPassword: 'Password must be at least 4 characters',
  errorOtpNotSent: 'Please request an OTP first',
  errorOtp: 'Please enter the 6-digit OTP',
  adminBadge: 'Restricted Access · Authorized Personnel Only',
  adminTitle: 'Admin Console',
  adminSubtitle: 'District administration & verification authority sign-in.',
  adminEmailLabel: 'Official Email or Admin ID',
  adminEmailPlaceholder: 'admin@raithamarga.in',
  adminPasswordLabel: 'Admin Password',
  adminPinLabel: 'Security PIN / 2FA Key',
  adminPinPlaceholder: '4-digit PIN (e.g. 9999)',
  adminSubmit: 'Access Admin Console',
  errorAdminEmail: 'Please enter your official admin email or ID',
  errorAdminPassword: 'Password must be at least 4 characters',
  errorAdminPin: 'Please enter your 4-digit security PIN',
  demoNotice: 'Quick Demo Access:',
  demoFarmer: 'Demo Farmer',
  demoBuyer: 'Demo Buyer',
  demoAdmin: 'Demo Admin',
};

const Login = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const l = { ...DEFAULT_L, ...(t?.login || {}) };
  const navigate = useNavigate();

  // Primary Portal switch: 'user' | 'admin'
  const [portal, setPortal] = useState('user');

  // User form states
  const [role, setRole] = useState('farmer'); // 'farmer' | 'buyer'
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberUser, setRememberUser] = useState(true);

  // Admin form states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [rememberAdmin, setRememberAdmin] = useState(true);

  // Common submission states
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const switchPortal = (nextPortal) => {
    setPortal(nextPortal);
    setErrors({});
    setIsSubmitting(false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setOtpSent(false);
    setOtp('');
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    clearError('role');
  };

  const handleSendOtp = () => {
    const nextErrors = {};
    if (!PHONE_REGEX.test(phone.trim())) nextErrors.phone = l.errorPhone;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setIsSendingOtp(true);
    window.setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtp('123456');
    }, 600);
  };

  // Quick fill demo helpers
  const fillDemoUser = (userRole) => {
    setPortal('user');
    setRole(userRole);
    setMode('password');
    setPhone(userRole === 'farmer' ? '9876543210' : '9845012345');
    setPassword('demo123');
    setErrors({});
  };

  const fillDemoAdmin = () => {
    setPortal('admin');
    setAdminEmail('admin@raithamarga.in');
    setAdminPassword('admin123');
    setAdminPin('9999');
    setErrors({});
  };

  const validateUserForm = () => {
    const nextErrors = {};
    if (!PHONE_REGEX.test(phone.trim())) nextErrors.phone = l.errorPhone;

    if (mode === 'password') {
      if (!password || password.length < 4) nextErrors.password = l.errorPassword;
    } else {
      if (!otpSent) nextErrors.otp = l.errorOtpNotSent;
      else if (!/^\d{6}$/.test(otp.trim())) nextErrors.otp = l.errorOtp;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateAdminForm = () => {
    const nextErrors = {};
    if (!adminEmail.trim() || adminEmail.trim().length < 3) {
      nextErrors.adminEmail = l.errorAdminEmail;
    }
    if (!adminPassword || adminPassword.length < 4) {
      nextErrors.adminPassword = l.errorAdminPassword;
    }
    if (!adminPin || !/^\d{4,6}$/.test(adminPin.trim())) {
      nextErrors.adminPin = l.errorAdminPin;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard');
    }, 500);
  };

  const handleSubmitAdmin = (e) => {
    e.preventDefault();
    if (!validateAdminForm()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      navigate('/admin/dashboard');
    }, 500);
  };

  return (
    <div className="login-page">
      {/* ---------- Left: Brand & Trust Panel ---------- */}
      <div className="login-panel" aria-hidden="true">
        <div className="login-panel__pattern" />
        <div className="login-panel__content">
          <Link to="/" className="login-panel__logo">
            <img src={logoSeal} alt="RaithaMarga" width="68" height="68" />
          </Link>

          <h2 className="login-panel__title">
            {portal === 'admin'
              ? 'District Administration & Trust Verification'
              : l.panelTitle}
          </h2>
          <p className="login-panel__subtitle">
            {portal === 'admin'
              ? 'Real-time oversight for farmer lots, weighing proof verification, and buyer trust score auditing.'
              : l.panelSubtitle}
          </p>

          <ul className="login-panel__points">
            {(t?.trustbar?.items || [
              'Photo-proof weighing',
              'Verified buyers only',
              'Speak your own language',
              'Fair, transparent pricing',
            ]).map((item) => (
              <li key={item}>
                <span className="login-panel__check">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="login-panel__stat">
            <strong>{t?.hero?.trust1Strong || '86%'}</strong>
            <span>{t?.hero?.trust1Rest || 'of Indian farmers hold under 2 hectares'}</span>
          </div>
        </div>
      </div>

      {/* ---------- Right: Form Side ---------- */}
      <div className="login-form-side">
        <div className="login-form-side__header">
          <Link to="/" className="login-form-side__logo">
            <img src={logoMark} alt="RaithaMarga" width="36" height="36" />
            <span>RaithaMarga</span>
          </Link>
          <button
            type="button"
            className="login-lang-toggle"
            onClick={toggleLanguage}
            aria-label="Switch language"
          >
            <span key={language}>{t?.nav?.langToggle || 'ಕನ್ನಡ'}</span>
          </button>
        </div>

        <div className="login-form-wrap">
          <div className="login-card-container">
            {/* Standard Portal Switcher: User Login vs Admin Login */}
            <div className="login-portal-tabs" role="tablist" aria-label="Portal Selection">
              <button
                type="button"
                role="tab"
                aria-selected={portal === 'user'}
                className={`login-portal-tab ${portal === 'user' ? 'login-portal-tab--active' : ''}`}
                onClick={() => switchPortal('user')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{l.portalUser}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={portal === 'admin'}
                className={`login-portal-tab ${portal === 'admin' ? 'login-portal-tab--active login-portal-tab--admin' : ''}`}
                onClick={() => switchPortal('admin')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{l.portalAdmin}</span>
              </button>
            </div>

            {/* QUICK DEMO FILL CHIPS */}
            <div className="login-demo-bar">
              <span className="login-demo-label">{l.demoNotice}</span>
              {portal === 'user' ? (
                <div className="login-demo-chips">
                  <button
                    type="button"
                    className="login-demo-chip"
                    onClick={() => fillDemoUser('farmer')}
                  >
                    🌾 {l.demoFarmer}
                  </button>
                  <button
                    type="button"
                    className="login-demo-chip"
                    onClick={() => fillDemoUser('buyer')}
                  >
                    🏢 {l.demoBuyer}
                  </button>
                </div>
              ) : (
                <div className="login-demo-chips">
                  <button
                    type="button"
                    className="login-demo-chip login-demo-chip--admin"
                    onClick={fillDemoAdmin}
                  >
                    🛡️ {l.demoAdmin}
                  </button>
                </div>
              )}
            </div>

            {/* ================= USER LOGIN FORM ================= */}
            {portal === 'user' && (
              <form className="login-card" onSubmit={handleSubmitUser} noValidate>
                <div className="login-card__heading-group">
                  <span className="eyebrow">{l.eyebrow}</span>
                  <h1 className="login-card__title">
                    {role === 'farmer' ? `${l.roleFarmer} ${l.title}` : `${l.roleBuyer} ${l.title}`}
                  </h1>
                  <p className="login-card__subtitle">{l.subtitle}</p>
                </div>

                {/* Role Switcher: Farmer vs Buyer */}
                <div className="login-role" role="radiogroup" aria-label={l.roleLabel}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === 'farmer'}
                    className={`login-role__btn ${role === 'farmer' ? 'login-role__btn--active' : ''}`}
                    onClick={() => switchRole('farmer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M5 20c0-4.4 3.1-7.5 7-7.5s7 3.1 7 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {l.roleFarmer}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === 'buyer'}
                    className={`login-role__btn ${role === 'buyer' ? 'login-role__btn--active' : ''}`}
                    onClick={() => switchRole('buyer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 9 5 4h14l1 5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
                      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.6" fill="none" />
                      <path d="M9 13a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </svg>
                    {l.roleBuyer}
                  </button>
                </div>

                {/* Mobile Phone Field */}
                <div className={`login-field ${errors.phone ? 'login-field--error' : ''}`}>
                  <label htmlFor="login-phone">{l.phoneLabel}</label>
                  <div className="login-field__phone">
                    <span className="login-field__prefix">+91</span>
                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder={l.phonePlaceholder}
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                        clearError('phone');
                      }}
                    />
                  </div>
                  {errors.phone && <span className="login-field__error">{errors.phone}</span>}
                </div>

                {/* Mode Tabs: Password vs OTP */}
                <div className="login-mode-tabs" role="tablist" aria-label={l.modeLabel}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'password'}
                    className={`login-mode-tabs__btn ${mode === 'password' ? 'login-mode-tabs__btn--active' : ''}`}
                    onClick={() => switchMode('password')}
                  >
                    {l.passwordTab}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'otp'}
                    className={`login-mode-tabs__btn ${mode === 'otp' ? 'login-mode-tabs__btn--active' : ''}`}
                    onClick={() => switchMode('otp')}
                  >
                    {l.otpTab}
                  </button>
                </div>

                {mode === 'password' ? (
                  <>
                    <div className={`login-field ${errors.password ? 'login-field--error' : ''}`}>
                      <label htmlFor="login-password">{l.passwordLabel}</label>
                      <div className="login-field__password">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder={l.passwordPlaceholder}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('password');
                          }}
                        />
                        <button
                          type="button"
                          className="login-field__eye"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? l.hidePassword : l.showPassword}
                        >
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.7a2.7 2.7 0 0 0 3.8 3.8M9.4 5.3A10.8 10.8 0 0 1 12 5c5 0 9 3.5 10 7-.4 1.3-1.1 2.6-2.1 3.7M6.5 6.6C4.4 8 2.9 10 2 12c1 3.5 5 7 10 7 1.3 0 2.6-.2 3.8-.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12c1-3.5 5-7 10-7s9 3.5 10 7c-1 3.5-5 7-10 7s-9-3.5-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
                          )}
                        </button>
                      </div>
                      {errors.password && <span className="login-field__error">{errors.password}</span>}
                    </div>

                    <div className="login-row">
                      <label className="login-remember">
                        <input
                          type="checkbox"
                          checked={rememberUser}
                          onChange={(e) => setRememberUser(e.target.checked)}
                        />
                        {l.remember}
                      </label>
                      <a href="#forgot-password" className="login-forgot">{l.forgot}</a>
                    </div>
                  </>
                ) : (
                  <div className={`login-field ${errors.otp ? 'login-field--error' : ''}`}>
                    <label htmlFor="login-otp">{l.otpLabel}</label>
                    <div className="login-field__otp">
                      <input
                        id="login-otp"
                        type="tel"
                        inputMode="numeric"
                        placeholder={l.otpPlaceholder}
                        value={otp}
                        maxLength={6}
                        disabled={!otpSent}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                          clearError('otp');
                        }}
                      />
                      <button
                        type="button"
                        className={`btn btn--outline login-field__otp-btn ${isSendingOtp ? 'btn--loading' : ''}`}
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                      >
                        {otpSent ? l.resendOtp : l.sendOtp}
                      </button>
                    </div>
                    {errors.otp && <span className="login-field__error">{errors.otp}</span>}
                    {otpSent && !errors.otp && <span className="login-field__hint">{l.otpSentHint}</span>}
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn btn--primary btn--animated login-submit ${isSubmitting ? 'btn--loading' : ''}`}
                  disabled={isSubmitting}
                >
                  <span className="btn__shine" aria-hidden="true" />
                  {isSubmitting
                    ? l.submitting
                    : `${l.submit} ${role === 'farmer' ? `(${l.roleFarmer})` : `(${l.roleBuyer})`}`}
                </button>

                <p className="login-card__footer">
                  {l.noAccount} <Link to="/register">{l.getStarted}</Link>
                </p>
              </form>
            )}

            {/* ================= ADMIN LOGIN FORM ================= */}
            {portal === 'admin' && (
              <form className="login-card login-card--admin" onSubmit={handleSubmitAdmin} noValidate>
                <div className="login-admin-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{l.adminBadge}</span>
                </div>

                <div className="login-card__heading-group">
                  <h1 className="login-card__title">{l.adminTitle}</h1>
                  <p className="login-card__subtitle">{l.adminSubtitle}</p>
                </div>

                {/* Admin ID / Email */}
                <div className={`login-field ${errors.adminEmail ? 'login-field--error' : ''}`}>
                  <label htmlFor="admin-email">{l.adminEmailLabel}</label>
                  <div className="login-field__input-wrap">
                    <input
                      id="admin-email"
                      type="text"
                      autoComplete="username"
                      placeholder={l.adminEmailPlaceholder}
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        clearError('adminEmail');
                      }}
                    />
                  </div>
                  {errors.adminEmail && <span className="login-field__error">{errors.adminEmail}</span>}
                </div>

                {/* Admin Password */}
                <div className={`login-field ${errors.adminPassword ? 'login-field--error' : ''}`}>
                  <label htmlFor="admin-password">{l.adminPasswordLabel}</label>
                  <div className="login-field__password">
                    <input
                      id="admin-password"
                      type={showAdminPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        clearError('adminPassword');
                      }}
                    />
                    <button
                      type="button"
                      className="login-field__eye"
                      onClick={() => setShowAdminPassword((v) => !v)}
                      aria-label={showAdminPassword ? l.hidePassword : l.showPassword}
                    >
                      {showAdminPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18M10.6 10.7a2.7 2.7 0 0 0 3.8 3.8M9.4 5.3A10.8 10.8 0 0 1 12 5c5 0 9 3.5 10 7-.4 1.3-1.1 2.6-2.1 3.7M6.5 6.6C4.4 8 2.9 10 2 12c1 3.5 5 7 10 7 1.3 0 2.6-.2 3.8-.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12c1-3.5 5-7 10-7s9 3.5 10 7c-1 3.5-5 7-10 7s-9-3.5-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /></svg>
                      )}
                    </button>
                  </div>
                  {errors.adminPassword && <span className="login-field__error">{errors.adminPassword}</span>}
                </div>

                {/* Admin PIN */}
                <div className={`login-field ${errors.adminPin ? 'login-field--error' : ''}`}>
                  <div className="login-field__label-row">
                    <label htmlFor="admin-pin">{l.adminPinLabel}</label>
                    <span className="login-field__badge">2FA</span>
                  </div>
                  <div className="login-field__input-wrap">
                    <input
                      id="admin-pin"
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder={l.adminPinPlaceholder}
                      value={adminPin}
                      onChange={(e) => {
                        setAdminPin(e.target.value.replace(/\D/g, '').slice(0, 6));
                        clearError('adminPin');
                      }}
                    />
                  </div>
                  {errors.adminPin && <span className="login-field__error">{errors.adminPin}</span>}
                </div>

                <div className="login-row">
                  <label className="login-remember">
                    <input
                      type="checkbox"
                      checked={rememberAdmin}
                      onChange={(e) => setRememberAdmin(e.target.checked)}
                    />
                    <span>Remember terminal</span>
                  </label>
                  <span className="login-badge-secure">SSL 256-Bit</span>
                </div>

                <button
                  type="submit"
                  className={`btn btn--primary btn--animated login-submit login-submit--admin ${isSubmitting ? 'btn--loading' : ''}`}
                  disabled={isSubmitting}
                >
                  <span className="btn__shine" aria-hidden="true" />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isSubmitting ? l.submitting : l.adminSubmit}
                </button>

                <p className="login-card__footer login-card__footer--admin">
                  Official agricultural officers and platform administrators only.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;