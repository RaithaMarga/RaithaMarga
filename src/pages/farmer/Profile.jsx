import { useState } from 'react';
import { useFarmerData } from '../../context/FarmerDataContext';
import '../../components/dashboard/dashboard-ui.css';

const Profile = () => {
  const { profile, saveProfile } = useFarmerData();
  const [form, setForm] = useState(profile);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Your name is required.';
    if (!form.village.trim()) errors.village = 'Village is required by the backend profile.';
    if (!form.taluk.trim()) errors.taluk = 'Taluk is required by the backend profile.';
    if (!form.district.trim()) errors.district = 'District is required by the backend profile.';
    if (!form.state.trim()) errors.state = 'State is required by the backend profile.';
    if (Number(form.landSizeAcres || 0) < 0) errors.landSizeAcres = 'Land size cannot be negative.';
    if (!form.phone.trim()) errors.phone = 'A phone number is required so buyers can reach you.';
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaved(false);
      return;
    }
    setFieldErrors({});
    setApiError('');
    setIsSubmitting(true);
    try {
      await saveProfile(form);
      setSaved(true);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field) => `dash-field${fieldErrors[field] ? ' dash-field--error' : ''}`;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Profile</h1>
          <p className="dash-page__subtitle">Your backend profile stores your name and farm location details.</p>
        </div>
      </div>

      <form className="dash-panel dash-form" onSubmit={handleSubmit} noValidate>
        <p className="dash-panel__intro">Phone, pincode, preferred crops, and contact preference are saved only in this browser; the backend does not currently store these fields.</p>
        {apiError && <div className="dash-banner dash-banner--error" role="alert">{apiError}</div>}
        {saved && (
          <div className="dash-banner dash-banner--success" role="status">
            <span className="dash-banner__icon" aria-hidden="true">{'\u2713'}</span>
            Profile saved.
          </div>
        )}

        <div className="dash-form__row">
          <div className={fieldClass('name')}>
            <label htmlFor="name">Full Name <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Manjunath Gowda"
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && <span className="dash-field__error">{fieldErrors.name}</span>}
          </div>
          <div className={fieldClass('phone')}>
            <label htmlFor="phone">Phone Number <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="e.g. 9876543210"
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && <span className="dash-field__error">{fieldErrors.phone}</span>}
          </div>
        </div>

        <div className="dash-form__row">
          <div className={fieldClass('village')}>
            <label htmlFor="village">Village</label>
            <input id="village" type="text" value={form.village} onChange={handleChange('village')} />
            {fieldErrors.village && <span className="dash-field__error">{fieldErrors.village}</span>}
          </div>
          <div className={fieldClass('taluk')}>
            <label htmlFor="taluk">Taluk</label>
            <input id="taluk" type="text" value={form.taluk} onChange={handleChange('taluk')} />
            {fieldErrors.taluk && <span className="dash-field__error">{fieldErrors.taluk}</span>}
          </div>
          <div className={fieldClass('district')}>
            <label htmlFor="district">District</label>
            <input id="district" type="text" value={form.district} onChange={handleChange('district')} />
            {fieldErrors.district && <span className="dash-field__error">{fieldErrors.district}</span>}
          </div>
        </div>

        <div className="dash-form__row">
          <div className={fieldClass('state')}>
            <label htmlFor="state">State</label>
            <input id="state" type="text" value={form.state} onChange={handleChange('state')} />
            {fieldErrors.state && <span className="dash-field__error">{fieldErrors.state}</span>}
          </div>
          <div className="dash-field">
            <label htmlFor="pincode">Pincode</label>
            <input id="pincode" type="text" inputMode="numeric" value={form.pincode} onChange={handleChange('pincode')} />
          </div>
          <div className={fieldClass('landSizeAcres')}>
            <label htmlFor="landSize">Land Size (acres)</label>
            <input id="landSize" type="number" min="0" step="0.1" value={form.landSizeAcres} onChange={handleChange('landSizeAcres')} />
            {fieldErrors.landSizeAcres && <span className="dash-field__error">{fieldErrors.landSizeAcres}</span>}
          </div>
        </div>

        <div className="dash-field">
          <label htmlFor="crops">Preferred / Usual Crops</label>
          <textarea id="crops" value={form.preferredCrops} onChange={handleChange('preferredCrops')} placeholder="e.g. Tomato, Ragi, Maize" />
        </div>

        <div className="dash-field">
          <label htmlFor="contactPref">Preferred Contact Method</label>
          <select id="contactPref" value={form.contactPreference} onChange={handleChange('contactPreference')}>
            <option value="call">Phone Call</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
        </div>

        <div className="dash-form__actions">
          <button type="submit" className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`} disabled={isSubmitting}>
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
