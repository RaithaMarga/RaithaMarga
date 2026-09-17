import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { STORAGE_KEYS } from '../data/storageKeys';
import logoMark from '../assets/logo-mark.png';
import logoSeal from '../assets/logo-seal.png';
import './Register.css';

const PHONE_REGEX = /^[6-9]\d{9}$/;

// Defensive fallbacks in case translations are missing
const DEFAULT_R = {
  panelTitle: 'Join the Direct Harvest Network',
  panelSubtitle: 'Create your account in under 2 minutes. Eliminate middlemen, get fair prices, and trade with photo-proof weighing scale trust.',
  eyebrow: 'New Registration',
  title: 'Get Started with RaithaMarga',
  subtitle: 'Select your account type and fill in your details to begin.',
  roleFarmer: 'I am a Farmer',
  roleBuyer: 'I am a Buyer',
  nameLabel: 'Full Name',
  namePlaceholder: 'e.g. Basavarajappa Gowda',
  businessNameLabel: 'Business / Firm Name',
  businessNamePlaceholder: 'e.g. Kolar Fresh Produce Wholesalers',
  contactNameLabel: 'Contact Person Name',
  contactNamePlaceholder: 'e.g. Anand Kumar',
  phoneLabel: 'Mobile Number',
  phonePlaceholder: '10-digit mobile number',
  villageLabel: 'Village / Taluk',
  villagePlaceholder: 'e.g. Malur, Kolar',
  marketLocationLabel: 'Market Location / City',
  marketLocationPlaceholder: 'e.g. Kolar APMC Yard',
  cropLabel: 'Primary Crop',
  cropTomato: 'Tomato (Kolar Pilot Crop)',
  cropOnion: 'Onion',
  cropPotato: 'Potato',
  cropChilli: 'Green Chilli',
  cropOther: 'Other Horticulture',
  businessTypeLabel: 'Business Category',
  businessTypeTrader: 'Wholesale Mandi Trader',
  businessTypeProcessor: 'Food Processor / Canner',
  businessTypeRetailer: 'Retail Chain / Supermarket',
  businessTypeExporter: 'Exporter',
  landSizeLabel: 'Land Holding Size',
  landSizeSmall: 'Under 2 Hectares (Small/Marginal)',
  landSizeMedium: '2 to 5 Hectares',
  landSizeLarge: 'Above 5 Hectares',
  passwordLabel: 'Set Password',
  passwordPlaceholder: 'Minimum 4 characters',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Re-enter password',
  termsFarmer: 'I agree to photo-proof digital scale weighing and transparent lot pooling.',
  termsBuyer: 'I agree to prompt payment settlements backed by digital scale verification.',
  submitFarmer: 'Create Farmer Account',
  submitBuyer: 'Create Buyer Account',
  submitting: 'Creating Account...',
  alreadyAccount: 'Already have an account?',
  signIn: 'Sign In',
  demoQuickFill: 'Quick Demo Registration:',
  demoFarmer: 'Demo Farmer',
  demoBuyer: 'Demo Buyer',
  errorName: 'Please enter your name',
  errorBusinessName: 'Please enter your business or firm name',
  errorPhone: 'Please enter a valid 10-digit mobile number',
  errorLocation: 'Please enter your village, taluk, or location',
  errorPassword: 'Password must be at least 4 characters',
  errorPasswordMatch: 'Passwords do not match',
  errorTerms: 'Please accept the platform terms to continue',
};

const Register = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const r = { ...DEFAULT_R, ...(t?.register || {}) };
  const navigate = useNavigate();

  const [role, setRole] = useState('farmer'); // 'farmer' | 'buyer'

  // Farmer form state
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [farmerCrop, setFarmerCrop] = useState('Tomato');
  const [farmerLandSize, setFarmerLandSize] = useState('under_2');
  const [farmerPassword, setFarmerPassword] = useState('');
  const [farmerConfirmPassword, setFarmerConfirmPassword] = useState('');
  const [farmerTerms, setFarmerTerms] = useState(true);

  // Buyer form state
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('');
  const [businessType, setBusinessType] = useState('trader');
  const [buyerPassword, setBuyerPassword] = useState('');
  const [buyerConfirmPassword, setBuyerConfirmPassword] = useState('');
  const [buyerTerms, setBuyerTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
  };

  // Quick Demo fill buttons
  const fillDemoFarmer = () => {
    setRole('farmer');
    setFarmerName('Basavarajappa Gowda');
    setFarmerPhone('9876543210');
    setFarmerVillage('Malur Taluk, Kolar');
    setFarmerCrop('Tomato');
    setFarmerLandSize('under_2');
    setFarmerPassword('demo123');
    setFarmerConfirmPassword('demo123');
    setFarmerTerms(true);
    setErrors({});
  };

  const fillDemoBuyer = () => {
    setRole('buyer');
    setBusinessName('Kolar Agro Fresh Wholesalers');
    setContactName('Anand Kumar');
    setBuyerPhone('9845012345');
    setBuyerLocation('APMC Yard, Kolar');
    setBusinessType('trader');
    setBuyerPassword('demo123');
    setBuyerConfirmPassword('demo123');
    setBuyerTerms(true);
    setErrors({});
  };

  const validateFarmer = () => {
    const nextErrors = {};
    if (!farmerName.trim()) nextErrors.farmerName = r.errorName;
    if (!PHONE_REGEX.test(farmerPhone.trim())) nextErrors.farmerPhone = r.errorPhone;
    if (!farmerVillage.trim()) nextErrors.farmerVillage = r.errorLocation;
    if (!farmerPassword || farmerPassword.length < 4) nextErrors.farmerPassword = r.errorPassword;
    if (farmerPassword !== farmerConfirmPassword) nextErrors.farmerConfirmPassword = r.errorPasswordMatch;
    if (!farmerTerms) nextErrors.farmerTerms = r.errorTerms;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateBuyer = () => {
    const nextErrors = {};
    if (!businessName.trim()) nextErrors.businessName = r.errorBusinessName;
    if (!contactName.trim()) nextErrors.contactName = r.errorName;
    if (!PHONE_REGEX.test(buyerPhone.trim())) nextErrors.buyerPhone = r.errorPhone;
    if (!buyerLocation.trim()) nextErrors.buyerLocation = r.errorLocation;
    if (!buyerPassword || buyerPassword.length < 4) nextErrors.buyerPassword = r.errorPassword;
    if (buyerPassword !== buyerConfirmPassword) nextErrors.buyerConfirmPassword = r.errorPasswordMatch;
    if (!buyerTerms) nextErrors.buyerTerms = r.errorTerms;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (role === 'farmer') {
      if (!validateFarmer()) return;
      setIsSubmitting(true);

      // Persist to localStorage matching FarmerDataContext
      try {
        const newProfile = {
          name: farmerName.trim(),
          phone: farmerPhone.trim(),
          village: farmerVillage.trim(),
          taluk: 'Kolar',
          district: 'Kolar',
          state: 'Karnataka',
          pincode: '563101',
          landSizeAcres: farmerLandSize === 'under_2' ? '1.5' : '3.5',
          preferredCrops: farmerCrop,
          contactPreference: 'call',
        };
        localStorage.setItem(STORAGE_KEYS.FARMER_PROFILE, JSON.stringify(newProfile));
      } catch {
        // localStorage fallback
      }

      window.setTimeout(() => {
        navigate('/farmer/dashboard');
      }, 500);
    } else {
      if (!validateBuyer()) return;
      setIsSubmitting(true);

      // Persist to localStorage matching BuyerDataContext
      try {
        const newProfile = {
          businessName: businessName.trim(),
          contactName: contactName.trim(),
          phone: buyerPhone.trim(),
          location: buyerLocation.trim(),
          businessType: businessType,
          contactPreference: 'call',
        };
        localStorage.setItem(STORAGE_KEYS.BUYER_PROFILE, JSON.stringify(newProfile));
      } catch {
        // localStorage fallback
      }

      window.setTimeout(() => {
        navigate('/buyer/dashboard');
      }, 500);
    }
  };

  return (
    <div className="login-page register-page">
      {/* ---------- Left: Brand & Trust Panel ---------- */}
      <div className="login-panel" aria-hidden="true">
        <div className="login-panel__pattern" />
        <div className="login-panel__content">
          <Link to="/" className="login-panel__logo">
            <img src={logoSeal} alt="RaithaMarga" width="68" height="68" />
          </Link>

          <h2 className="login-panel__title">{r.panelTitle}</h2>
          <p className="login-panel__subtitle">{r.panelSubtitle}</p>

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

      {/* ---------- Right: Registration Form ---------- */}
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
          <div className="login-card-container register-card-container">
            {/* Quick Demo Registration Chips */}
            <div className="login-demo-bar">
              <span className="login-demo-label">{r.demoQuickFill}</span>
              <div className="login-demo-chips">
                <button
                  type="button"
                  className="login-demo-chip"
                  onClick={fillDemoFarmer}
                >
                  🌾 {r.demoFarmer}
                </button>
                <button
                  type="button"
                  className="login-demo-chip"
                  onClick={fillDemoBuyer}
                >
                  🏢 {r.demoBuyer}
                </button>
              </div>
            </div>

            <form className="login-card register-card" onSubmit={handleSubmit} noValidate>
              <div className="login-card__heading-group">
                <span className="eyebrow">{r.eyebrow}</span>
                <h1 className="login-card__title">{r.title}</h1>
                <p className="login-card__subtitle">{r.subtitle}</p>
              </div>

              {/* Role Selection: Farmer vs Buyer */}
              <div className="login-role" role="radiogroup" aria-label="Account Role">
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
                  {r.roleFarmer}
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
                  {r.roleBuyer}
                </button>
              </div>

              {/* ========== FARMER FORM FIELDS ========== */}
              {role === 'farmer' && (
                <>
                  <div className={`login-field ${errors.farmerName ? 'login-field--error' : ''}`}>
                    <label htmlFor="reg-farmer-name">{r.nameLabel}</label>
                    <input
                      id="reg-farmer-name"
                      type="text"
                      autoComplete="name"
                      placeholder={r.namePlaceholder}
                      value={farmerName}
                      onChange={(e) => {
                        setFarmerName(e.target.value);
                        clearError('farmerName');
                      }}
                    />
                    {errors.farmerName && <span className="login-field__error">{errors.farmerName}</span>}
                  </div>

                  <div className={`login-field ${errors.farmerPhone ? 'login-field--error' : ''}`}>
                    <label htmlFor="reg-farmer-phone">{r.phoneLabel}</label>
                    <div className="login-field__phone">
                      <span className="login-field__prefix">+91</span>
                      <input
                        id="reg-farmer-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder={r.phonePlaceholder}
                        value={farmerPhone}
                        maxLength={10}
                        onChange={(e) => {
                          setFarmerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                          clearError('farmerPhone');
                        }}
                      />
                    </div>
                    {errors.farmerPhone && <span className="login-field__error">{errors.farmerPhone}</span>}
                  </div>

                  <div className="register-grid">
                    <div className={`login-field ${errors.farmerVillage ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-farmer-village">{r.villageLabel}</label>
                      <input
                        id="reg-farmer-village"
                        type="text"
                        placeholder={r.villagePlaceholder}
                        value={farmerVillage}
                        onChange={(e) => {
                          setFarmerVillage(e.target.value);
                          clearError('farmerVillage');
                        }}
                      />
                      {errors.farmerVillage && <span className="login-field__error">{errors.farmerVillage}</span>}
                    </div>

                    <div className="login-field">
                      <label htmlFor="reg-farmer-crop">{r.cropLabel}</label>
                      <select
                        id="reg-farmer-crop"
                        className="register-select"
                        value={farmerCrop}
                        onChange={(e) => setFarmerCrop(e.target.value)}
                      >
                        <option value="Tomato">{r.cropTomato}</option>
                        <option value="Onion">{r.cropOnion}</option>
                        <option value="Potato">{r.cropPotato}</option>
                        <option value="Chilli">{r.cropChilli}</option>
                        <option value="Other">{r.cropOther}</option>
                      </select>
                    </div>
                  </div>

                  <div className="login-field">
                    <label htmlFor="reg-farmer-land">{r.landSizeLabel}</label>
                    <select
                      id="reg-farmer-land"
                      className="register-select"
                      value={farmerLandSize}
                      onChange={(e) => setFarmerLandSize(e.target.value)}
                    >
                      <option value="under_2">{r.landSizeSmall}</option>
                      <option value="2_to_5">{r.landSizeMedium}</option>
                      <option value="above_5">{r.landSizeLarge}</option>
                    </select>
                  </div>

                  <div className="register-grid">
                    <div className={`login-field ${errors.farmerPassword ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-farmer-pw">{r.passwordLabel}</label>
                      <input
                        id="reg-farmer-pw"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.passwordPlaceholder}
                        value={farmerPassword}
                        onChange={(e) => {
                          setFarmerPassword(e.target.value);
                          clearError('farmerPassword');
                        }}
                      />
                      {errors.farmerPassword && <span className="login-field__error">{errors.farmerPassword}</span>}
                    </div>

                    <div className={`login-field ${errors.farmerConfirmPassword ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-farmer-cpw">{r.confirmPasswordLabel}</label>
                      <input
                        id="reg-farmer-cpw"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.confirmPasswordPlaceholder}
                        value={farmerConfirmPassword}
                        onChange={(e) => {
                          setFarmerConfirmPassword(e.target.value);
                          clearError('farmerConfirmPassword');
                        }}
                      />
                      {errors.farmerConfirmPassword && <span className="login-field__error">{errors.farmerConfirmPassword}</span>}
                    </div>
                  </div>

                  <div className={`register-terms ${errors.farmerTerms ? 'register-terms--error' : ''}`}>
                    <label className="login-remember">
                      <input
                        type="checkbox"
                        checked={farmerTerms}
                        onChange={(e) => {
                          setFarmerTerms(e.target.checked);
                          clearError('farmerTerms');
                        }}
                      />
                      <span>{r.termsFarmer}</span>
                    </label>
                    {errors.farmerTerms && <span className="login-field__error">{errors.farmerTerms}</span>}
                  </div>

                  <button
                    type="submit"
                    className={`btn btn--primary btn--animated login-submit ${isSubmitting ? 'btn--loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    <span className="btn__shine" aria-hidden="true" />
                    {isSubmitting ? r.submitting : r.submitFarmer}
                  </button>
                </>
              )}

              {/* ========== BUYER FORM FIELDS ========== */}
              {role === 'buyer' && (
                <>
                  <div className={`login-field ${errors.businessName ? 'login-field--error' : ''}`}>
                    <label htmlFor="reg-buyer-business">{r.businessNameLabel}</label>
                    <input
                      id="reg-buyer-business"
                      type="text"
                      placeholder={r.businessNamePlaceholder}
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        clearError('businessName');
                      }}
                    />
                    {errors.businessName && <span className="login-field__error">{errors.businessName}</span>}
                  </div>

                  <div className="register-grid">
                    <div className={`login-field ${errors.contactName ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-buyer-contact">{r.contactNameLabel}</label>
                      <input
                        id="reg-buyer-contact"
                        type="text"
                        autoComplete="name"
                        placeholder={r.contactNamePlaceholder}
                        value={contactName}
                        onChange={(e) => {
                          setContactName(e.target.value);
                          clearError('contactName');
                        }}
                      />
                      {errors.contactName && <span className="login-field__error">{errors.contactName}</span>}
                    </div>

                    <div className={`login-field ${errors.buyerPhone ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-buyer-phone">{r.phoneLabel}</label>
                      <div className="login-field__phone">
                        <span className="login-field__prefix">+91</span>
                        <input
                          id="reg-buyer-phone"
                          type="tel"
                          inputMode="numeric"
                          placeholder={r.phonePlaceholder}
                          value={buyerPhone}
                          maxLength={10}
                          onChange={(e) => {
                            setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                            clearError('buyerPhone');
                          }}
                        />
                      </div>
                      {errors.buyerPhone && <span className="login-field__error">{errors.buyerPhone}</span>}
                    </div>
                  </div>

                  <div className="register-grid">
                    <div className={`login-field ${errors.buyerLocation ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-buyer-location">{r.marketLocationLabel}</label>
                      <input
                        id="reg-buyer-location"
                        type="text"
                        placeholder={r.marketLocationPlaceholder}
                        value={buyerLocation}
                        onChange={(e) => {
                          setBuyerLocation(e.target.value);
                          clearError('buyerLocation');
                        }}
                      />
                      {errors.buyerLocation && <span className="login-field__error">{errors.buyerLocation}</span>}
                    </div>

                    <div className="login-field">
                      <label htmlFor="reg-buyer-type">{r.businessTypeLabel}</label>
                      <select
                        id="reg-buyer-type"
                        className="register-select"
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                      >
                        <option value="trader">{r.businessTypeTrader}</option>
                        <option value="processor">{r.businessTypeProcessor}</option>
                        <option value="retailer">{r.businessTypeRetailer}</option>
                        <option value="exporter">{r.businessTypeExporter}</option>
                      </select>
                    </div>
                  </div>

                  <div className="register-grid">
                    <div className={`login-field ${errors.buyerPassword ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-buyer-pw">{r.passwordLabel}</label>
                      <input
                        id="reg-buyer-pw"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.passwordPlaceholder}
                        value={buyerPassword}
                        onChange={(e) => {
                          setBuyerPassword(e.target.value);
                          clearError('buyerPassword');
                        }}
                      />
                      {errors.buyerPassword && <span className="login-field__error">{errors.buyerPassword}</span>}
                    </div>

                    <div className={`login-field ${errors.buyerConfirmPassword ? 'login-field--error' : ''}`}>
                      <label htmlFor="reg-buyer-cpw">{r.confirmPasswordLabel}</label>
                      <input
                        id="reg-buyer-cpw"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={r.confirmPasswordPlaceholder}
                        value={buyerConfirmPassword}
                        onChange={(e) => {
                          setBuyerConfirmPassword(e.target.value);
                          clearError('buyerConfirmPassword');
                        }}
                      />
                      {errors.buyerConfirmPassword && <span className="login-field__error">{errors.buyerConfirmPassword}</span>}
                    </div>
                  </div>

                  <div className={`register-terms ${errors.buyerTerms ? 'register-terms--error' : ''}`}>
                    <label className="login-remember">
                      <input
                        type="checkbox"
                        checked={buyerTerms}
                        onChange={(e) => {
                          setBuyerTerms(e.target.checked);
                          clearError('buyerTerms');
                        }}
                      />
                      <span>{r.termsBuyer}</span>
                    </label>
                    {errors.buyerTerms && <span className="login-field__error">{errors.buyerTerms}</span>}
                  </div>

                  <button
                    type="submit"
                    className={`btn btn--primary btn--animated login-submit ${isSubmitting ? 'btn--loading' : ''}`}
                    disabled={isSubmitting}
                  >
                    <span className="btn__shine" aria-hidden="true" />
                    {isSubmitting ? r.submitting : r.submitBuyer}
                  </button>
                </>
              )}

              <p className="login-card__footer">
                {r.alreadyAccount} <Link to="/login">{r.signIn}</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

