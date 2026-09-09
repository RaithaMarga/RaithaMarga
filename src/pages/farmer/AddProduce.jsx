import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import '../../components/dashboard/dashboard-ui.css';

const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'crate'];
const GRADES = ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Basic)'];

const emptyForm = {
  crop: '',
  quantity: '',
  unit: 'kg',
  grade: '',
  expectedPrice: '',
  location: '',
  availabilityDate: '',
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const AddProduce = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { addListing, updateListing, getListing } = useFarmerData();

  const [form, setForm] = useState(() => {
    if (isEditing) {
      const existing = getListing(id);
      if (existing) {
        return {
          crop: existing.crop,
          quantity: existing.quantity,
          unit: existing.unit,
          grade: existing.grade,
          expectedPrice: existing.expectedPrice,
          location: existing.location,
          availabilityDate: existing.availabilityDate,
        };
      }
    }
    return emptyForm;
  });
  const [photos, setPhotos] = useState(() => (isEditing ? getListing(id)?.photos || [] : []));
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoError, setPhotoError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setPhotos(dataUrls);
      setPhotoError('');
    } catch {
      setPhotoError('Could not read the selected photos. Please try different files.');
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.crop.trim()) errors.crop = 'Crop or product name is required.';
    if (!form.quantity || Number(form.quantity) <= 0) errors.quantity = 'Enter a quantity greater than 0.';
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0) errors.expectedPrice = 'Enter your expected price.';
    if (!form.location.trim()) errors.location = 'Pickup location is required.';
    if (!form.availabilityDate) errors.availabilityDate = 'Choose an availability date.';
    return errors;
  };

  const submit = (status) => (e) => {
    e.preventDefault();
    if (isSubmitting) return; // guard against double-submit (e.g. double click)

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSavedMessage('');
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setPendingStatus(status);

    // Brief simulated save so the UI shows a real loading state, even
    // though this currently just writes to localStorage.
    setTimeout(() => {
      if (isEditing) {
        updateListing(id, { ...form, photos });
        setSavedMessage('Listing updated.');
      } else {
        addListing({ ...form, photos }, status);
        setSavedMessage(status === 'draft' ? 'Saved as draft.' : 'Listing published.');
      }
      setTimeout(() => navigate('/farmer/dashboard/listings'), 400);
    }, 400);
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

      <form className="dash-panel dash-form" onSubmit={submit(isEditing ? undefined : 'active')} noValidate>
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

        <div className="dash-form__row">
          <div className={fieldClass('crop')}>
            <label htmlFor="crop">Crop / Product <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="crop"
              type="text"
              placeholder="e.g. Tomato"
              value={form.crop}
              onChange={handleChange('crop')}
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.crop)}
              aria-describedby={fieldErrors.crop ? 'crop-error' : undefined}
            />
            {fieldErrors.crop && <span id="crop-error" className="dash-field__error">{fieldErrors.crop}</span>}
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

        <div className="dash-form__row">
          <div className={fieldClass('location')}>
            <label htmlFor="location">Pickup Location <span className="dash-field__required" aria-hidden="true">*</span></label>
            <input
              id="location"
              type="text"
              placeholder="Village, Taluk, District"
              value={form.location}
              onChange={handleChange('location')}
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.location)}
              aria-describedby={fieldErrors.location ? 'location-error' : undefined}
            />
            {fieldErrors.location && <span id="location-error" className="dash-field__error">{fieldErrors.location}</span>}
          </div>
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

        <div className="dash-field">
          <label htmlFor="photos">
            Photos <span className="dash-field__hint">(up to 4, helps buyers trust your listing)</span>
          </label>
          <input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoChange} />
          {photoError && <span className="dash-field__error">{photoError}</span>}
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Produce preview ${i + 1}`}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="dash-form__actions">
          {isEditing ? (
            <button type="submit" className={`btn btn--primary${isSubmitting ? ' btn--loading' : ''}`} disabled={isSubmitting}>
              Save Changes
            </button>
          ) : (
            <>
              <button
                type="submit"
                className={`btn btn--primary${isSubmitting && pendingStatus === 'active' ? ' btn--loading' : ''}`}
                disabled={isSubmitting}
              >
                Publish Listing
              </button>
              <button
                type="button"
                className={`btn btn--outline${isSubmitting && pendingStatus === 'draft' ? ' btn--loading' : ''}`}
                disabled={isSubmitting}
                onClick={submit('draft')}
              >
                Save as Draft
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProduce;
