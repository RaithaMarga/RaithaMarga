import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import WhatsAppCard from '../../components/dashboard/WhatsAppCard';
import CropImage from '../../components/CropImage';
import { CROP_SUGGESTIONS, findImageCrop } from '../../data/crops';
import '../../components/dashboard/dashboard-ui.css';

const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'crate'];
const GRADES = ['Grade A', 'Grade B', 'Grade C'];

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
  const selectedCrop = findImageCrop(form.crop) ?? (
    form.crop.trim() ? { name: form.crop.trim(), image: null } : null
  );

  const [form, setForm] = useState(() => {
    return emptyForm;
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const errors = {};
    if (!form.crop.trim()) errors.crop = 'Crop or product name is required.';
    if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = 'Enter a quantity greater than 0.';
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0) errors.expectedPrice = 'Enter your expected price.';
    if (!form.availabilityDate) errors.availabilityDate = 'Choose an availability date.';
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
      setSavedMessage('Listing published.');
      navigate('/farmer/dashboard/listings');
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
          <h1 className="dash-page__title">{isEditing ? 'Edit Listing' : 'Add Produce'}</h1>
          <p className="dash-page__subtitle">
            Give buyers the details they need to make a fair offer.
          </p>
        </div>
      </div>

      {!isEditing && <WhatsAppCard />}

      {isEditing ? (
        <div className="dash-panel">
          <div className="dash-banner dash-banner--error" role="status">
            Editing listings is not supported by the backend yet. This listing has not been changed.
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => navigate('/farmer/dashboard/listings')}>
            Back to My Listings
          </button>
        </div>
      ) : <form className="dash-panel dash-form" onSubmit={submit} noValidate>
        {savedMessage ? (
          <div className="dash-banner dash-banner--success" role="status">
            <span className="dash-banner__icon" aria-hidden="true">{'\u2713'}</span>
            {savedMessage}
          </div>
        ) : null}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="dash-banner dash-banner--error" role="alert">
            <span className="dash-banner__icon" aria-hidden="true">!</span>
            Please fix the highlighted fields before continuing.
          </div>
        )}
        {apiError && <div className="dash-banner dash-banner--error" role="alert">{apiError}</div>}

        <div className="dash-form__row">
          <div className={fieldClass('crop')}>
            <label htmlFor="crop">Crop / Product <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="crop"
              type="text"
              placeholder="e.g. Tomato"
              list="crop-suggestions"
              value={form.crop}
              onChange={handleChange('crop')}
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.crop)}
              aria-describedby={fieldErrors.crop ? 'crop-error' : undefined}
            />
            <datalist id="crop-suggestions">
              {CROP_SUGGESTIONS.map((name) => <option key={name} value={name} />)}
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
            <label htmlFor="grade">Quality / Grade</label>
            <select id="grade" value={form.grade} onChange={handleChange('grade')}>
              <option value="">Select grade</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="dash-form__row">
          <div className={fieldClass('quantity')}>
            <label htmlFor="quantity">Quantity <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="quantity"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 500"
              value={form.quantity}
              onChange={handleChange('quantity')}
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.quantity)}
              aria-describedby={fieldErrors.quantity ? 'quantity-error' : undefined}
            />
            {fieldErrors.quantity && <span id="quantity-error" className="dash-field__error">{fieldErrors.quantity}</span>}
          </div>
          <div className="dash-field">
            <label htmlFor="unit">Unit</label>
            <select id="unit" value={form.unit} onChange={handleChange('unit')}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className={fieldClass('expectedPrice')}>
            <label htmlFor="price">Expected Price ({'\u20B9'} per unit) <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 18"
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
          Pickup location comes from your farmer profile: {[profile.village, profile.taluk, profile.district].filter(Boolean).join(', ') || 'complete your profile first'}.
          The backend requires the listing district to match your profile district.
          <button type="button" className="btn--text" onClick={() => navigate('/farmer/dashboard/profile')}>Edit profile</button>
        </p>
        <div className="dash-form__row">
          <div className={fieldClass('availabilityDate')}>
            <label htmlFor="availability">Availability Date <span className="dash-field__required" aria-hidden="true">*</span></label>
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

        <p className="dash-panel__intro">Photos and listing edits are not supported by the backend yet.</p>

        <div className="dash-form__actions">
          <button type="submit" className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`} disabled={isSubmitting}>
            Publish Listing
          </button>
        </div>
      </form>}
    </div>
  );
};

export default AddProduce;
