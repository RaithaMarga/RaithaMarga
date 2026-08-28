import { useState } from 'react';
import { useFarmerData } from '../../context/FarmerDataContext';
import '../../components/dashboard/dashboard-ui.css';

const Profile = () => {
  const { profile, setProfile } = useFarmerData();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(form);
    setSaved(true);
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Profile</h1>
          <p className="dash-page__subtitle">Your details are shared with buyers once a deal is confirmed.</p>
        </div>
      </div>

      <form className="dash-panel dash-form" onSubmit={handleSubmit}>
        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" value={form.name} onChange={handleChange('name')} placeholder="e.g. Manjunath Gowda" />
          </div>
          <div className="dash-field">
            <label htmlFor="phone">Phone Number</label>
            <input id="phone" type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="e.g. 9876543210" />
          </div>
        </div>

        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="village">Village</label>
            <input id="village" type="text" value={form.village} onChange={handleChange('village')} />
          </div>
          <div className="dash-field">
            <label htmlFor="taluk">Taluk</label>
            <input id="taluk" type="text" value={form.taluk} onChange={handleChange('taluk')} />
          </div>
          <div className="dash-field">
            <label htmlFor="district">District</label>
            <input id="district" type="text" value={form.district} onChange={handleChange('district')} />
          </div>
        </div>

        <div className="dash-form__row">
          <div className="dash-field">
            <label htmlFor="state">State</label>
            <input id="state" type="text" value={form.state} onChange={handleChange('state')} />
          </div>
          <div className="dash-field">
            <label htmlFor="pincode">Pincode</label>
            <input id="pincode" type="text" value={form.pincode} onChange={handleChange('pincode')} />
          </div>
          <div className="dash-field">
            <label htmlFor="landSize">Land Size (acres)</label>
            <input id="landSize" type="number" min="0" step="0.1" value={form.landSizeAcres} onChange={handleChange('landSizeAcres')} />
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

        {saved && (
          <p role="status" style={{ color: 'var(--color-primary-dark)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Profile saved.
          </p>
        )}

        <div className="dash-form__actions">
          <button type="submit" className="btn btn--primary">Save Profile</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
