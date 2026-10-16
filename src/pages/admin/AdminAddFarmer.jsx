import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import { CROP_SUGGESTIONS } from '../../data/crops';
import { WHATSAPP_DISPLAY } from '../../config/whatsapp';
import { useMarketplaceListings } from '../../hooks/useMarketplaceListings';
import {
  addAssistedListing,
  getAssistedFarmers,
  normalizePhone,
  removeAssistedFarmer,
  saveAssistedFarmer,
} from '../../lib/assistedFarmers';
import { formatDateTime } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const UNITS = ['kg', 'quintal', 'ton', 'dozen', 'crate'];
const GRADES = ['', 'Grade A', 'Grade B', 'Grade C'];

const EMPTY = {
  name: '', phone: '', village: '', taluk: '', district: 'Kolar', notes: '',
  crop: '', quantity: '', unit: 'kg', price: '', grade: '', availabilityDate: '',
};

const AdminAddFarmer = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [farmers, setFarmers] = useState(getAssistedFarmers);
  const listings = useMarketplaceListings();

  useEffect(() => {
    const refresh = () => setFarmers(getAssistedFarmers());
    window.addEventListener('raithamarga-assisted-farmers-changed', refresh);
    return () => window.removeEventListener('raithamarga-assisted-farmers-changed', refresh);
  }, []);

  const listingCount = useMemo(() => {
    const counts = {};
    listings.forEach((l) => { counts[l.farmerId] = (counts[l.farmerId] || 0) + 1; });
    return counts;
  }, [listings]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const hasProduce = Boolean(form.crop.trim() || form.quantity || form.price);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Farmer name is required.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    else if (normalizePhone(form.phone).length !== 10) next.phone = 'Enter a valid 10-digit mobile number.';
    if (hasProduce) {
      if (!form.crop.trim()) next.crop = 'Enter the crop.';
      if (!(Number(form.quantity) > 0)) next.quantity = 'Enter the quantity.';
      if (!(Number(form.price) > 0)) next.price = 'Enter the expected price.';
    }
    return next;
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage({ type: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }
    const { farmer, isNew } = saveAssistedFarmer(form);
    if (hasProduce) addAssistedListing(farmer, form);
    setMessage({
      type: 'success',
      text: `${farmer.name} ${isNew ? 'was added' : 'was updated'}${hasProduce ? ' and the produce is now live in the marketplace.' : '.'}`,
    });
    setForm(EMPTY);
  };

  const fillFor = (farmer) => {
    setForm({ ...EMPTY, name: farmer.name, phone: farmer.phone, village: farmer.village, taluk: farmer.taluk, district: farmer.district });
    setErrors({});
    setMessage({ type: 'success', text: `Adding more produce for ${farmer.name}. Fill in the crop details below.` });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = (farmer) => {
    if (!window.confirm(`Remove ${farmer.name} and all produce listed for them?`)) return;
    removeAssistedFarmer(farmer.id);
  };

  const field = (name, label, props = {}, required = false) => (
    <div className={`dash-field${errors[name] ? ' dash-field--error' : ''}`}>
      <label htmlFor={`af-${name}`}>
        {label} {required && <span className="dash-field__required" aria-hidden="true">*</span>}
      </label>
      <input id={`af-${name}`} value={form[name]} onChange={set(name)} aria-invalid={Boolean(errors[name])} {...props} />
      {errors[name] && <span className="dash-field__error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Add Farmer</h1>
          <p className="dash-page__subtitle">
            For farmers who contact the team on WhatsApp ({WHATSAPP_DISPLAY}). Only a name and phone number are needed, no email or login.
          </p>
        </div>
      </div>

      {message.text ? <div className={`dash-banner dash-banner--${message.type}`} role="status">{message.text}</div> : null}

      <form className="dash-panel dash-form" onSubmit={submit} noValidate>
        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Farmer details</h2>
        <div className="dash-form__row">
          {field('name', 'Name', { placeholder: 'e.g. Ramesh Gowda', autoComplete: 'off' }, true)}
          {field('phone', 'Phone number', { type: 'tel', inputMode: 'tel', placeholder: '10-digit mobile number' }, true)}
        </div>
        <div className="dash-form__row">
          {field('village', 'Village', { placeholder: 'Village' })}
          {field('taluk', 'Taluk', { placeholder: 'Taluk' })}
          {field('district', 'District', { placeholder: 'District' })}
        </div>

        <h2 style={{ fontSize: 'var(--font-size-lg)' }}>Produce to list <span className="admin-table__sub" style={{ display: 'inline' }}>(optional)</span></h2>
        <div className="dash-form__row">
          <div className={`dash-field${errors.crop ? ' dash-field--error' : ''}`}>
            <label htmlFor="af-crop">Crop</label>
            <input id="af-crop" list="af-crops" value={form.crop} onChange={set('crop')} placeholder="e.g. Tomato" />
            <datalist id="af-crops">{CROP_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
            {errors.crop && <span className="dash-field__error">{errors.crop}</span>}
          </div>
          {field('quantity', 'Quantity available', { type: 'number', min: '0', step: '0.1', placeholder: 'e.g. 500' })}
          <div className="dash-field">
            <label htmlFor="af-unit">Unit</label>
            <select id="af-unit" value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="dash-form__row">
          {field('price', 'Expected price (₹ per unit)', { type: 'number', min: '0', step: '0.1', placeholder: 'e.g. 25' })}
          <div className="dash-field">
            <label htmlFor="af-grade">Quality / Grade</label>
            <select id="af-grade" value={form.grade} onChange={set('grade')}>
              {GRADES.map((g) => <option key={g} value={g}>{g || 'Any grade'}</option>)}
            </select>
          </div>
          {field('availabilityDate', 'Available from', { type: 'date' })}
        </div>
        <div className="dash-field">
          <label htmlFor="af-notes">Notes</label>
          <textarea id="af-notes" rows="2" value={form.notes} onChange={set('notes')} placeholder="Anything else from the WhatsApp chat" />
        </div>

        <div>
          <button type="submit" className="btn btn--primary">{hasProduce ? 'Save farmer & list produce' : 'Save farmer'}</button>
        </div>
      </form>

      <div className="dash-panel">
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-3)' }}>Farmers added by the team</h2>
        {farmers.length === 0 ? (
          <EmptyState icon="+" title="No farmers added yet" description="Farmers you add from WhatsApp messages will appear here." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Farmer</th><th>Contact</th><th>Location</th><th>Listings</th><th>Added</th><th style={{ textAlign: 'right' }}>Action</th></tr>
              </thead>
              <tbody>
                {farmers.map((f) => {
                  const digits = normalizePhone(f.phone);
                  return (
                    <tr key={f.id}>
                      <td><strong>{f.name}</strong>{f.notes ? <span className="admin-table__sub">{f.notes}</span> : null}</td>
                      <td>
                        <a href={`tel:+91${digits}`}>{f.phone}</a>
                        <span className="admin-table__sub">
                          <a href={`https://wa.me/91${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                        </span>
                      </td>
                      <td>{[f.village, f.taluk, f.district].filter(Boolean).join(', ') || '—'}</td>
                      <td>{listingCount[f.id] || 0}</td>
                      <td>{formatDateTime(f.createdAt)}</td>
                      <td>
                        <div className="admin-table__actions">
                          <button type="button" className="btn btn--sm btn--outline" onClick={() => fillFor(f)}>Add produce</button>
                          <button type="button" className="btn btn--sm btn--outline" onClick={() => remove(f)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="admin-table__sub" style={{ marginTop: 'var(--space-3)' }}>
          Saved in this browser for now. Listed produce appears on the home page and in the buyer dashboard here.
        </p>
      </div>
    </div>
  );
};

export default AdminAddFarmer;
