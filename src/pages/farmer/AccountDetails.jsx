import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import VerificationNotice from '../../components/dashboard/VerificationNotice';
import { verificationKey } from '../../lib/verification';
import '../../components/dashboard/dashboard-ui.css';

const Row = ({ label, value }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value || value === 0 ? value : <span className="account-grid__empty">Not added</span>}</dd>
  </div>
);

export default function AccountDetails() {
  const { user } = useAuth();
  const { profile } = useFarmerData();
  // The backend copy is the source of truth; the browser copy fills in what it does not store.
  const backend = user?.profile || {};
  const status = verificationKey(user) || 'pending';

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Account Details</h1>
          <p className="dash-page__subtitle">The details RaithaMarga has for your farmer account.</p>
        </div>
        <Link to="/farmer/dashboard/profile" className="btn btn--primary btn--sm">Edit profile</Link>
      </div>

      <VerificationNotice user={user} role="farmer" />

      <div className="dash-panel">
        <h2 className="dash-panel__heading">Account</h2>
        <dl className="account-grid">
          <Row label="Name" value={user?.name || backend.fullName || profile.name} />
          <Row label="Email" value={user?.email} />
          <Row label="Phone" value={profile.phone} />
          <div>
            <dt>Account status</dt>
            <dd><StatusBadge status={status} /></dd>
          </div>
        </dl>
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">Farm</h2>
        <dl className="account-grid">
          <Row label="Village" value={backend.village || profile.village} />
          <Row label="Taluk" value={backend.taluk || profile.taluk} />
          <Row label="District" value={backend.district || profile.district} />
          <Row label="State" value={backend.state || profile.state} />
          <Row label="Pincode" value={profile.pincode} />
          <Row label="Land size (acres)" value={backend.landAcres ?? profile.landSizeAcres} />
          <Row label="Usual crops" value={profile.preferredCrops} />
        </dl>
        <p className="dash-panel__intro" style={{ marginTop: 'var(--space-4)' }}>
          Phone, pincode and usual crops are saved on this device only for now.
        </p>
      </div>
    </div>
  );
}
