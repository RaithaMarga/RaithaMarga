import { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import { IconField, IconScale, IconHandshake, IconClock } from '../../components/dashboard/icons';
import '../../components/dashboard/dashboard-ui.css';

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Admin Overview', icon: '\u25A6', end: true },
];

const INITIAL_QUEUE = [
  {
    id: 'F-2094',
    name: 'Basavarajappa Gowda',
    village: 'Malur Taluk, Kolar',
    crop: 'Tomato (Sahu)',
    estQty: '2.5 tonnes',
    landRecord: 'RTC Verified #KA-08-4421',
    status: 'pending',
    date: 'Today, 09:30 AM',
  },
  {
    id: 'F-2095',
    name: 'Nanjunda Reddy',
    village: 'Bangarapet, Kolar',
    crop: 'Tomato (Abhinav)',
    estQty: '4.0 tonnes',
    landRecord: 'RTC Verified #KA-08-9822',
    status: 'pending',
    date: 'Today, 11:15 AM',
  },
  {
    id: 'B-1048',
    name: 'Kolar Agro Retailers LLP',
    village: 'APMC Yard, Kolar',
    crop: 'Wholesale Procurement',
    estQty: '₹50,000 Escrow Security',
    landRecord: 'GSTIN: 29AAACK7849M1ZP',
    status: 'pending',
    date: 'Yesterday, 04:45 PM',
  },
];

const AdminDashboard = () => {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved'

  const handleAction = (id, newStatus) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const pendingCount = queue.filter((q) => q.status === 'pending').length;

  return (
    <DashboardLayout
      role="Admin"
      navItems={ADMIN_NAV_ITEMS}
      profileName="District Officer (Kolar Pilot)"
      verificationStatus="verified"
    >
      <div className="dash-page">
        <div className="dash-page__header">
          <div>
            <span className="eyebrow" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Kolar District Pilot Authority · Mandi Ledger Administration
            </span>
            <h1 className="dash-page__title">RaithaMarga Administration Console</h1>
            <p className="dash-page__subtitle">
              Monitor active farmer listings, audit digital scale photo-proofs, and verify marketplace participants.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'var(--color-primary-tint)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-primary-dark)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              ● SYSTEM OPERATIONAL
            </span>
          </div>
        </div>

        {/* Top metrics */}
        <div className="stat-grid">
          <StatCard
            icon={<IconField />}
            label="Active Lots (Tomato)"
            value="64"
            caption="48.2 tonnes combined pool"
            accent="primary"
          />
          <StatCard
            icon={<IconScale />}
            label="Weighing Scale Proofs"
            value="98.4%"
            caption="Zero discrepancy rate this week"
            accent="gold"
          />
          <StatCard
            icon={<IconHandshake />}
            label="Verified Buyers"
            value="28"
            caption="Active across Bangalore & Kolar"
            accent="primary"
          />
          <StatCard
            icon={<IconClock />}
            label="Pending KYC / Audits"
            value={pendingCount}
            caption="Requires district sign-off"
            accent={pendingCount > 0 ? 'tomato' : 'primary'}
          />
        </div>

        {/* Verification Queue Section */}
        <div className="dash-panel" style={{ marginTop: 'var(--space-6)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 className="dash-panel__heading" style={{ margin: 0 }}>
                Verification & Approval Queue
              </h2>
              <p className="dash-panel__intro" style={{ margin: '4px 0 0' }}>
                Review incoming land records (RTC) and buyer escrow security deposits.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`btn btn--sm ${filter === 'all' ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setFilter('all')}
              >
                All Records
              </button>
              <button
                type="button"
                className={`btn btn--sm ${filter === 'pending' ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({pendingCount})
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid var(--color-border)',
                    color: 'var(--color-ink-soft)',
                  }}
                >
                  <th style={{ padding: '10px 12px' }}>ID / Type</th>
                  <th style={{ padding: '10px 12px' }}>Applicant</th>
                  <th style={{ padding: '10px 12px' }}>Location</th>
                  <th style={{ padding: '10px 12px' }}>Document / Proof</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue
                  .filter((q) => filter === 'all' || q.status === filter)
                  .map((item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: item.status === 'pending' ? 'var(--color-paper)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            background: item.id.startsWith('F')
                              ? 'var(--color-primary-tint)'
                              : 'var(--color-gold-tint)',
                            borderRadius: 'var(--radius-sm)',
                            color: item.id.startsWith('F')
                              ? 'var(--color-primary-dark)'
                              : 'var(--color-gold-dark)',
                          }}
                        >
                          {item.id}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>
                        <div>{item.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-ink-soft)' }}>
                          {item.crop} ({item.estQty})
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--color-ink-soft)' }}>{item.village}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {item.landRecord}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 600,
                            background:
                              item.status === 'approved'
                                ? 'var(--color-primary-tint)'
                                : item.status === 'rejected'
                                ? 'var(--color-tomato-tint)'
                                : 'var(--color-gold-tint)',
                            color:
                              item.status === 'approved'
                                ? 'var(--color-primary-dark)'
                                : item.status === 'rejected'
                                ? 'var(--color-tomato)'
                                : 'var(--color-gold-dark)',
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {item.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn--sm btn--primary"
                              style={{ padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                              onClick={() => handleAction(item.id, 'approved')}
                            >
                              ✓ Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn--sm btn--outline"
                              style={{ padding: '4px 10px', fontSize: 'var(--font-size-xs)', color: 'var(--color-tomato)' }}
                              onClick={() => handleAction(item.id, 'rejected')}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sm btn--outline"
                            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleAction(item.id, 'pending')}
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* District Pilot Configuration Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-6)',
          }}
        >
          <div className="dash-panel">
            <h3 className="dash-panel__heading" style={{ fontSize: 'var(--font-size-base)' }}>
              Kolar Pilot Parameters
            </h3>
            <p className="dash-panel__intro" style={{ fontSize: 'var(--font-size-xs)' }}>
              Configured scope for Phase 1 MVP deployment.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Target Crop:</span>
                <strong>Tomato (Solanum lycopersicum)</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>District:</span>
                <strong>Kolar, Karnataka</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Today's APMC Range:</span>
                <strong style={{ color: 'var(--color-primary)' }}>₹22.00 – ₹26.50 / kg</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Aggregation Radius:</span>
                <strong>12 km automated lot pooling</strong>
              </li>
            </ul>
          </div>

          <div className="dash-panel">
            <h3 className="dash-panel__heading" style={{ fontSize: 'var(--font-size-base)' }}>
              Weighing Proof Standards
            </h3>
            <p className="dash-panel__intro" style={{ fontSize: 'var(--font-size-xs)' }}>
              Photo verification criteria for zero dispute settlement.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Calibrated digital weighing scales only</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>GPS geotagged & timestamped photo uploads</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span>
                <span>Dual farmer-buyer sign-off on weighbridge receipts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
