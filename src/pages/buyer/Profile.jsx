import { useState } from 'react';
import { useBuyerData } from '../../context/BuyerDataContext';
import '../../components/dashboard/dashboard-ui.css';

const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'crate'];

const emptyRequirementForm = {
  crop: '',
  requiredQuantity: '',
  unit: 'kg',
  quality: '',
  targetPrice: '',
  location: '',
  neededByDate: '',
};

const Profile = () => {
  const { profile, saveProfile, requirements, addRequirement, dataError } = useBuyerData();
  const [form, setForm] = useState(profile);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [requirementError, setRequirementError] = useState('');

  const [reqForm, setReqForm] = useState(emptyRequirementForm);
  const [reqFieldErrors, setReqFieldErrors] = useState({});
  const [reqAdded, setReqAdded] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (!form.businessName.trim()) errors.businessName = 'Business name is required.';
    if (!form.contactName.trim()) errors.contactName = 'A contact person is required.';
    if (!form.location.trim()) errors.location = 'Business district is required by the backend profile.';
    if (!form.phone.trim()) errors.phone = 'A phone number is required so farmers can reach you.';
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

  const handleReqChange = (field) => (e) => {
    setReqForm((prev) => ({ ...prev, [field]: e.target.value }));
    setReqFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setReqAdded(false);
    setRequirementError('');
  };

  const handleAddRequirement = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!reqForm.crop.trim()) errors.crop = 'Crop is required.';
    if (!reqForm.requiredQuantity || Number(reqForm.requiredQuantity) <= 0) errors.requiredQuantity = 'Enter a quantity greater than 0.';
    if (!reqForm.targetPrice || Number(reqForm.targetPrice) <= 0) errors.targetPrice = 'Enter a target price greater than 0.';
    const profileDistrict = form.location.split(',').pop().trim();
    if (reqForm.location.trim() && reqForm.location.trim().toLowerCase() !== profileDistrict.toLowerCase()) {
      errors.location = `Use the same district as your buyer profile: ${profileDistrict}.`;
    }
    if (Object.keys(errors).length > 0) {
      setReqFieldErrors(errors);
      return;
    }
    setReqFieldErrors({});
    setRequirementError('');
    try {
      await addRequirement(reqForm);
      setReqForm(emptyRequirementForm);
      setReqAdded(true);
      setTimeout(() => setReqAdded(false), 2000);
    } catch (error) {
      setRequirementError(error.message);
    }
  };

  const fieldClass = (field) => `dash-field${fieldErrors[field] ? ' dash-field--error' : ''}`;
  const reqFieldClass = (field) => `dash-field${reqFieldErrors[field] ? ' dash-field--error' : ''}`;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Profile</h1>
          <p className="dash-page__subtitle">Your business name and district are stored in the backend profile.</p>
        </div>
      </div>

      <form className="dash-panel dash-form" onSubmit={handleSubmit} noValidate>
        <p className="dash-panel__intro">Phone, business type, and contact preference are saved only in this browser; the backend does not currently store these fields.</p>
        {apiError && <div className="dash-banner dash-banner--error" role="alert">{apiError}</div>}
        {saved && (
          <div className="dash-banner dash-banner--success" role="status">
            <span className="dash-banner__icon" aria-hidden="true">{'\u2713'}</span>
            Profile saved.
          </div>
        )}

        <div className="dash-form__row">
          <div className={fieldClass('businessName')}>
            <label htmlFor="businessName">Business Name <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input id="businessName" type="text" value={form.businessName} onChange={handleChange('businessName')} placeholder="e.g. Karnataka Fresh Traders" aria-required="true" aria-invalid={Boolean(fieldErrors.businessName)} />
            {fieldErrors.businessName && <span className="dash-field__error">{fieldErrors.businessName}</span>}
          </div>
          <div className={fieldClass('contactName')}>
            <label htmlFor="contactName">Contact Person <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input id="contactName" type="text" value={form.contactName} onChange={handleChange('contactName')} placeholder="e.g. Priya Rao" aria-required="true" aria-invalid={Boolean(fieldErrors.contactName)} />
            {fieldErrors.contactName && <span className="dash-field__error">{fieldErrors.contactName}</span>}
          </div>
        </div>

        <div className="dash-form__row">
          <div className={fieldClass('phone')}>
            <label htmlFor="phone">Phone Number <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input id="phone" type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="e.g. 9876543210" aria-required="true" aria-invalid={Boolean(fieldErrors.phone)} />
            {fieldErrors.phone && <span className="dash-field__error">{fieldErrors.phone}</span>}
          </div>
          <div className="dash-field">
            <label htmlFor="location">Business Location</label>
            <input id="location" type="text" value={form.location} onChange={handleChange('location')} placeholder="City / district" />
          </div>
        </div>

        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="businessType">Business Type</label>
            <select id="businessType" value={form.businessType} onChange={handleChange('businessType')}>
              <option value="trader">Trader</option>
              <option value="processor">Processor</option>
              <option value="retailer">Retailer</option>
              <option value="exporter">Exporter</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="dash-field">
            <label htmlFor="contactPref">Preferred Contact Method</label>
            <select id="contactPref" value={form.contactPreference} onChange={handleChange('contactPreference')}>
              <option value="call">Phone Call</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
          </div>
        </div>

        <div className="dash-form__actions">
          <button type="submit" className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`} disabled={isSubmitting}>
            Save Profile
          </button>
        </div>
      </form>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">Buying Requirements</h2>
        <p className="dash-panel__intro">
          Publish a requirement to help farmers see what you need. Only manually verified buyers can publish.
        </p>
        {dataError && <div className="dash-banner dash-banner--error" role="alert">{dataError}</div>}
        {requirementError && <div className="dash-banner dash-banner--error" role="alert">{requirementError}</div>}

        {requirements.length > 0 && (
          <div style={{ display: 'grid', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            {requirements.map((r) => (
              <div key={r.id} className="doc-row">
                <div className="doc-row__label">
                  <span style={{ fontWeight: 600 }}>{r.crop}</span>
                  <span className="doc-row__filename">
                    {r.requiredQuantity} {r.unit} {r.quality ? `\u2022 ${r.quality}` : ''} {r.targetPrice ? `\u2022 up to \u20B9${r.targetPrice}` : ''} {r.location ? `\u2022 ${r.location}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form className="dash-form" onSubmit={handleAddRequirement} noValidate>
          {reqAdded && (
            <div className="dash-banner dash-banner--success" role="status">
              <span className="dash-banner__icon" aria-hidden="true">{'\u2713'}</span>
              Requirement added.
            </div>
          )}
          <div className="dash-form__row">
            <div className={reqFieldClass('crop')}>
              <label htmlFor="reqCrop">Crop <span className="dash-field__required" aria-hidden="true">*</span></label>
              <input id="reqCrop" type="text" value={reqForm.crop} onChange={handleReqChange('crop')} placeholder="e.g. Onion" aria-required="true" aria-invalid={Boolean(reqFieldErrors.crop)} />
              {reqFieldErrors.crop && <span className="dash-field__error">{reqFieldErrors.crop}</span>}
            </div>
            <div className={reqFieldClass('requiredQuantity')}>
              <label htmlFor="reqQty">Required Quantity <span className="dash-field__required" aria-hidden="true">*</span></label>
              <input id="reqQty" type="number" min="0" value={reqForm.requiredQuantity} onChange={handleReqChange('requiredQuantity')} placeholder="e.g. 1000" aria-required="true" aria-invalid={Boolean(reqFieldErrors.requiredQuantity)} />
              {reqFieldErrors.requiredQuantity && <span className="dash-field__error">{reqFieldErrors.requiredQuantity}</span>}
            </div>
            <div className="dash-field">
              <label htmlFor="reqUnit">Unit</label>
              <select id="reqUnit" value={reqForm.unit} onChange={handleReqChange('unit')}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="dash-form__row">
            <div className="dash-field">
              <label htmlFor="reqQuality">Quality / Grade</label>
              <input id="reqQuality" type="text" value={reqForm.quality} onChange={handleReqChange('quality')} placeholder="e.g. Grade A" />
            </div>
            <div className={reqFieldClass('targetPrice')}>
              <label htmlFor="reqPrice">Target Price ({'\u20B9'} per unit)</label>
              <input id="reqPrice" type="number" min="0" value={reqForm.targetPrice} onChange={handleReqChange('targetPrice')} placeholder="e.g. 20" />
              {reqFieldErrors.targetPrice && <span className="dash-field__error">{reqFieldErrors.targetPrice}</span>}
            </div>
            <div className="dash-field">
              <label htmlFor="reqDate">Needed By</label>
              <input id="reqDate" type="date" value={reqForm.neededByDate} onChange={handleReqChange('neededByDate')} />
            </div>
          </div>
          <div className={reqFieldClass('location')}>
            <label htmlFor="reqLocation">Requirement District</label>
            <input id="reqLocation" type="text" value={reqForm.location} onChange={handleReqChange('location')} placeholder={form.location.split(',').pop().trim() || 'Set district in buyer profile'} />
            {reqFieldErrors.location && <span className="dash-field__error">{reqFieldErrors.location}</span>}
          </div>
          <div className="dash-form__actions">
            <button type="submit" className="btn btn--outline btn--sm">+ Publish Requirement</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
