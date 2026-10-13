import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import { useLanguage } from '../../context/LanguageContext';
import WhatsAppCard from '../../components/dashboard/WhatsAppCard';
import CropImage from '../../components/CropImage';
import { CROP_SUGGESTIONS, CROP_KANNADA_MAP, findImageCrop } from '../../data/crops';
import '../../components/dashboard/dashboard-ui.css';

const UNITS = [
  { value: 'kg', labelEn: 'kg', labelKn: 'ಕೆ.ಜಿ (kg)' },
  { value: 'quintal', labelEn: 'quintal', labelKn: 'ಕ್ವಿಂಟಾಲ್ (quintal)' },
  { value: 'ton', labelEn: 'ton', labelKn: 'ಟನ್ (ton)' },
  { value: 'dozen', labelEn: 'dozen', labelKn: 'ಡಜನ್ (dozen)' },
  { value: 'crate', labelEn: 'crate', labelKn: 'ಕ್ರೇಟ್ (crate)' },
];

const GRADES = [
  { value: 'Grade A', labelEn: 'Grade A', labelKn: 'ಗ್ರೇಡ್ A (Grade A)' },
  { value: 'Grade B', labelEn: 'Grade B', labelKn: 'ಗ್ರೇಡ್ B (Grade B)' },
  { value: 'Grade C', labelEn: 'Grade C', labelKn: 'ಗ್ರೇಡ್ C (Grade C)' },
];

const emptyForm = {
  crop: '',
  quantity: '',
  unit: 'kg',
  grade: '',
  expectedPrice: '',
  availabilityDate: '',
};

const AddProduce = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addListing, profile } = useFarmerData();
  const { language } = useLanguage();
  const isKannada = language === 'kn';

  // 1. Initialize form state first
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Compute selected crop safely after form state exists
  const selectedCrop = findImageCrop(form.crop) ?? (
    form.crop.trim() ? { name: form.crop.trim(), image: null } : null
  );

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (!form.crop.trim()) {
      errors.crop = isKannada ? 'ಬೆಳೆ ಅಥವಾ ಉತ್ಪನ್ನದ ಹೆಸರು ಅಗತ್ಯವಿದೆ.' : 'Crop or product name is required.';
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      errors.quantity = isKannada ? '0 ಗಿಂತ ಹೆಚ್ಚಿನ ಪ್ರಮಾಣ ನಮೂದಿಸಿ.' : 'Enter a quantity greater than 0.';
    }
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0) {
      errors.expectedPrice = isKannada ? 'ನಿಮ್ಮ ನಿರೀಕ್ಷಿತ ಬೆಲೆ ನಮೂದಿಸಿ.' : 'Enter your expected price.';
    }
    if (!form.availabilityDate) {
      errors.availabilityDate = isKannada ? 'ಲಭ್ಯವಿರುವ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ.' : 'Choose an availability date.';
    }
    return errors;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isEditing) return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSavedMessage('');
      return;
    }
    setFieldErrors({});
    setApiError('');
    setIsSubmitting(true);
    try {
      await addListing(form);
      setSavedMessage(isKannada ? 'ಪಟ್ಟಿ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ.' : 'Listing published successfully.');
      navigate('/farmer/dashboard/listings');
    } catch (error) {
      setApiError(error.message || (isKannada ? 'ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.' : 'An error occurred. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (field) => `dash-field${fieldErrors[field] ? ' dash-field--error' : ''}`;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">
            {isEditing ? (isKannada ? 'ಪಟ್ಟಿ ತಿದ್ದುಪಡಿ' : 'Edit Listing') : (isKannada ? 'ಬೆಳೆ ಸೇರಿಸಿ' : 'Add Produce')}
          </h1>
          <p className="dash-page__subtitle">
            {isKannada
              ? 'ಖರೀದಿದಾರರು ನ್ಯಾಯಯುತ ದರ ನೀಡಲು ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.'
              : 'Give buyers the details they need to make a fair offer.'}
          </p>
        </div>
      </div>

      {!isEditing && <WhatsAppCard />}

      {isEditing ? (
        <div className="dash-panel">
          <div className="dash-banner dash-banner--error" role="status">
            {isKannada
              ? 'ಪಟ್ಟಿಗಳ ತಿದ್ದುಪಡಿಯನ್ನು ಸಿಸ್ಟಮ್ ಇನ್ನೂ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ಈ ಪಟ್ಟಿಯನ್ನು ಬದಲಾಯಿಸಲಾಗಿಲ್ಲ.'
              : 'Editing listings is not supported by the backend yet. This listing has not been changed.'}
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate('/farmer/dashboard/listings')}>
            {isKannada ? 'ನನ್ನ ಪಟ್ಟಿಗಳಿಗೆ ಹಿಂತಿರುಗಿ' : 'Back to My Listings'}
          </button>
        </div>
      ) : (
        <form className="dash-panel dash-form" onSubmit={submit} noValidate>
          {savedMessage && (
            <div className="dash-banner dash-banner--success" role="status">
              <span className="dash-banner__icon" aria-hidden="true">✓</span>
              {savedMessage}
            </div>
          )}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="dash-banner dash-banner--error" role="alert">
              <span className="dash-banner__icon" aria-hidden="true">!</span>
              {isKannada ? 'ಮುಂದುವರಿಯುವ ಮೊದಲು ದಯವಿಟ್ಟು ಅಗತ್ಯವಿರುವ ಕ್ಷೇತ್ರಗಳನ್ನು ಸರಿಪಡಿಸಿ.' : 'Please fix the highlighted fields before continuing.'}
            </div>
          )}
          {apiError && <div className="dash-banner dash-banner--error" role="alert">{apiError}</div>}

          <div className="dash-form__row">
            <div className={fieldClass('crop')}>
              <label htmlFor="crop">
                {isKannada ? 'ಬೆಳೆ / ಉತ್ಪನ್ನ' : 'Crop / Product'} <span className="dash-field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="crop"
                type="text"
                placeholder={isKannada ? 'ಉದಾ: Tomato (ಟೊಮೆಟೊ)' : 'e.g. Tomato'}
                list="crop-suggestions"
                value={form.crop}
                onChange={handleChange('crop')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.crop)}
                aria-describedby={fieldErrors.crop ? 'crop-error' : undefined}
              />
              <datalist id="crop-suggestions">
                {CROP_SUGGESTIONS.map((name) => {
                  const kn = CROP_KANNADA_MAP[name];
                  const label = kn ? `${name} (${kn})` : name;
                  return <option key={name} value={label} />;
                })}
              </datalist>
              {fieldErrors.crop && <span id="crop-error" className="dash-field__error">{fieldErrors.crop}</span>}
              {selectedCrop && (
                <div className="add-produce-crop-preview">
                  <CropImage crop={selectedCrop} />
                  <span>{selectedCrop.name}</span>
                </div>
              )}
            </div>
            <div className="dash-field">
              <label htmlFor="grade">{isKannada ? 'ಗುಣಮಟ್ಟ / ಗ್ರೇಡ್' : 'Quality / Grade'}</label>
              <select id="grade" value={form.grade} onChange={handleChange('grade')}>
                <option value="">{isKannada ? 'ಗ್ರೇಡ್ ಆಯ್ಕೆಮಾಡಿ' : 'Select grade'}</option>
                {GRADES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {isKannada ? g.labelKn : g.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dash-form__row">
            <div className={fieldClass('quantity')}>
              <label htmlFor="quantity">
                {isKannada ? 'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ' : 'Quantity'} <span className="dash-field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                placeholder={isKannada ? 'ಉದಾ: 500' : 'e.g. 500'}
                value={form.quantity}
                onChange={handleChange('quantity')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.quantity)}
                aria-describedby={fieldErrors.quantity ? 'quantity-error' : undefined}
              />
              {fieldErrors.quantity && <span id="quantity-error" className="dash-field__error">{fieldErrors.quantity}</span>}
            </div>
            <div className="dash-field">
              <label htmlFor="unit">{isKannada ? 'ಪ್ರಮಾಣದ ಘಟಕ' : 'Unit'}</label>
              <select id="unit" value={form.unit} onChange={handleChange('unit')}>
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {isKannada ? u.labelKn : u.labelEn}
                  </option>
                ))}
              </select>
            </div>
            <div className={fieldClass('expectedPrice')}>
              <label htmlFor="price">
                {isKannada ? 'ನಿರೀಕ್ಷಿತ ಬೆಲೆ (₹ ಪ್ರತಿ ಯೂನಿಟ್)' : 'Expected Price (₹ per unit)'} <span className="dash-field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.5"
                placeholder={isKannada ? 'ಉದಾ: 25' : 'e.g. 18'}
                value={form.expectedPrice}
                onChange={handleChange('expectedPrice')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.expectedPrice)}
                aria-describedby={fieldErrors.expectedPrice ? 'price-error' : undefined}
              />
              {fieldErrors.expectedPrice && <span id="price-error" className="dash-field__error">{fieldErrors.expectedPrice}</span>}
            </div>
          </div>

          <p className="dash-panel__intro">
            {isKannada ? 'ಪಿಕಪ್ ಸ್ಥಳವು ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್‌ನಿಂದ ಬರುತ್ತದೆ: ' : 'Pickup location comes from your farmer profile: '}
            {[profile?.village, profile?.taluk, profile?.district].filter(Boolean).join(', ') || (isKannada ? 'ಮೊದಲು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ' : 'complete your profile first')}.
            {' '}
            <button type="button" className="btn--text" onClick={() => navigate('/farmer/dashboard/profile')}>
              {isKannada ? 'ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ ಮಾಡಿ' : 'Edit profile'}
            </button>
          </p>

          <div className="dash-form__row">
            <div className={fieldClass('availabilityDate')}>
              <label htmlFor="availability">
                {isKannada ? 'ಲಭ್ಯವಿರುವ ದಿನಾಂಕ' : 'Availability Date'} <span className="dash-field__required" aria-hidden="true">*</span>
              </label>
              <input
                id="availability"
                type="date"
                value={form.availabilityDate}
                onChange={handleChange('availabilityDate')}
                aria-required="true"
                aria-invalid={Boolean(fieldErrors.availabilityDate)}
                aria-describedby={fieldErrors.availabilityDate ? 'availability-error' : undefined}
              />
              {fieldErrors.availabilityDate && <span id="availability-error" className="dash-field__error">{fieldErrors.availabilityDate}</span>}
            </div>
          </div>

          <div className="dash-form__actions">
            <button type="submit" className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`} disabled={isSubmitting}>
              {isKannada ? 'ಪಟ್ಟಿ ಪ್ರಕಟಿಸಿ' : 'Publish Listing'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProduce;
