import { useState, useEffect, useMemo } from 'react';
import { useBuyerData } from '../../context/BuyerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import EmptyState from '../../components/dashboard/EmptyState';
import { IconShieldCheck } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const API_BASE = 'http://localhost:5000/api';

const BADGE_MEANINGS = [
  { status: 'verified', text: "RaithaMarga has confirmed this farmer's ID, land record (RTC 7-12) and bank details." },
  { status: 'pending', text: 'Documents submitted and awaiting RaithaMarga APMC review.' },
  { status: 'needs_attention', text: 'A submitted document needs to be corrected or re-uploaded.' },
  { status: 'not_submitted', text: "This farmer hasn't submitted verification documents yet." },
];

const TrustVerification = () => {
  const { requests } = useBuyerData();
  const [networkFarmers, setNetworkFarmers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/farmers`)
      .then((r) => r.json())
      .then((data) => {
        if (data.farmers) setNetworkFarmers(data.farmers);
      })
      .catch(() => {});
  }, []);

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
          Registered Farmers in Your APMC Trading Network
        </h2>
        {networkFarmers.length === 0 ? (
          <EmptyState
            icon={<IconShieldCheck />}
            title="No farmers registered yet"
            description="Verified farmers in your district network will appear here."
          />
        ) : (
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {networkFarmers.map((f) => (
              <div key={f.id || f.userId} className="doc-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>{f.name}</span>
                  <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-ink-soft)' }}>
                    {f.village ? `${f.village}, ` : ''}{f.district || 'Kolar'} &bull; {f.land_acres ? `${f.land_acres} Acres` : 'Producer'}
                  </span>
                </div>
                <StatusBadge status={f.verification_status || 'pending'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrustVerification;
