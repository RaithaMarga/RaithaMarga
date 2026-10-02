import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';
import { STORAGE_KEYS } from '../data/storageKeys';
import { CROP_CATEGORIES } from '../data/crops';
import logoSeal from '../assets/logo-seal.png';
import fieldBg from '../assets/login-bg-field.jpg';
import './Login.css';
import './Register.css';

const PHONE_REGEX = /^[6-9]\d{9}$/;

const Register = () => {
  const { t, language, setLanguage } = useLanguage();
  const r = t?.register || {};
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('farmer'); // 'farmer' | 'buyer'

  // Farmer form state
  const [farmerName, setFarmerName] = useState('');
  const [farmerEmail, setFarmerEmail] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerCropType, setFarmerCropType] = useState('vegetables');
  const [farmerCropName, setFarmerCropName] = useState('Tomato');
  const [farmerLandSize, setFarmerLandSize] = useState('under_2');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerConfirmPassword, setFarmerConfirmPassword] = useState('');
  const [farmerTerms, setFarmerTerms] = useState(true);

  // Buyer form state
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');
  const [businessType, setBusinessType] = useState('trader');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [buyerConfirmPassword, setBuyerConfirmPassword] = useState('');
  const [buyerTerms, setBuyerTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [cropSearchText, setCropSearchText] = useState('');
  const selectedCropCategory = CROP_CATEGORIES.find(({ value }) => value === farmerCropType);
  const visibleCropOptions = useMemo(() => {
    const query = cropSearchText.trim().toLowerCase();
    const crops = selectedCropCategory?.crops ?? [];

    if (!query) return crops;

    return crops.filter((crop) => {
      const haystack = `${crop.value} ${crop.label}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [cropSearchText, selectedCropCategory]);

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
  };

  const fillDemoFarmer = () => {
    setRole('farmer');
    setFarmerName('Farmer Example');
    setFarmerEmail('');
    setFarmerPhone('');
    setFarmerVillage('Malur, Kolar');
    setFarmerPassword('');
    setFarmerConfirmPassword('');
    setErrors({});
  };

  const fillDemoBuyer = () => {
    setRole('buyer');
    setBusinessName('Agro Trader Example');
    setContactName('Buyer Example');
    setBuyerEmail('');
    setBuyerPhone('');
    setBuyerLocation('Kolar');
    setBuyerPassword('');
    setBuyerConfirmPassword('');
    setErrors({});
  };

  const validateFarmer = () => {
    const nextErrors = {};
    if (!farmerName.trim()) nextErrors.farmerName = r.errorName || 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(farmerEmail.trim())) nextErrors.farmerEmail = r.errorEmail || 'Enter a valid email address.';
    if (!PHONE_REGEX.test(farmerPhone.trim())) nextErrors.farmerPhone = r.errorPhone || 'Please enter a valid 10-digit mobile number';
    if (!farmerVillage.trim()) nextErrors.farmerVillage = r.errorLocation || 'Please enter your location';
    if (!farmerPassword || farmerPassword.length < 6) nextErrors.farmerPassword = r.errorPassword || 'Password must be at least 6 characters.';
    if (farmerPassword !== farmerConfirmPassword) nextErrors.farmerConfirmPassword = r.errorPasswordMatch || 'Passwords do not match';
    if (!farmerTerms) nextErrors.farmerTerms = r.errorTerms || 'Please accept the platform terms';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateBuyer = () => {
    const nextErrors = {};
    if (!businessName.trim()) nextErrors.businessName = r.errorBusinessName || 'Please enter business name';
    if (!contactName.trim()) nextErrors.contactName = r.errorName || 'Please enter contact name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) nextErrors.buyerEmail = r.errorEmail || 'Enter a valid email address.';
    if (!PHONE_REGEX.test(buyerPhone.trim())) nextErrors.buyerPhone = r.errorPhone || 'Please enter a valid 10-digit mobile number';
    if (!buyerLocation.trim()) nextErrors.buyerLocation = r.errorLocation || 'Please enter your location';
    if (!buyerPassword || buyerPassword.length < 6) nextErrors.buyerPassword = r.errorPassword || 'Password must be at least 6 characters.';
    if (buyerPassword !== buyerConfirmPassword) nextErrors.buyerConfirmPassword = r.errorPasswordMatch || 'Passwords do not match';
    if (!buyerTerms) nextErrors.buyerTerms = r.errorTerms || 'Please accept the platform terms';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === 'farmer') {
      if (!validateFarmer()) return;
      setIsSubmitting(true);
      try {
        const profile = {
          fullName: farmerName.trim(),
          phone: farmerPhone.trim(),
          village: farmerVillage.trim(),
          taluk: 'Kolar',
          district: 'Kolar',
          state: 'Karnataka',
          landAcres: farmerLandSize === 'under_2' ? 1.5 : farmerLandSize === '2_to_5' ? 3.5 : 6,
        };
        await register({
          email: farmerEmail,
          password: farmerPassword,
          role,
          displayName: farmerName.trim(),
          profile,
        });
        localStorage.setItem(STORAGE_KEYS.FARMER_PROFILE, JSON.stringify({
          name: profile.fullName,
          phone: farmerPhone.trim(),
          village: profile.village,
          taluk: profile.taluk,
          district: profile.district,
          state: profile.state,
          landSizeAcres: String(profile.landAcres),
          preferredCrops: farmerCropName,
        }));
        navigate('/farmer/dashboard');
      } catch (error) {
        setErrors((prev) => ({ ...prev, form: error.message }));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!validateBuyer()) return;
      setIsSubmitting(true);
      try {
        const profile = {
          fullName: contactName.trim(),
          businessName: businessName.trim(),
          district: buyerLocation.trim().split(',').pop().trim(),
        };
        await register({
          email: buyerEmail,
          password: buyerPassword,
          role,
          displayName: contactName.trim(),
          profile,
        });
        localStorage.setItem(STORAGE_KEYS.BUYER_PROFILE, JSON.stringify({
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          phone: buyerPhone.trim(),
          location: profile.district,
          businessType,
        }));
        navigate('/buyer/dashboard');
      } catch (error) {
        setErrors((prev) => ({ ...prev, form: error.message }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="login-page register-page">
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
            {r.panelTitle || 'ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರಿಗೆ ಒಂದು ವೇದಿಕೆ'}
          </h1>

          <p className="login-panel__subtitle">
            {r.panelSubtitle || 'ನೇರ ಸಂಪರ್ಕ, ನ್ಯಾಯಯುತ ಬೆಲೆಗಳು ಮತ್ತು ಡಿಜಿಟಲ್ ತೂಕದೊಂದಿಗೆ ಸೌಹಾರ್ದಯುತ ವ್ಯವಹಾರ.'}
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
              <span>{r.feature1 || 'ನ್ಯಾಯಸಮ್ಮತ ಬೆಲೆಗಳು'}</span>
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
              <span>{r.feature2 || 'ಪಾರದರ್ಶಕ ವ್ಯವಹಾರಗಳು'}</span>
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
              <span>{r.feature3 || 'ರೈತರಿಗೆ ಸಬಲೀಕರಣ'}</span>
            </li>
          </ul>

          {/* Slanted cursive script text at bottom left */}
          <div className="login-panel__script">
            <span>{r.scriptText1 || "Farmer's Path"}</span>
            <span>{r.scriptText2 || 'to a Better Tomorrow'}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: REGISTRATION FORM SIDE ================= */}
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
          <div className="login-card-container register-card-container">
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
                <span>{r.selectRole || 'ನಿಮ್ಮ ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ'}</span>
              </div>

              <div className="login-role-bar__pills" role="radiogroup" aria-label={r.selectRole || 'Select Role'}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'farmer'}
                  className={`login-role-pill ${role === 'farmer' ? 'login-role-pill--active' : ''}`}
                  onClick={() => switchRole('farmer')}
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
                  <span>{r.roleFarmer || 'ರೈತ'}</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={role === 'buyer'}
                  className={`login-role-pill ${role === 'buyer' ? 'login-role-pill--active' : ''}`}
                  onClick={() => switchRole('buyer')}
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
                  <span>{r.roleBuyer || 'ಖರೀದಿದಾರ'}</span>
                </button>
              </div>
            </div>

            {/* Form Heading */}
            <div className="login-heading">
              <h2 className="login-title">
                {role === 'farmer'
                  ? (r.farmerTitle || 'ರೈತ ನೋಂದಣಿ')
                  : (r.buyerTitle || 'ಖರೀದಿದಾರ ನೋಂದಣಿ')}
              </h2>
              <p className="login-subtitle">
                {role === 'farmer'
                  ? (r.farmerSubtitle || 'ಹೊಸ ರೈತ ಖಾತೆ ರಚಿಸಿ ಬೆಳೆ ನೇರವಾಗಿ ಮಾರಾಟ ಮಾಡಿ.')
                  : (r.buyerSubtitle || 'ಹೊಸ ಖರೀದಿದಾರ ಖಾತೆ ರಚಿಸಿ ಗುಣಮಟ್ಟದ ಬೆಳೆ ಖರೀದಿಸಿ.')}
              </p>
            </div>

            {/* Quick Demo Pre-fill Bar */}
            <div className="register-demo-bar">
              <span className="register-demo-label">{r.demoQuickFill || 'ತ್ವರಿತ ಡೆಮೊ ಭರ್ತಿ:'}</span>
              <button
                type="button"
                className="register-demo-btn"
                onClick={role === 'farmer' ? fillDemoFarmer : fillDemoBuyer}
              >
                {role === 'farmer' ? `🌾 ${r.demoFarmer || 'ಡೆಮೊ ರೈತ ವಿವರ ಭರ್ತಿ'}` : `🏢 ${r.demoBuyer || 'ಡೆಮೊ ಖರೀದಿದಾರ ವಿವರ ಭರ್ತಿ'}`}
              </button>
            </div>

            {/* Registration Card Form */}
            <div className="login-card register-card">
              <form onSubmit={handleSubmit} noValidate>
                {errors.form && <p className="login-error-msg" role="alert">{errors.form}</p>}
                {/* ========== FARMER FORM FIELDS ========== */}
                {role === 'farmer' && (
                  <>
                    {/* Full Name */}
                    <div className={`login-input-row ${errors.farmerName ? 'login-input-row--error' : ''}`}>
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
                        placeholder={r.namePlaceholder || 'ಪೂರ್ಣ ಹೆಸರು (ಉದಾ: ಬಸವರಾಜಪ್ಪ ಗೌಡ)'}
                        value={farmerName}
                        onChange={(e) => {
                          setFarmerName(e.target.value);
                          clearError('farmerName');
                        }}
                      />
                    </div>
                    {errors.farmerName && <span className="login-error-msg">{errors.farmerName}</span>}

                    <div className={`login-input-row ${errors.farmerEmail ? 'login-input-row--error' : ''}`}>
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
                        placeholder={r.emailPlaceholder || 'Email address'}
                        value={farmerEmail}
                        onChange={(e) => {
                          setFarmerEmail(e.target.value);
                          clearError('farmerEmail');
                          clearError('form');
                        }}
                      />
                    </div>
                    {errors.farmerEmail && <span className="login-error-msg">{errors.farmerEmail}</span>}

                    {/* Phone Number */}
                    <div className={`login-input-row ${errors.farmerPhone ? 'login-input-row--error' : ''}`}>
                      <div className="login-phone-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="login-country-text">+91</span>
                        <svg className="login-prefix-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder={r.phonePlaceholder || '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'}
                        value={farmerPhone}
                        maxLength={10}
                        onChange={(e) => {
                          setFarmerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          clearError('farmerPhone');
                        }}
                      />
                    </div>
                    {errors.farmerPhone && <span className="login-error-msg">{errors.farmerPhone}</span>}

                    {/* Location */}
                    <div className={`login-input-row ${errors.farmerVillage ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="text"
                        placeholder={r.villagePlaceholder || 'ಗ್ರಾಮ / ತಾಲೂಕು (ಉದಾ: ಮಾಲೂರು, ಕೋಲಾರ)'}
                        value={farmerVillage}
                        onChange={(e) => {
                          setFarmerVillage(e.target.value);
                          clearError('farmerVillage');
                        }}
                      />
                    </div>
                    {errors.farmerVillage && <span className="login-error-msg">{errors.farmerVillage}</span>}

                    {/* Crop Category and Selection */}
                    <div className="login-input-row">
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <select
                        className="register-clean-select"
                        value={farmerCropType}
                        onChange={(e) => {
                          const nextCategory = CROP_CATEGORIES.find(({ value }) => value === e.target.value);
                          setFarmerCropType(e.target.value);
                          setCropSearchText('');
                          setFarmerCropName(nextCategory.crops[0].value);
                        }}
                        aria-label="Select crop category"
                      >
                        {CROP_CATEGORIES.map((category) => (
                          <option key={category.value} value={category.value}>{category.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="register-crop-search">
                      <div className="login-input-row">
                        <div className="login-lock-prefix">
                          <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M21 21l-4.35-4.35" />
                          </svg>
                        </div>
                        <span className="login-input-sep" />
                        <input
                          type="text"
                          className="register-search-input"
                          placeholder={language === 'kn' ? 'ಬೆಳೆ ಹುಡುಕಿ...' : 'Search crop...'}
                          value={cropSearchText}
                          onChange={(e) => setCropSearchText(e.target.value)}
                          aria-label={language === 'kn' ? 'ಬೆಳೆ ಹುಡುಕಿ' : 'Search crop'}
                        />
                      </div>
                    </div>

                    <div className="login-input-row">
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <select
                        className="register-clean-select"
                        value={farmerCropName}
                        onChange={(e) => setFarmerCropName(e.target.value)}
                        aria-label="Select crop"
                      >
                        {visibleCropOptions.length > 0 ? (
                          visibleCropOptions.map((crop) => (
                            <option key={crop.value} value={crop.value}>{crop.label}</option>
                          ))
                        ) : (
                          <option value="">{language === 'kn' ? 'ಬೆಳೆ ಕಂಡುಬಂದಿಲ್ಲ' : 'No crop found'}</option>
                        )}
                      </select>
                    </div>

                    {/* Land Size Select */}
                    <div className="login-input-row">
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <select
                        className="register-clean-select"
                        value={farmerLandSize}
                        onChange={(e) => setFarmerLandSize(e.target.value)}
                        aria-label={r.landSizeLabel}
                      >
                        <option value="under_2">{r.landSizeSmall || '2 ಹೆಕ್ಟೇರ್‌ಗಿಂತ ಕಡಿಮೆ (ಸಣ್ಣ/ಅತಿ ಸಣ್ಣ)'}</option>
                        <option value="2_to_5">{r.landSizeMedium || '2 ರಿಂದ 5 ಹೆಕ್ಟೇರ್'}</option>
                        <option value="above_5">{r.landSizeLarge || '5 ಹೆಕ್ಟೇರ್‌ಗಿಂತ ಹೆಚ್ಚು'}</option>
                      </select>
                    </div>

                    {/* Set Password */}
                    <div className={`login-input-row ${errors.farmerPassword ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.passwordPlaceholder || 'Set password (at least 6 characters)'}
                        value={farmerPassword}
                        onChange={(e) => {
                          setFarmerPassword(e.target.value);
                          clearError('farmerPassword');
                        }}
                      />
                    </div>
                    {errors.farmerPassword && <span className="login-error-msg">{errors.farmerPassword}</span>}

                    {/* Confirm Password */}
                    <div className={`login-input-row ${errors.farmerConfirmPassword ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.confirmPasswordPlaceholder || 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ'}
                        value={farmerConfirmPassword}
                        onChange={(e) => {
                          setFarmerConfirmPassword(e.target.value);
                          clearError('farmerConfirmPassword');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password"
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.farmerConfirmPassword && <span className="login-error-msg">{errors.farmerConfirmPassword}</span>}

                    {/* Terms Checkbox */}
                    <div className="register-terms-row">
                      <label className="login-remember-wrap">
                        <input
                          type="checkbox"
                          checked={farmerTerms}
                          onChange={(e) => {
                            setFarmerTerms(e.target.checked);
                            clearError('farmerTerms');
                          }}
                        />
                        <span className="login-checkbox-box">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="register-terms-text">{r.termsFarmer || 'ನಾನು ಡಿಜಿಟಲ್ ತೂಕದ ಫೋಟೋ ಪುರಾವೆ ಮತ್ತು ಪಾರದರ್ಶಕ ನಿಯಮಗಳಿಗೆ ಒಪ್ಪುತ್ತೇನೆ.'}</span>
                      </label>
                      {errors.farmerTerms && <span className="login-error-msg">{errors.farmerTerms}</span>}
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
                      <span>{isSubmitting ? (r.submitting || 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...') : (r.submitFarmer || 'ರೈತ ಖಾತೆ ರಚಿಸಿ')}</span>
                    </button>
                  </>
                )}

                {/* ========== BUYER FORM FIELDS ========== */}
                {role === 'buyer' && (
                  <>
                    {/* Business / Firm Name */}
                    <div className={`login-input-row ${errors.businessName ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="text"
                        placeholder={r.businessNamePlaceholder || 'ವ್ಯಾಪಾರ / ಸಂಸ್ಥೆಯ ಹೆಸರು (ಉದಾ: ಕೋಲಾರ ಅಗ್ರೋ ಹೋಲ್‌ಸೇಲ್)'}
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          clearError('businessName');
                        }}
                      />
                    </div>
                    {errors.businessName && <span className="login-error-msg">{errors.businessName}</span>}

                    {/* Contact Person Name */}
                    <div className={`login-input-row ${errors.contactName ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="text"
                        placeholder={r.contactNamePlaceholder || 'ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ ಹೆಸರು (ಉದಾ: ಆನಂದ್ ಕುಮಾರ್)'}
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          clearError('contactName');
                        }}
                      />
                    </div>
                    {errors.contactName && <span className="login-error-msg">{errors.contactName}</span>}

                    <div className={`login-input-row ${errors.buyerEmail ? 'login-input-row--error' : ''}`}>
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
                        placeholder={r.emailPlaceholder || 'Email address'}
                        value={buyerEmail}
                        onChange={(e) => {
                          setBuyerEmail(e.target.value);
                          clearError('buyerEmail');
                          clearError('form');
                        }}
                      />
                    </div>
                    {errors.buyerEmail && <span className="login-error-msg">{errors.buyerEmail}</span>}

                    {/* Buyer Mobile Phone Number */}
                    <div className={`login-input-row ${errors.buyerPhone ? 'login-input-row--error' : ''}`}>
                      <div className="login-phone-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span className="login-country-text">+91</span>
                        <svg className="login-prefix-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder={r.phonePlaceholder || '10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ'}
                        value={buyerPhone}
                        maxLength={10}
                        onChange={(e) => {
                          setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          clearError('buyerPhone');
                        }}
                      />
                    </div>
                    {errors.buyerPhone && <span className="login-error-msg">{errors.buyerPhone}</span>}

                    {/* Market Location / City */}
                    <div className={`login-input-row ${errors.buyerLocation ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type="text"
                        placeholder={r.marketLocationPlaceholder || 'District (e.g. Kolar)'}
                        value={buyerLocation}
                        onChange={(e) => {
                          setBuyerLocation(e.target.value);
                          clearError('buyerLocation');
                        }}
                      />
                    </div>
                    {errors.buyerLocation && <span className="login-error-msg">{errors.buyerLocation}</span>}

                    {/* Business Category Select */}
                    <div className="login-input-row">
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                          <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <select
                        className="register-clean-select"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        aria-label={r.businessTypeLabel}
                      >
                        <option value="trader">{r.businessTypeTrader || 'ಹೋಲ್‌ಸೇಲ್ ಮಂಡಿ ವ್ಯಾಪಾರಿ'}</option>
                        <option value="processor">{r.businessTypeProcessor || 'ಆಹಾರ ಸಂಸ್ಕರಣೆದಾರರು'}</option>
                        <option value="retailer">{r.businessTypeRetailer || 'ಚಿಲ್ಲರೆ ಸರಪಳಿ / ಸೂಪರ್‌ಮಾರ್ಕೆಟ್'}</option>
                        <option value="exporter">{r.businessTypeExporter || 'ರಫ್ತುದಾರರು'}</option>
                      </select>
                    </div>

                    {/* Buyer Set Password */}
                    <div className={`login-input-row ${errors.buyerPassword ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.passwordPlaceholder || 'Set password (at least 6 characters)'}
                        value={buyerPassword}
                        onChange={(e) => {
                          setBuyerPassword(e.target.value);
                          clearError('buyerPassword');
                        }}
                      />
                    </div>
                    {errors.buyerPassword && <span className="login-error-msg">{errors.buyerPassword}</span>}

                    {/* Buyer Confirm Password */}
                    <div className={`login-input-row ${errors.buyerConfirmPassword ? 'login-input-row--error' : ''}`}>
                      <div className="login-lock-prefix">
                        <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <span className="login-input-sep" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.confirmPasswordPlaceholder || 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ'}
                        value={buyerConfirmPassword}
                        onChange={(e) => {
                          setBuyerConfirmPassword(e.target.value);
                          clearError('buyerConfirmPassword');
                        }}
                      />
                      <button
                        type="button"
                        className="login-eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Toggle password"
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                    {errors.buyerConfirmPassword && <span className="login-error-msg">{errors.buyerConfirmPassword}</span>}

                    {/* Terms Checkbox */}
                    <div className="register-terms-row">
                      <label className="login-remember-wrap">
                        <input
                          type="checkbox"
                          checked={buyerTerms}
                          onChange={(e) => {
                            setBuyerTerms(e.target.checked);
                            clearError('buyerTerms');
                          }}
                        />
                        <span className="login-checkbox-box">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                        <span className="register-terms-text">{r.termsBuyer || 'ನಾನು ಡಿಜಿಟಲ್ ತೂಕದ ಪರಿಶೀಲನೆಯೊಂದಿಗೆ ಸಕಾಲಿಕ ಪಾವತಿಗೆ ಒಪ್ಪುತ್ತೇನೆ.'}</span>
                      </label>
                      {errors.buyerTerms && <span className="login-error-msg">{errors.buyerTerms}</span>}
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
                      <span>{isSubmitting ? (r.submitting || 'ಖಾತೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...') : (r.submitBuyer || 'ಖರೀದಿದಾರ ಖಾತೆ ರಚಿಸಿ')}</span>
                    </button>
                  </>
                )}

                {/* Notice Banner */}
                <div className="login-notice" style={{ marginTop: '18px' }}>
                  <svg className="login-notice-leaf" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
                  </svg>
                  <p className="login-notice-text">
                    {r.regNotice || 'ಕರ್ನಾಟಕದ ನೇರ ಸುಗ್ಗಿ ಜಾಲಕ್ಕೆ ಸೇರಿ. ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲದೆ, ಡಿಜಿಟಲ್ ತೂಕದೊಂದಿಗೆ ನ್ಯಾಯಯುತ ವ್ಯಾಪಾರ.'}
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Link */}
            <div className="login-footer">
              <span className="login-footer-text">{r.alreadyAccount || 'ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?'}</span>{' '}
              <Link to="/login" className="login-footer-link">
                {r.signIn || 'ಇಲ್ಲಿ ಸೈನ್ ಇನ್ ಮಾಡಿ →'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
