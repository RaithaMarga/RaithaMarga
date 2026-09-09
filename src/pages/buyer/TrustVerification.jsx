import { useMemo } from 'react';
import { useBuyerData } from '../../context/BuyerDataContext';
import { useFarmerVerification } from '../../hooks/useSharedFarmerData';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import { IconShieldCheck } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const BADGE_MEANINGS = [
  { status: 'verified', text: "RaithaMarga has confirmed this farmer's ID, land record and bank details." },
  { status: 'pending', text: 'Documents submitted and awaiting RaithaMarga review.' },
  { status: 'needs_attention', text: 'A submitted document needs to be corrected or re-uploaded.' },
  { status: 'not_submitted', text: "This farmer hasn't submitted verification documents yet." },
];

const TrustVerification = () => {
  const { requests } = useBuyerData();
  const farmerVerification = useFarmerVerification();

  // In this frontend-only MVP, every listing belongs to the single
  // farmer whose data lives in this browser, so we can show one
  // consolidated card. Once there's a backend with many farmers, this
  // becomes a per-farmer lookup keyed off each request's listing.
  const contactedFarmers = useMemo(
    () => (requests.length > 0 ? [{ id: 'farmer', verification: farmerVerification }] : []),
    [requests.length, farmerVerification]
  );

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Trust & Verification</h1>
          <p className="dash-page__subtitle">What our verification badges mean, and who you've contacted.</p>
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading">What the badges mean</h2>
        <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          {BADGE_MEANINGS.map((b) => (
            <div key={b.status} className="doc-row">
              <StatusBadge status={b.status} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-ink-soft)', flex: 1 }}>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dash-panel">
        <h2 className="dash-panel__heading" style={{ marginBottom: 'var(--space-4)' }}>
          Farmers you've contacted
        </h2>
        {contactedFarmers.length === 0 ? (
          <EmptyState
            icon={<IconShieldCheck />}
            title="No farmers contacted yet"
            description="Once you express interest in a listing, that farmer's verification status will appear here."
          />
        ) : (
          contactedFarmers.map((f) => (
            <div key={f.id} className="doc-row">
              <span style={{ fontWeight: 600 }}>Farmer on your recent requests</span>
              <StatusBadge status={f.verification.status} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrustVerification;
