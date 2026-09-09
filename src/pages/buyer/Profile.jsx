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
  const { profile, setProfile, requirements, addRequirement, removeRequirement } = useBuyerData();
  const [form, setForm] = useState(profile);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!form.phone.trim()) errors.phone = 'A phone number is required so farmers can reach you.';
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSaved(false);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setProfile(form);
      setIsSubmitting(false);
      setSaved(true);
    }, 350);
  };

  const handleReqChange = (field) => (e) => {
    setReqForm((prev) => ({ ...prev, [field]: e.target.value }));
    setReqFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setReqAdded(false);
  };

  const handleAddRequirement = (e) => {
    e.preventDefault();
    const errors = {};
    if (!reqForm.crop.trim()) errors.crop = 'Crop is required.';
    if (!reqForm.requiredQuantity || Number(reqForm.requiredQuantity) <= 0) errors.requiredQuantity = 'Enter a quantity greater than 0.';
    if (Object.keys(errors).length > 0) {
      setReqFieldErrors(errors);
      return;
    }
    setReqFieldErrors({});
    addRequirement(reqForm);
    setReqForm(emptyRequirementForm);
    setReqAdded(true);
    setTimeout(() => setReqAdded(false), 2000);
  };

  const fieldClass = (field) => `dash-field${fieldErrors[field] ? ' dash-field--error' : ''}`;
  const reqFieldClass = (field) => `dash-field${reqFieldErrors[field] ? ' dash-field--error' : ''}`;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Profile</h1>
          <p className="dash-page__subtitle">Your business details are shared with farmers once a deal is confirmed.</p>
        </div>
      </div>

      <form className="dash-panel dash-form" onSubmit={handleSubmit} noValidate>
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
          Save what you're typically looking to buy — this will power Recommended Matches once matching is live.
        </p>

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
                <button type="button" className="btn--text" onClick={() => removeRequirement(r.id)}>Remove</button>
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
            <div className="dash-field">
              <label htmlFor="reqPrice">Target Price ({'\u20B9'} per unit)</label>
              <input id="reqPrice" type="number" min="0" value={reqForm.targetPrice} onChange={handleReqChange('targetPrice')} placeholder="e.g. 20" />
            </div>
            <div className="dash-field">
              <label htmlFor="reqDate">Needed By</label>
              <input id="reqDate" type="date" value={reqForm.neededByDate} onChange={handleReqChange('neededByDate')} />
            </div>
          </div>
          <div className="dash-field">
            <label htmlFor="reqLocation">Preferred Pickup Location</label>
            <input id="reqLocation" type="text" value={reqForm.location} onChange={handleReqChange('location')} placeholder="District / region" />
          </div>
          <div className="dash-form__actions">
            <button type="submit" className="btn btn--outline btn--sm">+ Add Requirement</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
