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
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setPhotos(dataUrls);
    } catch {
      setError('Could not read the selected photos. Please try different files.');
    }
  };

  const validate = () => {
    if (!form.crop.trim()) return 'Please enter the crop or product name.';
    if (!form.quantity || Number(form.quantity) <= 0) return 'Please enter a valid quantity.';
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0) return 'Please enter your expected price.';
    if (!form.location.trim()) return 'Please enter a pickup location.';
    if (!form.availabilityDate) return 'Please choose an availability date.';
    return '';
  };

  const submit = (status) => (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSavedMessage('');
      return;
    }
    setError('');

    if (isEditing) {
      updateListing(id, { ...form, photos });
      setSavedMessage('Listing updated.');
    } else {
      addListing({ ...form, photos }, status);
      setSavedMessage(status === 'draft' ? 'Saved as draft.' : 'Listing published.');
    }

    setTimeout(() => navigate('/farmer/dashboard/listings'), 500);
  };

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

      <form className="dash-panel dash-form" onSubmit={submit(isEditing ? undefined : 'active')}>
        {error ? (
          <p role="alert" style={{ color: 'var(--color-tomato)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            {error}
          </p>
        ) : null}
        {savedMessage ? (
          <p role="status" style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            {savedMessage}
          </p>
        ) : null}

        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="crop">Crop / Product</label>
            <input id="crop" type="text" placeholder="e.g. Tomato" value={form.crop} onChange={handleChange('crop')} />
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
          <div className="dash-field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="0" step="0.1" placeholder="e.g. 500" value={form.quantity} onChange={handleChange('quantity')} />
          </div>
          <div className="dash-field">
            <label htmlFor="unit">Unit</label>
            <select id="unit" value={form.unit} onChange={handleChange('unit')}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="dash-field">
            <label htmlFor="price">Expected Price (₹ per unit)</label>
            <input id="price" type="number" min="0" step="0.5" placeholder="e.g. 18" value={form.expectedPrice} onChange={handleChange('expectedPrice')} />
          </div>
        </div>

        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="location">Pickup Location</label>
            <input id="location" type="text" placeholder="Village, Taluk, District" value={form.location} onChange={handleChange('location')} />
          </div>
          <div className="dash-field">
            <label htmlFor="availability">Availability Date</label>
            <input id="availability" type="date" value={form.availabilityDate} onChange={handleChange('availabilityDate')} />
          </div>
        </div>

        <div className="dash-field">
          <label htmlFor="photos">
            Photos <span className="dash-field__hint">(up to 4, helps buyers trust your listing)</span>
          </label>
          <input id="photos" type="file" accept="image/*" multiple onChange={handlePhotoChange} />
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
            <button type="submit" className="btn btn--primary">Save Changes</button>
          ) : (
            <>
              <button type="submit" className="btn btn--primary">Publish Listing</button>
              <button type="button" className="btn btn--outline" onClick={submit('draft')}>Save as Draft</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddProduce;
